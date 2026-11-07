"use client";

import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "@/components/icons";
import { ConfirmDialog, IconButton } from "@/components/ui";
import { useSessionState } from "../hooks";
import { startSession } from "../startSession";
import { useTimerStore } from "../store";
import type { TimerMode, TimerStatus } from "../types";
import styles from "./TimerControls.module.scss";

type TimerControlsProps = {
  mode: TimerMode;
  status: TimerStatus;
  /** 저장된 값을 불러오기 전에는 누를 수 없게 */
  disabled: boolean;
};

/**
 * 리셋 · 시작/일시정지 · 다음 세션 버튼.
 * 시작한 집중을 건너뛰면 완료로 세지 않으므로 한 번 확인합니다. 휴식은 바로 건너뜁니다.
 */
export function TimerControls({ mode, status, disabled }: TimerControlsProps) {
  const [confirmSkip, setConfirmSkip] = useSessionState(false);
  const { reset, pause, skip } = useTimerStore.getState();
  const running = status === "running";
  const mainLabel = running
    ? "일시정지"
    : status === "paused"
      ? "다시 시작"
      : "시작";

  function handleSkip() {
    if (mode === "focus" && status !== "idle") setConfirmSkip(true);
    else skip();
  }

  return (
    <div className={styles.controls}>
      <IconButton
        label="리셋"
        icon={<ResetIcon />}
        variant="secondary"
        size="lg"
        disabled={disabled || status === "idle"}
        onClick={reset}
      />
      <IconButton
        label={mainLabel}
        icon={running ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
        variant="primary"
        size="xl"
        disabled={disabled}
        onClick={running ? pause : startSession}
      />
      <IconButton
        label="다음 세션"
        icon={<SkipIcon />}
        variant="secondary"
        size="lg"
        disabled={disabled}
        onClick={handleSkip}
      />
      <ConfirmDialog
        open={confirmSkip}
        title="집중을 건너뛸까요?"
        confirmLabel="건너뛰기"
        onConfirm={skip}
        onClose={() => setConfirmSkip(false)}
      >
        지금 집중 세션은 완료로 세지 않고 바로 휴식으로 넘어가요.
      </ConfirmDialog>
    </div>
  );
}
