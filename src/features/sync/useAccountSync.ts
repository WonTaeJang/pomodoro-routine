"use client";

import { useEffect, useRef } from "react";
import { getSupabase, useAuth } from "@/features/auth";
import { startAccountSync } from "./accountSync";
import { clearLocalAccountData } from "./clearLocalData";

/**
 * 로그인한 동안 이 브라우저의 집중 기록·할 일·설정을 계정(Supabase)과 맞춥니다 (startAccountSync).
 * 로그아웃하면(다른 탭에서 해도) 이 브라우저의 할 일·기록·타이머를 지웁니다 (clearLocalAccountData).
 * 로그인하지 않았으면 아무것도 하지 않습니다 (지금처럼 브라우저에만 저장). 앱 틀(AppShell)에서 한 번만 씁니다.
 */
export function useAccountSync(ready: boolean) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  /** 이 화면에서 로그인해 있던 계정. 로그아웃으로 바뀌었는지 알려고 기억 */
  const signedInAs = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (userId) {
      signedInAs.current = userId;
    } else if (status === "signedOut" && signedInAs.current) {
      signedInAs.current = null;
      clearLocalAccountData();
    }
  }, [ready, status, userId]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!ready || !userId || !supabase) return;
    return startAccountSync(supabase, userId);
  }, [ready, userId]);
}
