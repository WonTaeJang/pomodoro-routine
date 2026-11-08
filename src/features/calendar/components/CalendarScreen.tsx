"use client";

import { useMemo, useState } from "react";
import { PageMain } from "@/components/layout/PageMain";
import { EMPTY_DAY, getDayStats } from "@/features/history/sessions";
import { useHistoryStore } from "@/features/history/store";
import { StatsPanel } from "@/features/stats/components/StatsPanel";
import { useStoresReady } from "@/lib/useHydrateStores";
import { useToday } from "@/lib/useNow";
import { monthOf } from "../calendar";
import styles from "./CalendarScreen.module.scss";
import { DayDetail } from "./DayDetail";
import { MonthCalendar } from "./MonthCalendar";

/** 캘린더 페이지: 맨 위 통계, 그 아래 휴대폰은 달력 아래 날짜 상세, 넓은 화면은 왼쪽 달력, 오른쪽 상세 */
export function CalendarScreen() {
  const ready = useStoresReady();
  const today = useToday();
  return (
    <PageMain>
      {/* 오늘 날짜는 브라우저에서만 알 수 있어서, 불러온 뒤에 그림 */}
      {ready && today !== null ? <Calendar today={today} /> : null}
    </PageMain>
  );
}

function Calendar({ today }: { today: number }) {
  const sessions = useHistoryStore((s) => s.sessions);
  const stats = useMemo(() => getDayStats(sessions), [sessions]);
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState(() => monthOf(today));

  function select(day: number) {
    setSelected(day);
    setView(monthOf(day));
  }

  return (
    <>
      <StatsPanel stats={stats} today={today} className={styles.wide} />
      <MonthCalendar
        view={view}
        onViewChange={setView}
        today={today}
        selected={selected}
        onSelect={select}
        stats={stats}
      />
      <DayDetail
        day={selected}
        today={today}
        stats={stats.get(selected) ?? EMPTY_DAY}
      />
    </>
  );
}
