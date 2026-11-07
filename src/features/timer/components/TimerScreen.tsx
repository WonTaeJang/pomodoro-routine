"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { TodaySummary } from "@/features/history/components/TodaySummary";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useHydrateStores } from "@/lib/useHydrateStores";
import { useTimerStore } from "../store";
import { CompletionDialog } from "./CompletionDialog";
import { TestModeBadge } from "./TestModeBadge";
import { TimerPanel } from "./TimerPanel";
import styles from "./TimerScreen.module.scss";

/** 메인 화면. 모드에 따라 배경과 강조색이 바뀝니다. */
export function TimerScreen() {
  const ready = useHydrateStores();
  const mode = useTimerStore((s) => s.timer.mode);

  return (
    <div className={styles.screen} data-mode={mode}>
      <AppHeader>
        <TestModeBadge ready={ready} />
        {ready ? <TodaySummary /> : null}
        <ThemeToggle />
      </AppHeader>
      <main className={styles.main}>
        <TimerPanel ready={ready} />
      </main>
      {ready ? <CompletionDialog /> : null}
    </div>
  );
}
