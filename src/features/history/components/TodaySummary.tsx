"use client";

import { PawIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { useTodayFocus } from "../useTodayFocus";
import styles from "./TodaySummary.module.scss";

/** 오늘 완료한 뽀모도로 수와 집중한 시간 */
export function TodaySummary() {
  const today = useTodayFocus();
  if (today === null) return null;

  const { count, minutes } = today;
  return (
    <p className={styles.summary}>
      <Badge variant="soft" size="lg" icon={<PawIcon size={16} />}>
        오늘 {count}개 · {minutes}분
      </Badge>
    </p>
  );
}
