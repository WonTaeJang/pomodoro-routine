"use client";

import { useId, type CSSProperties } from "react";
import { useTranslations } from "use-intl";
import { FlameIcon } from "@/components/icons";
import { Card, EmptyState, VisuallyHidden } from "@/components/ui";
import {
  sumDays,
  type DayStats,
  type Totals,
} from "@/features/history/sessions";
import { cx } from "@/lib/cx";
import {
  addDays,
  formatDuration,
  formatLongDate,
  startOfMonth,
  WEEKDAY_NAMES,
} from "@/lib/date";
import { getRecentComparison, getRecentDays, getStreak } from "../stats";
import styles from "./StatsPanel.module.scss";

const RECENT_DAYS = 7;
const MIN = 60_000;

type StatsPanelProps = {
  /** 날짜별 기록 (getDayStats) */
  stats: Map<number, DayStats>;
  today: number;
  className?: string;
};

/** 통계: 연속 일수, 최근 7일, 이번 달, 전체, 최근 7일 막대. 기록이 없으면 안내 */
export function StatsPanel({ stats, today, className }: StatsPanelProps) {
  const titleId = useId();
  const all = sumDays(stats, -Infinity, Infinity);
  const t = useTranslations("stats");

  return (
    <Card
      as="section"
      className={cx(styles.panel, className)}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles.title}>
        {t("title")}
      </h2>
      {all.focusCount === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <StatsBody stats={stats} today={today} all={all} />
      )}
    </Card>
  );
}

type StatsBodyProps = {
  stats: Map<number, DayStats>;
  today: number;
  /** 전체 합계 */
  all: Totals;
};

function StatsBody({ stats, today, all }: StatsBodyProps) {
  const t = useTranslations("stats");
  const common = useTranslations("common");
  const duration = formatDuration;
  const streak = getStreak(stats, today);
  const week = getRecentComparison(stats, today, RECENT_DAYS);
  const month = sumDays(stats, startOfMonth(today), addDays(today, 1));
  const recent = getRecentDays(stats, today, RECENT_DAYS);
  const maxMs = Math.max(...recent.map((d) => d.focusMs), 1);

  const diffMin = Math.round(
    (week.recent.focusMs - week.previous.focusMs) / MIN,
  );
  const weekDiff = `${diffMin > 0 ? "+" : "−"}${duration(Math.abs(diffMin) * MIN)}`;
  const weekdays = WEEKDAY_NAMES;

  return (
    <div className={styles.body}>
      <dl className={styles.tiles}>
        <div className={styles.tile}>
          <dt>{t("streak.title")}</dt>
          <dd className={styles.value}>
            <FlameIcon size={20} className={styles.flame} />
            {t("streak.days", { count: streak.current })}
          </dd>
          <dd className={styles.note}>
            {streak.todayDone || streak.current === 0
              ? t("streak.best", { count: streak.best })
              : t("streak.keepGoing", { count: streak.current + 1 })}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>{t("week.title")}</dt>
          <dd className={styles.value}>{duration(week.recent.focusMs)}</dd>
          <dd className={styles.note}>
            {diffMin === 0
              ? t("week.same")
              : t.rich("week.diff", {
                  diff: weekDiff,
                  nowrap: (chunks) => (
                    <span className={styles.nowrap}>{chunks}</span>
                  ),
                })}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>{t("month.title")}</dt>
          <dd className={styles.value}>{duration(month.focusMs)}</dd>
          <dd className={styles.note}>
            {t("cycles", { count: month.cycles })}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>{t("all.title")}</dt>
          <dd className={styles.value}>
            {t("all.focusCount", { count: all.focusCount })}
          </dd>
          <dd className={styles.note}>
            {duration(all.focusMs)} · {t("cycles", { count: all.cycles })}
          </dd>
        </div>
      </dl>

      <figure className={styles.chart}>
        <figcaption className={styles.chartTitle}>
          {t("chart.title")}
        </figcaption>
        <div className={styles.bars} aria-hidden="true">
          {recent.map(({ day, focusMs }) => (
            <div
              key={day}
              className={cx(styles.column, day === today && styles.today)}
            >
              <span className={styles.track}>
                <span className={styles.amount}>
                  {focusMs ? Math.round(focusMs / MIN) : ""}
                </span>
                <span
                  className={styles.bar}
                  style={{ "--ratio": focusMs / maxMs } as CSSProperties}
                />
              </span>
              <span className={styles.weekday}>
                {day === today
                  ? common("today")
                  : weekdays[new Date(day).getDay()]}
              </span>
            </div>
          ))}
        </div>
        {/* 화면 낭독기용 표 */}
        <VisuallyHidden as="table">
          <tbody>
            {recent.map(({ day, focusMs }) => (
              <tr key={day}>
                <th scope="row">{formatLongDate(day)}</th>
                <td>{focusMs ? duration(focusMs) : common("noRecords")}</td>
              </tr>
            ))}
          </tbody>
        </VisuallyHidden>
      </figure>
    </div>
  );
}
