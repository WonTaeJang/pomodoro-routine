"use client";

import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "@/components/icons";
import { ConfirmDialog, IconButton } from "@/components/ui";
import { SHORTCUTS, useShortcuts } from "@/features/shortcuts";
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

/** 시작한 집중을 리셋하거나 건너뛸 때 묻는 내용 */
const CONFIRMS = {
  reset: {
    title: "집중을 처음부터 할까요?",
    confirmLabel: "리셋",
    message: "지금 집중 세션은 완료로 세지 않고 처음 시간으로 돌아가요.",
  },
  skip: {
    title: "집중을 건너뛸까요?",
    confirmLabel: "건너뛰기",
    message: "지금 집중 세션은 완료로 세지 않고 바로 휴식으로 넘어가요.",
  },
};

type ConfirmAction = keyof typeof CONFIRMS;

/**
 * 리셋 · 시작/일시정지 · 다음 세션 버튼과 단축키(Space, R, N).
 * 시작한 집중을 리셋하거나 건너뛰면 완료로 세지 않으므로 한 번 확인합니다.
 * 휴식이나 시작 전 세션은 잃을 게 없어서 바로 실행합니다.
 */
export function TimerControls({ mode, status, disabled }: TimerControlsProps) {
  const [pending, setPending] = useSessionState<ConfirmAction | null>(null);
  const { reset, pause, skip } = useTimerStore.getState();
  const running = status === "running";
  const focusStarted = mode === "focus" && status !== "idle";
  const mainLabel = running
    ? "일시정지"
    : status === "paused"
      ? "다시 시작"
      : "시작";
  const actions: Record<ConfirmAction, () => void> = { reset, skip };

  const toggle = running ? pause : startSession;
  function request(action: ConfirmAction) {
    if (focusStarted) setPending(action);
    else actions[action]();
  }
  function handleReset() {
    // 시작 전에는 리셋할 것이 없음 (버튼도 막혀 있음)
    if (status !== "idle") request("reset");
  }

  useShortcuts(
    { toggle, reset: handleReset, skip: () => request("skip") },
    !disabled,
  );

  const confirm = pending ? CONFIRMS[pending] : null;

  return (
    <div className={styles.controls}>
      <IconButton
        label="리셋"
        shortcut={SHORTCUTS.reset.key}
        icon={<ResetIcon />}
        variant="secondary"
        size="lg"
        disabled={disabled || status === "idle"}
        onClick={handleReset}
      />
      <IconButton
        label={mainLabel}
        shortcut={SHORTCUTS.toggle.key}
        icon={running ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
        variant="primary"
        size="xl"
        disabled={disabled}
        onClick={toggle}
      />
      <IconButton
        label="다음 세션"
        shortcut={SHORTCUTS.skip.key}
        icon={<SkipIcon />}
        variant="secondary"
        size="lg"
        disabled={disabled}
        onClick={() => request("skip")}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ""}
        confirmLabel={confirm?.confirmLabel ?? ""}
        onConfirm={() => {
          if (pending) actions[pending]();
        }}
        onClose={() => setPending(null)}
      >
        {confirm?.message}
      </ConfirmDialog>
    </div>
  );
}
