import { describe, expect, it } from "vitest";
import {
  AUTO_START_DELAY_MS,
  beginAutoStart,
  createInitialState,
  DEFAULT_SETTINGS,
  pause,
  start,
  sync,
} from "@/features/timer/timer";
import type { TimerSettings, TimerState } from "@/features/timer/types";
import type { AlertKind } from "./alerts";
import { createAlertScheduler } from "./scheduler";

const T0 = Date.UTC(2026, 10, 7, 9);
const SEC = 1000;
const MIN = 60 * SEC;

/** 가짜 시계, 오디오, 알림을 끼운 스케줄러 */
function setup(settingsPatch: Partial<TimerSettings> = {}) {
  const world = {
    now: T0,
    clock: 100 as number | null, // 오디오 시계(초). null이면 오디오를 아직 깨우지 않음
    audioRunning: true,
    hidden: false,
    soundTab: true, // 이 탭이 소리와 알림을 낼 탭인지
    syncs: 0,
    settings: { ...DEFAULT_SETTINGS, ...settingsPatch },
    timer: createInitialState(DEFAULT_SETTINGS) as TimerState,
    sounds: [] as { kind: AlertKind; time: number; cancelled: boolean }[],
    notifications: [] as AlertKind[],
    timers: new Map<number, { fn: () => void; at: number }>(),
  };
  let nextTimerId = 1;

  const scheduler = createAlertScheduler({
    now: () => world.now,
    getState: () => ({ timer: world.timer, settings: world.settings }),
    sync: () => world.syncs++,
    sound: {
      clock: () => world.clock,
      isRunning: () => world.audioRunning,
      schedule(kind, time) {
        const sound = { kind, time, cancelled: false };
        world.sounds.push(sound);
        return () => {
          sound.cancelled = true;
        };
      },
      setVolume: () => {},
    },
    notify: (kind) => world.notifications.push(kind),
    isHidden: () => world.hidden,
    isSoundTab: () => world.soundTab,
    setTimer(fn, ms) {
      const id = nextTimerId++;
      world.timers.set(id, { fn, at: world.now + ms });
      return id;
    },
    clearTimer: (id) => world.timers.delete(id as number),
  });

  /** 시간을 흐르게 하고, 그 사이 실행될 타이머를 실행 */
  function advance(ms: number) {
    world.now += ms;
    if (world.clock !== null && world.audioRunning) world.clock += ms / 1000;
    for (const [id, t] of world.timers) {
      if (t.at <= world.now) {
        world.timers.delete(id);
        t.fn();
      }
    }
  }

  /** 타이머 상태를 바꾸고 스케줄러에 알림 (실제 화면의 store 구독과 같은 순서) */
  function update(timer: TimerState) {
    world.timer = timer;
    scheduler.plan();
  }

  /** 세션 끝 처리: 타이머를 다음 세션으로 넘기고 완료를 알림 */
  function complete() {
    const result = sync(world.timer, world.settings, world.now);
    world.timer = result.state;
    for (const session of result.completed) scheduler.onComplete(session);
    scheduler.plan();
  }

  return { world, scheduler, advance, update, complete };
}

describe("예약", () => {
  it("시작하면 끝나는 시각에 맞춰 소리를 예약하고, 그 시각에 세션을 넘길 타이머를 건다", () => {
    const { world, update } = setup();
    update(start(world.timer, T0));
    expect(world.sounds).toEqual([
      { kind: "focus-end", time: 100 + 25 * 60, cancelled: false },
    ]);
    expect([...world.timers.values()].map((t) => t.at)).toEqual([
      T0 + 25 * MIN,
    ]);
  });

  it("상태가 같으면 다시 계획해도 예약을 새로 만들지 않는다", () => {
    const { world, scheduler, update } = setup();
    update(start(world.timer, T0));
    scheduler.plan();
    scheduler.plan();
    expect(world.sounds).toHaveLength(1);
    expect(world.timers.size).toBe(1);
  });

  it("끝나는 시각이 되면 타이머가 세션을 넘긴다 (숨긴 탭에서도 제때 처리)", () => {
    const { world, update, advance } = setup();
    update(start(world.timer, T0));
    advance(25 * MIN - SEC);
    expect(world.syncs).toBe(0);
    advance(SEC);
    expect(world.syncs).toBe(1);
  });

  it("소리를 끄면 소리는 예약하지 않고 타이머만 건다", () => {
    const { world, update } = setup({ soundEnabled: false });
    update(start(world.timer, T0));
    expect(world.sounds).toHaveLength(0);
    expect(world.timers.size).toBe(1);
  });

  it("오디오를 깨우기 전이면 소리 없이 예약하고, 깨운 뒤 다시 계획하면 남은 시간에 맞춰 소리를 예약한다", () => {
    const { world, scheduler, update, advance } = setup();
    world.clock = null;
    update(start(world.timer, T0));
    expect(world.sounds).toHaveLength(0);

    advance(10 * MIN);
    world.clock = 50;
    scheduler.plan(true);
    expect(world.sounds).toEqual([
      { kind: "focus-end", time: 50 + 15 * 60, cancelled: false },
    ]);
  });
});

