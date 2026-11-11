import { beforeEach, describe, expect, it, vi } from "vitest";

/** 테스트용 가짜 오디오: 소리는 내지 않고 상태(state)와 상태 변화 알림만 흉내 냄 */
function fakeAudio() {
  const stateListeners = new Set<() => void>();
  const param = { value: 0, setTargetAtTime: vi.fn() };
  const ctx = {
    state: "running",
    sampleRate: 8000,
    currentTime: 0,
    destination: {},
    createBuffer: (channels: number, length: number) => ({
      numberOfChannels: channels,
      length,
      copyToChannel: vi.fn(),
    }),
    createBufferSource: () => ({
      buffer: null,
      loop: false,
      connect: (node: unknown) => node,
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({ gain: param, connect: (node: unknown) => node }),
    addEventListener: (_type: string, listener: () => void) =>
      stateListeners.add(listener),
  };
  const setState = (state: "running" | "suspended") => {
    ctx.state = state;
    stateListeners.forEach((listener) => listener());
  };
  return { ctx, setState };
}

let audio: ReturnType<typeof fakeAudio>;
let unlocked: boolean;

vi.mock("@/lib/audio", () => ({
  getAudio: () => (unlocked ? audio.ctx : null),
  unlockAudio: () => {
    unlocked = true;
    return audio.ctx;
  },
}));

async function loadPlayer() {
  vi.resetModules();
  return import("./player");
}

beforeEach(() => {
  audio = fakeAudio();
  unlocked = true;
});

describe("isFocusSoundPlaying", () => {
  it("소리를 틀면 true, 끄면(서서히 꺼지기 시작하면) 바로 false", async () => {
    const player = await loadPlayer();
    const changed = vi.fn();
    player.subscribeFocusSoundPlaying(changed);
    expect(player.isFocusSoundPlaying()).toBe(false);

    player.setFocusSound({ id: "white", volume: 0.5 });
    expect(player.isFocusSoundPlaying()).toBe(true);
    // 크기만 바꾸면 다시 알리지 않음
    player.setFocusSound({ id: "white", volume: 0.8 });
    expect(changed).toHaveBeenCalledTimes(1);

    player.setFocusSound(null);
    expect(player.isFocusSoundPlaying()).toBe(false);
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it("미리 듣기 중에도 true", async () => {
    const player = await loadPlayer();
    player.previewFocusSound("pink", 0.5);
    expect(player.isFocusSoundPlaying()).toBe(true);
    player.stopPreview();
    expect(player.isFocusSoundPlaying()).toBe(false);
  });

  it("오디오를 아직 깨우지 않았으면(새로고침 직후) false, 깨우면 true", async () => {
    unlocked = false;
    const player = await loadPlayer();
    player.setFocusSound({ id: "white", volume: 0.5 });
    expect(player.isFocusSoundPlaying()).toBe(false);

    player.resumeFocusSound();
    expect(player.isFocusSoundPlaying()).toBe(true);
  });

  it("브라우저가 오디오를 멈추면 false, 다시 돌면 true", async () => {
    const player = await loadPlayer();
    player.setFocusSound({ id: "white", volume: 0.5 });
    audio.setState("suspended");
    expect(player.isFocusSoundPlaying()).toBe(false);
    audio.setState("running");
    expect(player.isFocusSoundPlaying()).toBe(true);
  });
});
