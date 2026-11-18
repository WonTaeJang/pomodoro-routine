"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { CloseIcon, PetDeviceIcon } from "@/components/icons";
import { PATHS } from "@/lib/paths";
import { isSoundTab } from "@/lib/soundTab";
import { useTimerStore } from "../store";
import { isOnBreak, startedBreak } from "../timer";
import type { TimerMode } from "../types";
import styles from "./BreakSnackbar.module.scss";

/** 보여 주는 시간. 마우스를 올리거나 버튼에 포커스가 있는 동안은 멈추고, 떠나면 처음부터 다시 셈 */
export const BREAK_SNACK_MS = 8000;

/**
 * 휴식을 시작하면 화면 아래에 잠깐: 까미랑 쉬자고 제안합니다.
 * - 휴식을 시작할 때 한 번 (다시 시작·일시정지 풀기는 아님). 자동 시작도 같음
 * - 탭이 여러 개면 소리를 내는 탭에만 (lib/soundTab)
 * - 다마고치 화면에서는 띄우지 않고, 휴식이 끝나거나 건너뛰면 사라짐
 */
export function BreakSnackbar() {
  const t = useTranslations();
  const onPet = usePathname() === PATHS.pet;
  const [shown, setShown] = useState<TimerMode | null>(null);
  const [held, setHeld] = useState(false);

  useEffect(
    () =>
      useTimerStore.subscribe(({ timer }, { timer: before }) => {
        const started = startedBreak(before, timer);
        if (started && isSoundTab()) setShown(started);
        else if (!isOnBreak(timer)) setShown(null);
      }),
    [],
  );
  const visible = shown !== null && !onPet;
  useEffect(() => {
    if (!visible || held) return;
    const timer = setTimeout(() => setShown(null), BREAK_SNACK_MS);
    return () => clearTimeout(timer);
  }, [visible, held, shown]);
  // 다마고치에 있거나 가면 다 본 것 (다마고치에서 시작한 휴식도)
  useEffect(() => {
    if (onPet && shown) queueMicrotask(() => setShown(null));
  }, [onPet, shown]);

  if (!visible) return null;
  const close = () => {
    setShown(null);
    setHeld(false);
  };
  return (
    <div
      className={styles.snackbar}
      role="status"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <PetDeviceIcon size={20} />
      <span className={styles.text}>
        {t(
          shown === "long-break"
            ? "timer.breakSnack.long"
            : "timer.breakSnack.short",
        )}
      </span>
      <Link href={PATHS.pet} className={styles.action} onClick={close}>
        {t("timer.breakSnack.go")}
      </Link>
      <button
        type="button"
        className={styles.close}
        aria-label={t("common.close")}
        onClick={close}
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
