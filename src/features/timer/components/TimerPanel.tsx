"use client";

import { Card } from "@/components/ui";
import { getTodayFocus, useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { cx } from "@/lib/cx";
import { useNow } from "@/lib/useNow";
import { useCompleteWhenDue, useTimerTitle } from "../hooks";
import { getStatusMessage } from "../labels";
import { useTimerStore } from "../store";
import { formatRemaining, getRemainingMs } from "../timer";
import { CycleProgress } from "./CycleProgress";
import { KkamiPhoto } from "./KkamiPhoto";
import { ModeSwitcher } from "./ModeSwitcher";
import { TimerControls } from "./TimerControls";
import { TimerRing } from "./TimerRing";
import styles from "./TimerPanel.module.scss";

type TimerPanelProps = {
  /** 저장된 값을 불러오기 전이면 false. 그동안은 시간을 숨기고 버튼을 막습니다. */
  ready: boolean;
};

/** 타이머 카드: 모드 탭, 까미 사진과 진행 띠, 남은 시간, 버튼, 사이클 진행 */
export function TimerPanel({ ready }: TimerPanelProps) {
  const timer = useTimerStore((s) => s.timer);
  const interval = useTimerStore((s) => s.settings.longBreakInterval);
  const ringEffects = useTimerStore((s) => s.settings.ringEffects);
  const lastCompleted = useTimerStore((s) => s.lastCompleted);
  const sessions = useHistoryStore((s) => s.sessions);
  const activeTask = useTasksStore((s) =>
    s.tasks.find((t) => t.id === s.activeTaskId),
  );
  const now = useNow();

  const remainingMs =
    now === null ? timer.remainingMs : getRemainingMs(timer, now);
  const timeText = ready ? formatRemaining(remainingMs) : "--:--";
  const todayCycles =
    ready && now !== null ? getTodayFocus(sessions, now).cycles : 0;

  useCompleteWhenDue(timer, now);
  useTimerTitle(ready, timer, timeText);

  return (
    <Card
      as="section"
      padding="none"
      className={styles.panel}
      aria-label="타이머"
    >
      <ModeSwitcher mode={timer.mode} status={timer.status} />

      <div className={styles.kkami}>
        <TimerRing
          ready={ready}
          running={timer.status === "running"}
          remainingMs={remainingMs}
          durationMs={timer.durationMs}
          effects={ringEffects}
          celebrateKey={
            lastCompleted?.mode === "focus" ? lastCompleted.endedAt : null
          }
          bigCelebration={lastCompleted?.cycleCompleted === true}
        >
          <KkamiPhoto mode={timer.mode} status={timer.status} />
        </TimerRing>
      </div>

      <p
        className={cx(styles.time, !ready && styles.timeLoading)}
        aria-live="off"
      >
        {timeText}
      </p>
      <p className={styles.status}>
        {getStatusMessage(timer.mode, timer.status)}
      </p>
      {ready && activeTask && timer.mode === "focus" ? (
        <p className={styles.currentTask}>
          지금 할 일 <strong>{activeTask.title}</strong>
        </p>
      ) : null}

      <TimerControls
        mode={timer.mode}
        status={timer.status}
        disabled={!ready}
      />

      <CycleProgress
        mode={timer.mode}
        completedInCycle={timer.completedInCycle}
        interval={interval}
        todayCycles={todayCycles}
      />
    </Card>
  );
}
