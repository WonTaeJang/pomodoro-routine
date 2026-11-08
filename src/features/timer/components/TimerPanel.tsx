"use client";

import { PawIcon } from "@/components/icons";
import { Card, VisuallyHidden } from "@/components/ui";
import { useTasksStore } from "@/features/tasks/store";
import { cx } from "@/lib/cx";
import { useNow } from "@/lib/useNow";
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
  const activeTask = useTasksStore((s) =>
    s.tasks.find((t) => t.id === s.activeTaskId),
  );
  const now = useNow();

  const remainingMs =
    now === null ? timer.remainingMs : getRemainingMs(timer, now);
  const timeText = ready ? formatRemaining(remainingMs) : "--:--";
  // 집중 중 고른 할 일이 있으면 상태 문구 대신 할 일을 보여줌 (멈췄을 때는 멈춘 상태가 더 중요)
  const showTask =
    ready && activeTask && timer.mode === "focus" && timer.status !== "paused";

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
      {showTask ? (
        <p className={styles.status}>
          <span className={styles.task} title={activeTask.title}>
            <PawIcon size={14} />
            <VisuallyHidden>지금 할 일</VisuallyHidden>
            <span className={styles.taskTitle}>{activeTask.title}</span>
          </span>
        </p>
      ) : (
        <p className={styles.status}>
          {getStatusMessage(timer.mode, timer.status)}
        </p>
      )}

      <TimerControls
        mode={timer.mode}
        status={timer.status}
        disabled={!ready}
      />

      <CycleProgress
        mode={timer.mode}
        completedInCycle={timer.completedInCycle}
        interval={interval}
      />
    </Card>
  );
}
