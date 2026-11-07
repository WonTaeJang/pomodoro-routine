"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { useAlerts } from "@/features/alerts";
import { TodaySummary } from "@/features/history/components/TodaySummary";
import { SettingsButton } from "@/features/settings/components/SettingsButton";
import { TaskPanel } from "@/features/tasks/components/TaskPanel";
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
  useAlerts(ready);

  return (
    <div className={styles.screen} data-mode={mode}>
      <AppHeader>
        <TestModeBadge ready={ready} />
        {ready ? <TodaySummary /> : null}
        <ThemeToggle />
        <SettingsButton ready={ready} />
      </AppHeader>
      <main className={styles.main}>
        <TimerPanel ready={ready} />
        {ready ? <TaskPanel /> : null}
      </main>
      {ready ? <CompletionDialog /> : null}
    </div>
  );
}
