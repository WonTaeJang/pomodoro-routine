"use client";

import { MedalIcon, PawIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { cx } from "@/lib/cx";
import type { TimerMode } from "../types";
import styles from "./CycleProgress.module.scss";

type CycleProgressProps = {
  mode: TimerMode;
  /** 이번 사이클에서 완료한 집중 횟수 */
  completedInCycle: number;
  /** 긴 휴식 주기 (사이클 길이) */
  interval: number;
  /** 오늘 완료한 사이클 수 */
  todayCycles: number;
};

/** 이번 사이클 진행(발자국)과 오늘 완료한 사이클 수 */
export function CycleProgress({
  mode,
  completedInCycle,
  interval,
  todayCycles,
}: CycleProgressProps) {
  const done = Math.min(completedInCycle, interval);
  const left = interval - done;
  const message =
    mode === "long-break"
      ? "긴 휴식 시간이에요"
      : left === 0
        ? "이번 휴식은 긴 휴식이에요"
        : `긴 휴식까지 ${left}번 남았어요`;

  return (
    <div className={styles.cycle}>
      <span className={styles.label}>이번 사이클</span>
      <div
        className={styles.paws}
        role="img"
        aria-label={`이번 사이클 집중 ${done}번 완료, 전체 ${interval}번`}
      >
        {Array.from({ length: interval }, (_, i) => (
          <PawIcon
            key={i}
            size={18}
            className={cx(i < done && styles.pawDone)}
          />
        ))}
      </div>
      <span>{message}</span>
      {todayCycles > 0 ? (
        <Badge
          variant="medal"
          icon={<MedalIcon size={16} />}
          className={styles.today}
        >
          오늘 {todayCycles}사이클 완료
        </Badge>
      ) : null}
    </div>
  );
}
