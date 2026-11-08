"use client";

import { useId, type CSSProperties } from "react";
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

  return (
    <Card
      as="section"
      className={cx(styles.panel, className)}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles.title}>
        통계
      </h2>
      {all.focusCount === 0 ? (
        <EmptyState>첫 집중을 마치면 여기에 기록이 쌓여요.</EmptyState>
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
  const streak = getStreak(stats, today);
  const week = getRecentComparison(stats, today, RECENT_DAYS);
  const month = sumDays(stats, startOfMonth(today), addDays(today, 1));
  const recent = getRecentDays(stats, today, RECENT_DAYS);
  const maxMs = Math.max(...recent.map((d) => d.focusMs), 1);

  const diffMin = Math.round(
    (week.recent.focusMs - week.previous.focusMs) / MIN,
  );
  const weekDiff = `${diffMin > 0 ? "+" : "−"}${formatDuration(Math.abs(diffMin) * MIN)}`;

  return (
    <div className={styles.body}>
      <dl className={styles.tiles}>
        <div className={styles.tile}>
          <dt>연속</dt>
          <dd className={styles.value}>
            <FlameIcon size={20} className={styles.flame} />
            {streak.current}일
          </dd>
          <dd className={styles.note}>
            {streak.todayDone || streak.current === 0
              ? `최고 ${streak.best}일`
              : `오늘 집중하면 ${streak.current + 1}일째`}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>최근 7일</dt>
          <dd className={styles.value}>
            {formatDuration(week.recent.focusMs)}
          </dd>
          <dd className={styles.note}>
            {diffMin === 0 ? (
              "그 전 7일과 같아요"
            ) : (
              <>
                그 전 7일보다 <span className={styles.nowrap}>{weekDiff}</span>
              </>
            )}
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>이번 달</dt>
          <dd className={styles.value}>{formatDuration(month.focusMs)}</dd>
          <dd className={styles.note}>
            사이클{"\u00a0"}
            {month.cycles}개
          </dd>
        </div>
        <div className={styles.tile}>
          <dt>전체</dt>
          <dd className={styles.value}>집중 {all.focusCount}번</dd>
          <dd className={styles.note}>
            {formatDuration(all.focusMs)} · 사이클{"\u00a0"}
            {all.cycles}개
          </dd>
        </div>
      </dl>

      <figure className={styles.chart}>
        <figcaption className={styles.chartTitle}>
          최근 7일 집중 시간 (분)
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
                {day === today ? "오늘" : WEEKDAY_NAMES[new Date(day).getDay()]}
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
                <td>{focusMs ? formatDuration(focusMs) : "기록 없음"}</td>
              </tr>
            ))}
          </tbody>
        </VisuallyHidden>
      </figure>
    </div>
  );
}
