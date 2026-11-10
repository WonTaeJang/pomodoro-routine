"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_KEYS } from "@/lib/storage";

// 빌드할 때 값이 그대로 들어감. 없으면(설정 전, 테스트 등) 로그인 기능만 숨김
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Supabase 주소와 공개 키가 설정돼 있는지 (`.env.local`) */
export const isAuthConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;

/**
 * 브라우저에서 쓰는 Supabase 연결 (하나만 만들어 같이 씀). 서버에서나 설정이 없으면 null.
 * 앱의 다른 기록처럼 로그인 정보도 이 브라우저(localStorage)에 둡니다.
 * 서버에서 로그인 정보를 읽을 일이 없어서 쿠키(@supabase/ssr)는 쓰지 않습니다.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isAuthConfigured || typeof window === "undefined") return null;
  client ??= createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: {
      // 구글 등에서 돌아오면 주소의 code를 이 브라우저만 아는 값과 맞춰 로그인 (PKCE)
      flowType: "pkce",
      storageKey: STORAGE_KEYS.auth,
      // 돌아오는 주소(/auth/callback)에서만 직접 처리
      detectSessionInUrl: false,
    },
  });
  return client;
}
