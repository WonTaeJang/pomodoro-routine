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

/**
 * 휴식 중에만: 남은 휴식 시간. 집중 중에는 다마고치를 보라고 재촉하지 않게 숨김.
 * 휴대폰·태블릿은 헤더와 본체 사이에 떠 있다가 스크롤하면 화면 위에 따라오고(본체를 밀지 않음),
 * 넓은 화면은 본체 왼쪽 칸에 카드로 (지나간 만큼 차는 막대와 함께)
 */
export function PetBreakTimer() {
  const t = useTranslations();
  const timer = useTimerStore((s) => s.timer);
  const now = useNow();
  if (!isOnBreak(timer)) return null;
  const left = now === null ? timer.remainingMs : getRemainingMs(timer, now);
  const done = timer.durationMs > 0 ? 1 - left / timer.durationMs : 0;
  return (
    <p className={styles.breakTimer} role="timer" data-mode={timer.mode}>
      <span className={styles.breakMode}>
        <CoffeeIcon size={16} />
        {t(`timer.modes.${timer.mode}`)}
      </span>
      <b className={styles.breakLeft}>{formatRemaining(left)}</b>
      <span>
        {t(timer.status === "paused" ? "pet.break.paused" : "pet.break.left")}
      </span>
      <span className={styles.breakBar} aria-hidden="true">
        <i style={{ transform: `scaleX(${Math.min(1, Math.max(0, done))})` }} />
      </span>
    </p>
  );
}
