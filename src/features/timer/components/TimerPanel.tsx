"use client";

import { useEffect, useState } from "react";
import {
  PauseIcon,
  PawIcon,
  PlayIcon,
  ResetIcon,
  SkipIcon,
} from "@/components/icons";
import { Button, Dialog, IconButton, SegmentedControl } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useTasksStore } from "@/features/tasks/store";
import { useNow } from "@/lib/useNow";
import { getStatusMessage, MODE_LABELS } from "../labels";
import { useTimerStore } from "../store";
import { formatRemaining, getRemainingMs } from "../timer";
import type { TimerMode } from "../types";
import { KkamiPhoto } from "./KkamiPhoto";
import styles from "./TimerPanel.module.scss";

const MODES: TimerMode[] = ["focus", "short-break", "long-break"];
const modeOptions = MODES.map((value) => ({
  value,
  label: MODE_LABELS[value],
}));

type TimerPanelProps = {
  /** 저장된 값을 불러오기 전이면 false. 그동안은 시간을 숨기고 버튼을 막습니다. */
  ready: boolean;
};

export function TimerPanel({ ready }: TimerPanelProps) {
  const timer = useTimerStore((s) => s.timer);
  const longBreakInterval = useTimerStore((s) => s.settings.longBreakInterval);
  const actions = useTimerStore.getState();
  const now = useNow();
  const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
  const activeTask = useTasksStore((s) =>
    s.tasks.find((t) => t.id === s.activeTaskId),
  );

  const remainingMs =
    now === null ? timer.remainingMs : getRemainingMs(timer, now);
  const timeText = ready ? formatRemaining(remainingMs) : "--:--";
  const running = timer.status === "running";

  // 시간이 다 되면 다음 세션으로
  useEffect(() => {
    if (
      running &&
      timer.endsAt !== null &&
      now !== null &&
      now >= timer.endsAt
    ) {
      useTimerStore.getState().sync();
    }
  }, [running, timer.endsAt, now]);

  // 브라우저 탭 제목에 남은 시간 표시
  useEffect(() => {
    document.title =
      ready && timer.status !== "idle"
        ? `${timeText} · ${MODE_LABELS[timer.mode]} | 까미도로`
        : "까미도로";
  }, [ready, timer.status, timer.mode, timeText]);

  function handleModeChange(mode: TimerMode) {
    if (mode === timer.mode) return;
    // 진행 중이거나 멈춘 세션이 있으면 한 번 확인
    if (timer.status !== "idle") {
      setPendingMode(mode);
      return;
    }
    actions.switchMode(mode);
  }

  const cycleDone = Math.min(timer.completedInCycle, longBreakInterval);
  const cycleLeft = longBreakInterval - cycleDone;
  const cycleText =
    timer.mode === "long-break"
      ? "긴 휴식 시간이에요"
      : cycleLeft === 0
        ? "이번 휴식은 긴 휴식이에요"
        : `긴 휴식까지 ${cycleLeft}번 남았어요`;

  return (
    <section className={styles.panel} aria-label="타이머">
      <SegmentedControl
        label="타이머 모드"
        options={modeOptions}
        value={timer.mode}
        onChange={handleModeChange}
      />

      <div className={styles.kkami}>
        <KkamiPhoto mode={timer.mode} status={timer.status} />
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

      <div className={styles.controls}>
        <IconButton
          label="리셋"
          icon={<ResetIcon />}
          variant="secondary"
          size="lg"
          disabled={!ready || timer.status === "idle"}
          onClick={actions.reset}
        />
        <IconButton
          label={
            running
              ? "일시정지"
              : timer.status === "paused"
                ? "다시 시작"
                : "시작"
          }
          icon={running ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
          variant="primary"
          size="xl"
          disabled={!ready}
          onClick={running ? actions.pause : actions.start}
        />
        <IconButton
          label="다음 세션"
          icon={<SkipIcon />}
          variant="secondary"
          size="lg"
          disabled={!ready}
          onClick={actions.skip}
        />
      </div>

      <div className={styles.cycle}>
        <div
          className={styles.paws}
          role="img"
          aria-label={`이번 사이클 집중 ${cycleDone}번 완료, 전체 ${longBreakInterval}번`}
        >
          {Array.from({ length: longBreakInterval }, (_, i) => (
            <PawIcon
              key={i}
              size={18}
              className={cx(i < cycleDone && styles.pawDone)}
            />
          ))}
        </div>
        <span>{cycleText}</span>
      </div>

      <Dialog
        open={pendingMode !== null}
        onClose={() => setPendingMode(null)}
        title={pendingMode ? `${MODE_LABELS[pendingMode]}으로 바꿀까요?` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingMode(null)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (pendingMode) actions.switchMode(pendingMode);
                setPendingMode(null);
              }}
            >
              바꾸기
            </Button>
          </>
        }
      >
        지금 {MODE_LABELS[timer.mode]} 세션이 진행 중이에요. 바꾸면 이 세션은
        완료로 세지 않아요.
      </Dialog>
    </section>
  );
}
