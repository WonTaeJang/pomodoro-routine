import type {
  CompletedSession,
  TimerSettings,
  TimerState,
} from "@/features/timer/types";
import {
  alertKindForSession,
  getUpcomingAlert,
  type AlertKind,
} from "./alerts";

/**
 * 스케줄러가 바깥(현재 시각, 타이머, 소리, 브라우저 알림)과 만나는 통로.
 * 실제 화면에서는 브라우저 기능을, 테스트에서는 가짜를 끼워 넣습니다.
 */
export type AlertEnv = {
  /** 현재 시각(epoch ms) */
  now(): number;
  getState(): { timer: TimerState; settings: TimerSettings };
  /** 끝난 세션을 처리하라고 타이머에 알림 */
  sync(): void;
  sound: {
    /** 오디오 시계(초). 오디오를 아직 깨우지 않았으면 null */
    clock(): number | null;
    /** 오디오가 지금 소리를 낼 수 있는지 (멈춰 있으면 예약한 소리도 울리지 않음) */
    isRunning(): boolean;
    /** 오디오 시계 time(초)에 소리를 예약. 아직 시작하지 않은 소리를 취소하는 함수를 돌려줌 */
    schedule(kind: AlertKind, time: number): () => void;
    setVolume(volume: number): void;
  };
  /** 브라우저 알림 띄우기 */
  notify(kind: AlertKind): void;
  /** 탭이 숨겨져 있는지 */
  isHidden(): boolean;
  /** 이 탭이 소리와 알림을 낼 탭인지 (탭을 여러 개 열면 한 탭만) */
  isSoundTab(): boolean;
  /** 한 번만 실행되는 타이머 */
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(id: unknown): void;
};

type Scheduled = {
  /** 다시 예약할지 판단하는 값 (끝나는 시각, 종류, 소리·알림 설정) */
  key: string;
  /** 세션이 끝나는 시각(epoch ms) */
  at: number;
  /** 예약한 소리의 시작 시각(오디오 시계). 소리를 예약하지 않았으면 null */
  soundStart: number | null;
  cancelSound: (() => void) | null;
  timerId: unknown;
};

/** 소리가 예약 시각 직전이어도 "이미 울리는 중"으로 볼 여유(초) */
const PLAYING_TOLERANCE = 0.1;

/**
 * 세션이 끝날 때의 소리와 브라우저 알림을 관리합니다.
 *
 * - plan(): 진행 중인 세션이 끝나는 시각에 맞춰 소리를 미리 예약하고(오디오 시계는 숨긴 탭에서도 정확),
 *   그 시각에 한 번만 실행되는 타이머로 세션을 넘깁니다. 상태가 바뀔 때마다 부르면 필요할 때만 다시 예약합니다.
 * - onComplete(): 세션이 끝난 걸 확인하면, 예약한 소리가 울리지 않았을 때만 그 자리에서 울리고
 *   탭이 숨겨져 있으면 브라우저 알림을 띄웁니다. 같은 세션에 두 번 울리거나 알리지 않습니다.
 * - dispose(): 아직 울리지 않은 예약을 모두 취소합니다.
 */
export function createAlertScheduler(env: AlertEnv) {
  let scheduled: Scheduled | null = null;
  const soundPlayed = new Set<number>(); // 소리를 낸 세션 (끝나는 시각)
  const notified = new Set<number>(); // 알림을 처리한 세션

  function soundHasStarted(soundStart: number | null): boolean {
    const clock = env.sound.clock();
    return (
      soundStart !== null &&
      clock !== null &&
      env.sound.isRunning() &&
      clock >= soundStart - PLAYING_TOLERANCE
    );
  }

  function cancelScheduled() {
    if (!scheduled) return;
    env.clearTimer(scheduled.timerId);
    // 이미 울리기 시작한 소리는 끝까지 둠 (세션이 막 끝나 상태가 바뀐 경우)
    if (!soundHasStarted(scheduled.soundStart)) scheduled.cancelSound?.();
    scheduled = null;
  }

  function plan(force = false) {
    const { timer, settings } = env.getState();
    env.sound.setVolume(settings.soundVolume);

    const upcoming = getUpcomingAlert(timer, settings);
    const soundTab = env.isSoundTab();
    const key = upcoming
      ? `${upcoming.at}:${upcoming.kind}:${settings.soundEnabled}:${settings.notificationsEnabled}:${soundTab}`
      : null;
    if (!force && key === (scheduled?.key ?? null)) return;

    cancelScheduled();
    if (!upcoming || key === null) return;

    const delayMs = Math.max(0, upcoming.at - env.now());
    const clock = env.sound.clock();
    let soundStart: number | null = null;
    let cancelSound: (() => void) | null = null;
    // 세션을 넘기는 타이머는 모든 탭에 두고, 소리는 소리를 낼 탭에서만 예약
    if (
      soundTab &&
      settings.soundEnabled &&
      clock !== null &&
      !soundPlayed.has(upcoming.at)
    ) {
      soundStart = clock + delayMs / 1000;
      cancelSound = env.sound.schedule(upcoming.kind, soundStart);
    }

    const timerId = env.setTimer(() => env.sync(), delayMs);
    scheduled = { key, at: upcoming.at, soundStart, cancelSound, timerId };
  }

  function onComplete(session: CompletedSession) {
    if (!env.isSoundTab()) return;
    const at = session.endedAt;
    const kind = alertKindForSession(session);
    const { settings } = env.getState();

    if (settings.soundEnabled && !soundPlayed.has(at)) {
      soundPlayed.add(at);
      const mine = scheduled?.at === at ? scheduled : null;
      if (!soundHasStarted(mine?.soundStart ?? null)) {
        mine?.cancelSound?.(); // 늦게 울릴 예약은 지우고 지금 울림
        const clock = env.sound.clock();
        if (clock !== null) env.sound.schedule(kind, clock);
      }
    }

    if (settings.notificationsEnabled && !notified.has(at)) {
      notified.add(at);
      // 화면을 보고 있으면 완료 팝업으로 충분하므로 브라우저 알림은 숨긴 탭일 때만
      if (env.isHidden()) env.notify(kind);
    }
  }

  return { plan, onComplete, dispose: cancelScheduled };
}