describe("취소", () => {
  it("일시정지하면 아직 울리지 않은 소리와 타이머를 취소한다", () => {
    const { world, update, advance } = setup();
    update(start(world.timer, T0));
    advance(MIN);
    update(pause(world.timer, world.now));
    expect(world.sounds[0].cancelled).toBe(true);
    expect(world.timers.size).toBe(0);
  });

  it("이미 울리기 시작한 소리는 세션이 넘어가 상태가 바뀌어도 끊지 않는다", () => {
    const { world, update, advance, complete } = setup();
    update(start(world.timer, T0));
    advance(25 * MIN);
    complete();
    expect(world.sounds[0].cancelled).toBe(false);
  });
});

describe("완료 처리", () => {
  it("예약한 소리가 제때 울렸으면 다시 울리지 않는다", () => {
    const { world, update, advance, complete } = setup();
    update(start(world.timer, T0));
    advance(25 * MIN);
    complete();
    expect(world.sounds).toHaveLength(1);
  });

  it("오디오가 멈춰 있어 예약한 소리가 울리지 못했으면, 예약을 지우고 지금 울린다", () => {
    const { world, update, advance, complete } = setup();
    update(start(world.timer, T0));
    world.audioRunning = false; // 예: 휴대폰에서 오디오가 잠시 멈춤
    advance(25 * MIN);
    world.audioRunning = true;
    complete();
    expect(world.sounds).toHaveLength(2);
    expect(world.sounds[0].cancelled).toBe(true);
    expect(world.sounds[1]).toMatchObject({
      kind: "focus-end",
      time: world.clock,
    });
  });

  it("브라우저 알림은 탭이 숨겨져 있을 때만 띄운다", () => {
    const visible = setup();
    visible.update(start(visible.world.timer, T0));
    visible.advance(25 * MIN);
    visible.complete();
    expect(visible.world.notifications).toEqual([]);

    const hidden = setup();
    hidden.world.hidden = true;
    hidden.update(start(hidden.world.timer, T0));
    hidden.advance(25 * MIN);
    hidden.complete();
    expect(hidden.world.notifications).toEqual(["focus-end"]);
  });

  it("같은 세션은 완료를 여러 번 확인해도 소리와 알림이 한 번만 난다", () => {
    const { world, scheduler, update, advance } = setup();
    world.hidden = true;
    world.clock = null; // 미리 예약하지 못한 경우
    update(start(world.timer, T0));
    advance(25 * MIN);
    world.clock = 200;
    const session = {
      mode: "focus" as const,
      endedAt: T0 + 25 * MIN,
      durationMs: 25 * MIN,
    };
    scheduler.onComplete(session);
    scheduler.onComplete(session);
    expect(world.sounds).toHaveLength(1);
    expect(world.notifications).toEqual(["focus-end"]);
  });

  it("알림을 끄면 숨긴 탭이어도 알림을 띄우지 않는다", () => {
    const { world, update, advance, complete } = setup({
      notificationsEnabled: false,
    });
    world.hidden = true;
    update(start(world.timer, T0));
    advance(25 * MIN);
    complete();
    expect(world.notifications).toEqual([]);
  });

  it("자동 시작이면, 5초 카운트다운이 끝나 다음 세션이 시작될 때 그 끝 소리를 예약한다", () => {
    const { world, update, advance, complete } = setup({
      autoStartBreaks: true,
    });
    update(start(world.timer, T0));
    advance(25 * MIN);
    complete();
    // 완료 팝업이 보이는 동안은 다음 세션 소리를 예약하지 않음
    expect(world.sounds.map((s) => s.kind)).toEqual(["focus-end"]);
    update(beginAutoStart(world.timer, world.now));
    advance(AUTO_START_DELAY_MS);
    complete();
    expect(world.sounds.map((s) => s.kind)).toEqual(["focus-end", "break-end"]);
    expect(world.sounds[1].time).toBe(100 + 30 * 60 + 5);
  });
});

describe("탭 여러 개", () => {
  it("소리를 낼 탭이 아니면 소리와 알림 없이 세션을 넘길 타이머만 건다", () => {
    const { world, update, advance, complete } = setup();
    world.soundTab = false;
    world.hidden = true;
    update(start(world.timer, T0));
    expect(world.sounds).toHaveLength(0);
    expect(world.timers.size).toBe(1);
    advance(25 * MIN);
    expect(world.syncs).toBe(1);
    complete();
    expect(world.sounds).toHaveLength(0);
    expect(world.notifications).toEqual([]);
  });

  it("소리를 낼 탭이 바뀌면 예약한 소리를 옮긴다", () => {
    const { world, scheduler, update, advance } = setup();
    update(start(world.timer, T0));
    advance(10 * MIN);

    world.soundTab = false; // 다른 탭이 맡음
    scheduler.plan();
    expect(world.sounds.map((s) => s.cancelled)).toEqual([true]);

    world.soundTab = true; // 이 탭을 다시 누름
    scheduler.plan();
    expect(world.sounds[1]).toEqual({
      kind: "focus-end",
      time: 100 + 25 * 60,
      cancelled: false,
    });
  });
});
