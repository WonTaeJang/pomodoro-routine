import { getAudio, unlockAudio } from "@/lib/audio";
import { seededRandom } from "@/lib/random";
import { loopSeamlessly, normalize } from "./noise";
import {
  FOCUS_SOUNDS,
  type FocusSoundId,
  type RecordedSound,
  type SynthSound,
} from "./sounds";

/**
 * 집중 소리 재생. "지금 들려야 할 소리"를 받아 그 상태로 맞춥니다.
 * 켜고 끌 때는 서서히, 소리를 바꿀 때는 겹치며 바뀝니다.
 */

/** 서서히 켜고 끄는 빠르기 (초. 값의 약 3배 시간이면 거의 다 바뀜) */
const FADE_IN = 0.5;
const FADE_OUT = 0.3;
/** 꺼진 소리를 실제로 멈추기까지 기다리는 시간 (초) */
const STOP_AFTER = 1.5;
/** 노이즈 반복 이음매를 겹치는 길이 (초) */
const LOOP_FADE = 0.5;
/** 모든 소리를 같은 크기로 맞추는 기준 */
const TARGET_RMS = 0.2;
/** 미리 듣기 길이 (ms) */
const PREVIEW_MS = 4000;

type Target = { id: FocusSoundId; volume: number };
type Playing = {
  id: FocusSoundId;
  source: AudioBufferSourceNode;
  gain: GainNode;
};

let wanted: Target | null = null;
let preview: Target | null = null;
let previewTimer: ReturnType<typeof setTimeout> | null = null;
let playing: Playing | null = null;
const buffers = new Map<FocusSoundId, AudioBuffer>();
const loading = new Set<FocusSoundId>();

/** "소리가 나오는 중"이 바뀌면 알릴 곳 (헤더 버튼의 재생 표시) */
const listeners = new Set<() => void>();
let audible = false;
let watchedAudio: AudioContext | null = null;

/** 재생 상태나 오디오 상태가 바뀔 때마다 불러서, 실제로 들리는지가 달라졌으면 알립니다. */
function updateAudible() {
  const next = playing !== null && getAudio()?.state === "running";
  if (next === audible) return;
  audible = next;
  listeners.forEach((listener) => listener());
}

/** 지금 집중 소리가 실제로 나오는 중인지 (서서히 꺼지기 시작하면 바로 false) */
export function isFocusSoundPlaying(): boolean {
  return audible;
}

export function subscribeFocusSoundPlaying(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 노이즈를 만듭니다. (양쪽 귀에 조금 다른 소리를 넣어 넓게 들리게) */
function makeSynth(ctx: AudioContext, sound: SynthSound): AudioBuffer {
  const rate = ctx.sampleRate;
  const fade = Math.round(LOOP_FADE * rate);
  const length = Math.round(sound.seconds * rate);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const raw = sound.generate(length + fade, seededRandom(channel + 1));
    normalize(raw, TARGET_RMS);
    buffer.copyToChannel(loopSeamlessly(raw, fade), channel);
  }
  return buffer;
}

/** 녹음 파일을 받아 끝과 처음을 겹쳐 잇습니다. */
async function loadRecording(
  ctx: AudioContext,
  sound: RecordedSound,
): Promise<AudioBuffer> {
  const response = await fetch(sound.src);
  if (!response.ok) throw new Error(`${sound.src}: ${response.status}`);
  const decoded = await ctx.decodeAudioData(await response.arrayBuffer());
  const fade = Math.round(sound.fade * decoded.sampleRate);
  const buffer = ctx.createBuffer(
    decoded.numberOfChannels,
    decoded.length - fade,
    decoded.sampleRate,
  );
  for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
    buffer.copyToChannel(
      loopSeamlessly(decoded.getChannelData(channel), fade),
      channel,
    );
  }
  return buffer;
}

/**
 * 녹음은 풀어 두면 1분에 약 20MB라, 지금 쓰는 것 하나만 남기고 메모리에서 지웁니다.
 * (다시 고르면 브라우저에 받아 둔 파일로 다시 풂)
 */
