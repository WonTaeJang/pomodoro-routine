"use client";

import { useId } from "react";
import { useTranslations } from "use-intl";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MedalIcon,
} from "@/components/icons";
import { Button, Card, IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { formatLongDate, WEEKDAY_NAMES } from "@/lib/date";
import { sumDays, type DayStats } from "@/features/history/sessions";
import {
  FOCUS_LEVELS,
  getFocusLevel,
  getMonthWeeks,
  monthBounds,
  monthOf,
  shiftMonth,
  type MonthView,
} from "../calendar";
import styles from "./MonthCalendar.module.scss";

type MonthCalendarProps = {
  view: MonthView;
  onViewChange: (view: MonthView) => void;
  today: number;
  selected: number;
  onSelect: (day: number) => void;
  /** 날짜별 기록 (getDayStats) */
  stats: Map<number, DayStats>;
};

/** 월 달력. 집중을 많이 한 날일수록 진한 색, 사이클을 마친 날은 메달 */
export function MonthCalendar({
  view,
  onViewChange,
  today,
  selected,
  onSelect,
  stats,
}: MonthCalendarProps) {
  const titleId = useId();
  const t = useTranslations("calendar");
  const common = useTranslations("common");
  const { year, month } = view;
  const weeks = getMonthWeeks(year, month);
  const { from, to } = monthBounds(view);
  const { focusCount, cycles } = sumDays(stats, from, to);
  const todayMonth = monthOf(today);
  const isThisMonth = todayMonth.year === year && todayMonth.month === month;

  return (
    <Card as="section" className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {year}년 {month + 1}월
          </h2>
          <p className={styles.summary}>
            {t("monthSummary", { focusCount, cycles })}
          </p>
        </div>
        <div className={styles.nav}>
          {!isThisMonth || selected !== today ? (
            <Button size="sm" variant="ghost" onClick={() => onSelect(today)}>
              {common("today")}
            </Button>
          ) : null}
          <IconButton
            label={t("prevMonth")}
            icon={<ChevronLeftIcon size={18} />}
            size="sm"
            onClick={() => onViewChange(shiftMonth(view, -1))}
          />
          <IconButton
            label={t("nextMonth")}
            icon={<ChevronRightIcon size={18} />}
            size="sm"
            onClick={() => onViewChange(shiftMonth(view, 1))}
          />
        </div>
      </div>

      <table className={styles.grid}>
        <thead>
          <tr>
            {WEEKDAY_NAMES.map((w) => (
              <th key={w} scope="col" className={styles.weekday}>
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((day) => (
                <td key={day}>
                  <DayCell
                    day={day}
                    stats={stats.get(day)}
                    outside={new Date(day).getMonth() !== month}
                    today={day === today}
                    selected={day === selected}
                    onSelect={onSelect}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.scale}>
          {t("legend.less")}
          {[0, ...FOCUS_LEVELS.map((l) => l.level)].map((level) => (
            <span key={level} className={styles.swatch} data-level={level} />
          ))}
          {t("legend.more")}
        </span>
        <span className={styles.scale}>
          <MedalIcon size={12} className={styles.legendMedal} />
          {t("legend.cycle")}
        </span>
      </div>
    </Card>
  );
}

type DayCellProps = {
  day: number;
  /** 그날 기록. 없으면 undefined */
  stats: DayStats | undefined;
  /** 보고 있는 달이 아닌 앞뒤 달 날짜 */
  outside: boolean;
  today: boolean;
  selected: boolean;
  onSelect: (day: number) => void;
};

/** 달력 칸 하나: 날짜 숫자, 집중 횟수에 따른 색, 사이클을 마쳤으면 메달 */
function DayCell({
  day,
  stats,
  outside,
  today,
  selected,
  onSelect,
}: DayCellProps) {
  const count = stats?.focusCount ?? 0;
  const cycleCount = stats?.cycleNumbers.length ?? 0;
  const t = useTranslations("calendar.cell");
  const common = useTranslations("common");
  const label = [
    formatLongDate(day),
    count ? t("focusCount", { count }) : common("noRecords"),
    cycleCount ? t("cycleCount", { count: cycleCount }) : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      className={cx(
        styles.day,
        outside && styles.outside,
        today && styles.today,
        selected && styles.selected,
      )}
      data-level={getFocusLevel(count)}
      aria-label={label}
      aria-pressed={selected}
      aria-current={today ? "date" : undefined}
      onClick={() => onSelect(day)}
    >
      {new Date(day).getDate()}
      {cycleCount ? <MedalIcon size={12} className={styles.medal} /> : null}
    </button>
  );
}
