"use client";

import { PawIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { getTodayFocus, useHistoryStore } from "@/features/history/store";
import { useNow } from "@/lib/useNow";
import styles from "./TodaySummary.module.scss";

/** 오늘 완료한 뽀모도로 수와 집중한 시간 */
export function TodaySummary() {
  const sessions = useHistoryStore((s) => s.sessions);
  const now = useNow();
  if (now === null) return null;

  const { count, minutes } = getTodayFocus(sessions, now);
  return (
    <p className={styles.summary}>
      <Badge variant="soft" size="lg" icon={<PawIcon size={16} />}>
        오늘 {count}개 · {minutes}분
      </Badge>
    </p>
  );
}