function forgetOtherRecordings(keep: FocusSoundId) {
  for (const id of buffers.keys()) {
    const recording = FOCUS_SOUNDS[id].kind === "recording";
    if (recording && id !== keep && id !== playing?.id) buffers.delete(id);
  }
}

/**
 * 재생할 소리. 녹음 파일은 처음 고를 때 받기 시작하고, 받는 동안은 null을 돌려줍니다.
 * (다 받으면 다시 맞춰서 재생을 시작함)
 */
function getBuffer(ctx: AudioContext, id: FocusSoundId): AudioBuffer | null {
  const cached = buffers.get(id);
  if (cached) return cached;
  const sound = FOCUS_SOUNDS[id];
  if (sound.kind === "synth") {
    const buffer = makeSynth(ctx, sound);
    buffers.set(id, buffer);
    return buffer;
  }
  if (!loading.has(id)) {
    loading.add(id);
    loadRecording(ctx, sound)
      .then((buffer) => {
        buffers.set(id, buffer);
        forgetOtherRecordings(id);
        // 받는 동안 미리 듣기 시간이 지나가지 않게, 소리가 나는 때부터 다시 셈
        if (preview?.id === id) startPreviewTimer();
        apply();
      })
      // 받지 못하면(오프라인 등) 소리 없이 지나가고, 다음에 고를 때 다시 받음
      .catch(() => {})
      .finally(() => loading.delete(id));
  }
  return null;
}

function fadeOut(ctx: AudioContext, node: Playing) {
  node.gain.gain.setTargetAtTime(0, ctx.currentTime, FADE_OUT);
  node.source.stop(ctx.currentTime + STOP_AFTER);
}

/** 소리를 지금 들려야 할 상태로 맞추고, 들리는지 여부를 알립니다. */
function apply() {
  const ctx = getAudio();
  if (!ctx) return;
  // 브라우저가 오디오를 막거나(새로고침 직후) 멈추면(다른 앱에 다녀옴) 재생 표시도 따라가게
  if (watchedAudio !== ctx) {
    watchedAudio = ctx;
    ctx.addEventListener("statechange", updateAudible);
  }
  syncPlayback(ctx);
  updateAudible();
}

function syncPlayback(ctx: AudioContext) {
  const target = wanted ?? preview;
  const level = target ? target.volume * FOCUS_SOUNDS[target.id].level : 0;

  if (playing && playing.id === target?.id) {
    playing.gain.gain.setTargetAtTime(level, ctx.currentTime, FADE_IN);
    return;
  }
  if (playing) fadeOut(ctx, playing);
  playing = null;
  if (!target) return;
  const buffer = getBuffer(ctx, target.id);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(level, ctx.currentTime, FADE_IN);
  source.connect(gain).connect(ctx.destination);
  source.start();
  playing = { id: target.id, source, gain };
}

/** 지금 들려야 할 소리 (집중 중이 아니거나 끄기면 null) */
export function setFocusSound(target: Target | null) {
  wanted = target;
  apply();
}

/**
 * 오디오를 깨운 뒤 다시 맞춥니다. 새로고침 뒤 처음 누를 때, 다른 탭에서 돌아왔을 때
 * (아이폰은 다른 앱에 다녀오면 소리가 멈춰 있을 수 있어 다시 깨움)
 */
export function resumeFocusSound() {
  if (!wanted && !preview) return;
  unlockAudio();
  apply();
}

function startPreviewTimer() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(stopPreview, PREVIEW_MS);
}

/** 고른 소리를 잠깐 들려줍니다. 버튼을 누른 순간에 불러야 소리가 납니다. */
export function previewFocusSound(id: FocusSoundId, volume: number) {
  unlockAudio();
  preview = { id, volume };
  startPreviewTimer();
  apply();
}

/** 미리 듣는 중이면 크기만 바꿉니다. (크기 막대를 움직일 때) */
export function setPreviewVolume(volume: number) {
  if (!preview) return;
  preview = { ...preview, volume };
  apply();
}

/** 미리 듣기를 멈춥니다. (끄기를 골랐을 때) */
export function stopPreview() {
  if (previewTimer) clearTimeout(previewTimer);
  preview = null;
  previewTimer = null;
  apply();
}
