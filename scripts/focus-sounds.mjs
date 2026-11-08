// 집중 소리 녹음 파일 만들기: design/sound/의 원본(저장소에 없음)을 잘라 public/sounds/에 저장합니다.
// 필요한 것: ffmpeg (맥: brew install ffmpeg)
// 실행: node scripts/focus-sounds.mjs [원본 폴더]
//
// 하는 일 (소리마다 아래 SOUNDS 값대로)
// 1. 고르게 이어지는 구간을 자름 (반복 길이 + 이음매 겹칠 길이). 이음매는 앱이 재생할 때 겹쳐서 이음
// 2. 아주 낮은 울림을 걸러내고, 양쪽 귀(스테레오)로 맞춤
// 3. 모든 소리를 같은 크기(LUFS)로 맞춤
// 4. AAC(.m4a)로 압축 (모든 브라우저에서 재생)

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import recordings from "../src/features/focus-sound/recordings.json" with { type: "json" };

const SOURCE_DIR = process.argv[2] ?? "design/sound";
const OUT_DIR = "public/sounds";

/** 모든 소리를 맞추는 크기 (LUFS) */
const LOUDNESS = -20;
const BITRATE = "96k";
const SAMPLE_RATE = 48000;

/**
 * 소리마다 자를 구간과 다듬을 값. 앱도 같은 파일을 읽어 이음매 길이(fade)를 씁니다.
 * id: 앱의 소리 id (public/sounds/<id>.m4a로 저장)
 * source: design/sound/의 원본 파일
 * start, loop, fade: 자를 시작 위치, 반복 길이, 이음매를 겹칠 길이 (초)
 * lowCut: 이보다 낮은 소리를 걸러냄 (Hz)
 */
const SOUNDS = recordings;

/** ffmpeg 실행. 실패하면 멈추고, 결과 로그(stderr)를 돌려줌 */
function ffmpeg(args) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", ...args], {
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stderr;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const s of SOUNDS) {
  const input = [
    "-ss",
    String(s.start),
    "-t",
    String(s.loop + s.fade),
    "-i",
    join(SOURCE_DIR, s.source),
  ];
  const clean = `highpass=f=${s.lowCut},aformat=channel_layouts=stereo,aresample=${SAMPLE_RATE}`;
  const target = `loudnorm=I=${LOUDNESS}:TP=-1:LRA=20`;

  // 1차: 크기 재기
  const log = ffmpeg([
    ...input,
    "-af",
    `${clean},${target}:print_format=json`,
    "-f",
    "null",
    "-",
  ]);
  const m = JSON.parse(
    log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1),
  );

  // 2차: 잰 값으로 전체를 같은 비율만큼 키우거나 줄여서(linear) 소리 결은 그대로 두고 크기만 맞춤
  const measured = `measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  const out = join(OUT_DIR, `${s.id}.m4a`);
  ffmpeg([
    "-y",
    ...input,
    "-af",
    `${clean},${target}:${measured}`,
    "-ar",
    String(SAMPLE_RATE),
    "-c:a",
    "aac",
    "-b:a",
    BITRATE,
    "-movflags",
    "+faststart",
    out,
  ]);
  console.log(`${out}  (${s.loop}초 반복, 원본 크기 ${m.input_i} LUFS)`);
}
