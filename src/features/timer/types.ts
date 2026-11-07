/** 타이머 모드 */
export type TimerMode = "focus" | "short-break" | "long-break";

/** idle: 시작 전 / running: 진행 중 / paused: 일시정지 */
export type TimerStatus = "idle" | "running" | "paused";

export type TimerSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** 집중을 몇 번 완료하면 긴 휴식인지 */
  longBreakInterval: number;
  /** 집중이 끝나면 휴식을 자동으로 시작 */
  autoStartBreaks: boolean;
  /** 휴식이 끝나면 집중을 자동으로 시작 */
  autoStartFocus: boolean;
  /** 세션이 끝날 때 소리 */
  soundEnabled: boolean;
  /** 소리 크기 0~1 */
  soundVolume: number;
  /** 다른 탭에 있을 때 브라우저 알림 */
  notificationsEnabled: boolean;
  /** 진행 띠의 발자국 도장, 마지막 구간 빛, 완료 축하 효과 */
  ringEffects: boolean;
  /** 타이머가 도는 동안 화면이 꺼지지 않게 (Screen Wake Lock) */
  keepScreenOn: boolean;
  /**
   * 개발용 테스트 모드. 값이 있으면 모든 세션 길이를 이 초로 바꿉니다.
   * 개발 환경에서 주소에 ?test=5 를 붙이면 켜집니다.
   */
  testDurationSeconds?: number | null;
};

export type TimerState = {
  mode: TimerMode;
  status: TimerStatus;
  /** 지금 세션의 전체 길이(ms). 세션이 만들어질 때 정해짐 */
  durationMs: number;
  /** idle, paused일 때 남은 시간(ms) */
  remainingMs: number;
  /** running일 때 끝나는 시각(epoch ms). 그 외에는 null */
  endsAt: number | null;
  /** 이번 사이클에서 완료한 집중 횟수. 긴 휴식이 끝나면 0 */
  completedInCycle: number;
};

/** 끝까지 마친 세션 기록 */
export type CompletedSession = {
  mode: TimerMode;
  /** 끝난 시각(epoch ms) */
  endedAt: number;
  durationMs: number;
  /** 집중 세션이면, 그때 선택돼 있던 할 일 */
  taskId?: string;
  /** 이 집중으로 한 사이클(긴 휴식 주기만큼 집중)을 모두 마쳤으면 true */
  cycleCompleted?: boolean;
};

/** 상태를 바꾸는 함수의 결과. 이번에 완료된 세션이 있으면 completed에 담김 */
export type TimerTransition = {
  state: TimerState;
  completed: CompletedSession[];
};
