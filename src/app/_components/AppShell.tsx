"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppNav } from "@/components/layout/AppNav";
import { TodayCertificateButton } from "@/features/certificate";
import { FocusSoundButton } from "@/features/focus-sound";
import { Onboarding } from "@/features/guide";
import { TodaySummary } from "@/features/history/components/TodaySummary";
import { TestModeBadge } from "@/features/timer/components/TestModeBadge";
import { TimerRuntime } from "@/features/timer/components/TimerRuntime";
import { useTimerStore } from "@/features/timer/store";
import { StoresReadyContext, useHydrateStores } from "@/lib/useHydrateStores";
import { useTabSync } from "@/lib/useTabSync";
import styles from "./AppShell.module.scss";
import { HeaderMenu } from "./HeaderMenu";

/**
 * 모든 페이지의 틀: 저장된 값 불러오기, 다른 탭과 맞추기, 헤더(페이지 메뉴, 오늘 기록, ☰ 메뉴), 맨 아래, 타이머 동작.
 * 페이지를 옮겨도 그대로 남아서 다른 페이지에 있어도 타이머 알림과 완료 팝업이 동작합니다.
 * 배경과 강조색은 지금 타이머 모드를 따릅니다.
 */
type AppShellProps = {
  children: ReactNode;
  /** 맨 아래 (버전, GitHub). 서버에서 그려서 넘김 */
  footer?: ReactNode;
};

export function AppShell({ children, footer }: AppShellProps) {
  const ready = useHydrateStores();
  useTabSync(ready);
  const mode = useTimerStore((s) => s.timer.mode);

  return (
    <StoresReadyContext value={ready}>
      <div className={styles.screen} data-mode={mode}>
        <AppHeader nav={<AppNav />}>
          <TestModeBadge ready={ready} />
          {ready ? <TodaySummary /> : null}
          {ready ? <TodayCertificateButton /> : null}
          <FocusSoundButton ready={ready} />
          <HeaderMenu ready={ready} />
        </AppHeader>
        <div className={styles.page}>{children}</div>
        {footer}
        <TimerRuntime ready={ready} />
        <Onboarding ready={ready} />
      </div>
    </StoresReadyContext>
  );
}
