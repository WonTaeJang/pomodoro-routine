"use client";

import { useEffect } from "react";
import { getSupabase, useAuth } from "@/features/auth";
import { useHistoryStore } from "@/features/history/store";
import { createSessionSync } from "./sessionSync";
import { fetchSessions, uploadSessions } from "./sessionsApi";

/** 탭으로 돌아왔을 때 서버 기록을 다시 받는 최소 간격 (다른 기기에서 쌓인 기록을 가져옴) */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * 로그인한 동안 이 브라우저의 집중 기록을 계정(Supabase)과 맞춥니다. 앱 틀(AppShell)에서 한 번만 씁니다.
 * - 로그인하면: 서버 기록을 받아 합치고, 이 브라우저에만 있는 기록을 올림
 * - 집중·휴식이 끝나 기록이 생기면 바로 올림
 * - 인터넷이 다시 연결되거나 탭으로 돌아오면 못 올린 것을 다시 올림
 * 로그인하지 않았으면 아무것도 하지 않습니다 (지금처럼 브라우저에만 저장).
 */
export function useAccountSync(ready: boolean) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    const supabase = getSupabase();
    if (!ready || !userId || !supabase) return;

    const { sync, stop } = createSessionSync({
      fetchAll: () => fetchSessions(supabase),
      upload: (sessions) => uploadSessions(supabase, userId, sessions),
      getLocal: () => useHistoryStore.getState().sessions,
      mergeLocal: (sessions) =>
        useHistoryStore.getState().mergeSessions(sessions),
    });

    let refreshedAt = Date.now();
    void sync();

    // 기록이 늘면(이 탭이든 다른 탭이든) 올림
    const unsubscribe = useHistoryStore.subscribe((state, previous) => {
      if (state.sessions !== previous.sessions) void sync();
    });
    const onOnline = () => void sync();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const refresh = Date.now() - refreshedAt >= REFRESH_INTERVAL_MS;
      if (refresh) refreshedAt = Date.now();
      void sync({ refresh });
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      // 받는 중이던 응답이 로그아웃 뒤(또는 다른 계정으로 바꾼 뒤)에 합쳐지지 않게
      stop();
      unsubscribe();
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, userId]);
}
