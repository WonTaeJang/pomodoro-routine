"use client";

import { useTranslations } from "use-intl";
import { PawIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { useTodayFocus } from "../useTodayFocus";
import styles from "./TodaySummary.module.scss";

/** 오늘 완료한 뽀모도로 수와 집중한 시간 */
export function TodaySummary() {
  const today = useTodayFocus();
  const t = useTranslations("history");
  if (today === null) return null;

  const minutes = Math.round(today.focusMs / 60_000);
  return (
    <p className={styles.summary}>
      <Badge variant="soft" size="lg" icon={<PawIcon size={16} />}>
        {t("today", { count: today.focusCount, minutes })}
      </Badge>
    </p>
  );
}
