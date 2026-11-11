"use client";

import { useTranslations } from "use-intl";
import { ConfirmDialog, SegmentedControl } from "@/components/ui";
import { useSessionState } from "../hooks";
import { useTimerStore } from "../store";
import { TIMER_MODES, type TimerMode, type TimerStatus } from "../types";

type ModeSwitcherProps = {
  mode: TimerMode;
  status: TimerStatus;
};

/**
 * 집중 / 짧은 휴식 / 긴 휴식 탭.
 * 진행 중이거나 멈춘 세션이 있으면, 완료로 세지 않는다는 걸 알리고 한 번 확인합니다.
 */
export function ModeSwitcher({ mode, status }: ModeSwitcherProps) {
  const [pendingMode, setPendingMode] = useSessionState<TimerMode | null>(null);
  const switchMode = useTimerStore.getState().switchMode;
  const t = useTranslations("timer");
  const modeOptions = TIMER_MODES.map((value) => ({
    value,
    label: t(`modes.${value}`),
  }));

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
        label={t("modeLabel")}
        options={modeOptions}
        value={mode}
        onChange={handleChange}
      />
      <ConfirmDialog
        open={pendingMode !== null}
        title={pendingMode ? t(`switchMode.title.${pendingMode}`) : ""}
        confirmLabel={t("switchMode.confirm")}
        onConfirm={() => {
          if (pendingMode) switchMode(pendingMode);
        }}
        onClose={() => setPendingMode(null)}
      >
        {t("switchMode.message", { mode: t(`modes.${mode}`) })}
      </ConfirmDialog>
    </>
  );
}
