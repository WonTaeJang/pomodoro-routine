"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui";
import { useTimerStore } from "../store";
import styles from "./TestModeBadge.module.scss";

const isDev = process.env.NODE_ENV !== "production";

/**
 * 개발용 테스트 모드.
 * 주소에 ?test=5 를 붙이면 모든 세션이 5초가 되고, ?test=off 로 끕니다.
 * 배포(production) 환경에서는 아무것도 하지 않습니다.
 */
export function TestModeBadge({ ready }: { ready: boolean }) {
  const seconds = useTimerStore((s) => s.settings.testDurationSeconds);

  useEffect(() => {
    if (!isDev || !ready) return;
    const url = new URL(window.location.href);
    const value = url.searchParams.get("test");
    if (value === null) return;

    const parsed = Number(value);
    setTestMode(value === "off" || !(parsed > 0) ? null : parsed);
    url.searchParams.delete("test");
    window.history.replaceState(null, "", url);
  }, [ready]);

  if (!isDev || !seconds) return null;

  return (
    <Badge variant="outline" className={styles.badge}>
      테스트 모드 · {seconds}초
      <button
        type="button"
        className={styles.off}
        onClick={() => setTestMode(null)}
      >
        끄기
      </button>
    </Badge>
  );
}

function setTestMode(seconds: number | null) {
  const store = useTimerStore.getState();
  store.updateSettings({ testDurationSeconds: seconds });
  // 진행 중이던 세션도 새 길이로 바로 확인할 수 있게 처음으로 되돌림
  if (store.timer.status !== "idle") useTimerStore.getState().reset();
}
