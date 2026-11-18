"use client";

import { useTranslations } from "use-intl";
import { CoffeeIcon } from "@/components/icons";
import { useTimerStore } from "@/features/timer/store";
import {
  formatRemaining,
  getRemainingMs,
  isOnBreak,
} from "@/features/timer/timer";
import { useNow } from "@/lib/useNow";
import styles from "./PetPlayground.module.scss";

/** 휴식 중에만, 게임기 위에: 남은 휴식 시간. 집중 중에는 다마고치를 보라고 재촉하지 않게 숨김 */
export function PetBreakTimer() {
  const t = useTranslations();
  const timer = useTimerStore((s) => s.timer);
  const now = useNow();
  if (!isOnBreak(timer)) return null;
  const left = now === null ? timer.remainingMs : getRemainingMs(timer, now);
  return (
    <p className={styles.breakTimer} role="timer">
      <CoffeeIcon size={16} />
      {t(timer.status === "paused" ? "pet.breakPaused" : "pet.breakTimer", {
        mode: t(`timer.modes.${timer.mode}`),
        time: formatRemaining(left),
      })}
    </p>
  );
}
