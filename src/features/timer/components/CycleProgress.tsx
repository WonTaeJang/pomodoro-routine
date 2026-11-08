import { useTranslations } from "use-intl";
import { PawIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { getCycleMessage } from "../labels";
import type { TimerMode } from "../types";
import styles from "./CycleProgress.module.scss";

type CycleProgressProps = {
  mode: TimerMode;
  /** 이번 사이클에서 완료한 집중 횟수 */
  completedInCycle: number;
  /** 긴 휴식 주기 (사이클 길이) */
  interval: number;
};

/** 이번 사이클 진행: 발자국과 안내 문구 ("긴 휴식까지 N번 남았어요") */
export function CycleProgress({
  mode,
  completedInCycle,
  interval,
}: CycleProgressProps) {
  const done = Math.min(completedInCycle, interval);
  const t = useTranslations();

  return (
    <div className={styles.cycle}>
      <div
        className={styles.paws}
        role="img"
        aria-label={t("timer.cycle.progress", { done, total: interval })}
      >
        {Array.from({ length: interval }, (_, i) => (
          <PawIcon
            key={i}
            size={16}
            className={cx(i < done && styles.pawDone)}
          />
        ))}
      </div>
      <span>{getCycleMessage(t, mode, completedInCycle, interval)}</span>
    </div>
  );
}
