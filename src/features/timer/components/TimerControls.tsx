"use client";

import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { startSession } from "../startSession";
import { useTimerStore } from "../store";
import type { TimerStatus } from "../types";
import styles from "./TimerControls.module.scss";

type TimerControlsProps = {
  status: TimerStatus;
  /** 저장된 값을 불러오기 전에는 누를 수 없게 */
  disabled: boolean;
};

/** 리셋 · 시작/일시정지 · 다음 세션 버튼 */
export function TimerControls({ status, disabled }: TimerControlsProps) {
  const { reset, pause, skip } = useTimerStore.getState();
  const running = status === "running";
  const mainLabel = running
    ? "일시정지"
    : status === "paused"
      ? "다시 시작"
      : "시작";

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
        onClick={skip}
      />
    </div>
  );
}
