"use client";

import { PageMain } from "@/components/layout/PageMain";
import { TaskPanel } from "@/features/tasks/components/TaskPanel";
import { useStoresReady } from "@/lib/useHydrateStores";
import { TimerPanel } from "./TimerPanel";

/** 타이머 페이지: 휴대폰은 타이머 아래 할 일, 넓은 화면은 왼쪽 타이머, 오른쪽 할 일 */
export function TimerScreen() {
  const ready = useStoresReady();
  return (
    <PageMain>
      <TimerPanel ready={ready} />
      {ready ? <TaskPanel /> : null}
    </PageMain>
  );
}
