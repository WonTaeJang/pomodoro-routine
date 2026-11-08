"use client";

import { useId } from "react";
import { HeadphonesIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { useTimerStore } from "@/features/timer/store";
import { cx } from "@/lib/cx";
import { FOCUS_SOUNDS } from "../sounds";
import styles from "./FocusSoundButton.module.scss";
import { FocusSoundPanel } from "./FocusSoundPanel";

type FocusSoundButtonProps = {
  /** 저장된 값을 불러오기 전이면 false (누를 수 없음) */
  ready: boolean;
};

/**
 * 헤더의 집중 소리 버튼. 누르면 아래에 소리 고르기 창이 펼쳐집니다.
 * 소리를 켜 두면 버튼에 점이 붙습니다.
 */
export function FocusSoundButton({ ready }: FocusSoundButtonProps) {
  const panelId = useId();
  const sound = useTimerStore((s) => s.settings.focusSound);
  const on = ready && sound !== "off";

  return (
    <>
      <IconButton
        label={on ? `집중 소리: ${FOCUS_SOUNDS[sound].label}` : "집중 소리"}
        icon={<HeadphonesIcon />}
        disabled={!ready}
        popoverTarget={panelId}
        className={cx(styles.button, on && styles.on)}
      />
      {/* 브라우저 기본 펼침 창(popover): 바깥을 누르거나 ESC로 닫힘 */}
      <div id={panelId} popover="auto" className={styles.panel}>
        {ready ? <FocusSoundPanel /> : null}
      </div>
    </>
  );
}
