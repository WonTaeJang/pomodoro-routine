"use client";

import { useState } from "react";
import { Button, Dialog, SegmentedControl } from "@/components/ui";
import { MODE_LABELS } from "../labels";
import { useTimerStore } from "../store";
import type { TimerMode, TimerStatus } from "../types";

const MODES: TimerMode[] = ["focus", "short-break", "long-break"];
const modeOptions = MODES.map((value) => ({
  value,
  label: MODE_LABELS[value],
}));

type ModeSwitcherProps = {
  mode: TimerMode;
  status: TimerStatus;
};

/**
 * 집중 / 짧은 휴식 / 긴 휴식 탭.
 * 진행 중이거나 멈춘 세션이 있으면, 완료로 세지 않는다는 걸 알리고 한 번 확인합니다.
 */
export function ModeSwitcher({ mode, status }: ModeSwitcherProps) {
  const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
  const switchMode = useTimerStore.getState().switchMode;

  function handleChange(next: TimerMode) {
    if (next === mode) return;
    if (status !== "idle") {
      setPendingMode(next);
      return;
    }
    switchMode(next);
  }

  return (
    <>
      <SegmentedControl
        label="타이머 모드"
        options={modeOptions}
        value={mode}
        onChange={handleChange}
      />
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
                if (pendingMode) switchMode(pendingMode);
                setPendingMode(null);
              }}
            >
              바꾸기
            </Button>
          </>
        }
      >
        지금 {MODE_LABELS[mode]} 세션이 진행 중이에요. 바꾸면 이 세션은 완료로
        세지 않아요.
      </Dialog>
    </>
  );
}
