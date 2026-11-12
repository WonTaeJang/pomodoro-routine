"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { create } from "zustand";
import { checkNickname, safeNextPath, type NicknameCheck } from "./profile";
import { getSupabase, isAuthConfigured } from "./supabase";

/**
 * 로그인 상태.
 * - disabled: Supabase 설정이 없어 로그인을 쓸 수 없음
 * - loading: 저장된 로그인 정보를 읽는 중 (서버와 첫 화면)
 */
export type AuthStatus = "disabled" | "loading" | "signedOut" | "signedIn";

type AuthState = { status: AuthStatus; user: User | null };

const useAuthStore = create<AuthState>(() => ({
  status: isAuthConfigured ? "loading" : "disabled",
  user: null,
}));

let listening = false;

/** 로그인 상태 바뀜을 한 번만 듣기 시작함 (다른 탭에서 로그인·로그아웃해도 따라옴) */
function listen() {
  const supabase = getSupabase();
  if (listening || !supabase) return;
  listening = true;
  // 처음 한 번(INITIAL_SESSION)은 저장된 로그인 정보로 바로 불림
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      status: session ? "signedIn" : "signedOut",
      user: session?.user ?? null,
    });
  });
}

/** 지금 로그인 상태와 사용자. 화면에서 처음 쓰면 상태를 듣기 시작함 */
export function useAuth(): AuthState {
  useEffect(listen, []);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  return { status, user };
}

/**
 * 구글 로그인 화면으로 이동. 로그인하면 /auth/callback을 거쳐 next(이 사이트 안의 주소)로 돌아옴.
 * 이동을 시작하지 못하면 false.
 */
export async function signInWithGoogle(next?: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", safeNextPath(next));
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  return !error;
}

// 개발 서버에서만 쓰는 테스트 계정 (.env.development.local). 배포용 빌드에는 값이 들어가지 않음
const DEV_LOGIN_EMAIL = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL;
const DEV_LOGIN_PASSWORD = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD;

/**
 * 테스트 계정 로그인을 쓸 수 있는지. 개발 서버이고 테스트 계정 정보가 있을 때만.
 * 구글은 앱에 내장된 브라우저(예: Claude 브라우저)에서의 로그인을 막아서, 그런 곳에서 로그인 뒤 화면을 확인하려고 둠
 */
export const isDevLoginAvailable =
  process.env.NODE_ENV === "development" &&
  isAuthConfigured &&
  Boolean(DEV_LOGIN_EMAIL && DEV_LOGIN_PASSWORD);

/** 테스트 계정(이메일·비밀번호)으로 로그인. 개발 서버 전용. 성공하면 true */
export async function signInWithDevAccount(): Promise<boolean> {
  const supabase = getSupabase();
  if (!isDevLoginAvailable || !supabase) return false;
  const { error } = await supabase.auth.signInWithPassword({
    email: DEV_LOGIN_EMAIL!,
    password: DEV_LOGIN_PASSWORD!,
  });
  return !error;
}

/** 같은 code로 두 번 바꾸지 않게 (개발 모드에서 화면이 두 번 그려져도) */
const exchanges = new Map<string, Promise<boolean>>();

/** 구글 등에서 돌아온 주소의 code로 로그인을 마침. 성공하면 true */
export function finishSignIn(code: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return Promise.resolve(false);
  let exchange = exchanges.get(code);
  if (!exchange) {
    exchange = supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => !error);
    exchanges.set(code, exchange);
  }
  return exchange;
}

/** 이 브라우저에서 로그아웃 */
export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut({ scope: "local" });
}

export type NicknameResult = NicknameCheck | { ok: false; reason: "failed" };

/**
 * 닉네임 바꾸기 (Supabase 사용자 정보에 저장. 바뀌면 useAuth도 새 값).
 * 빈 값이면 직접 정한 닉네임을 지움.
 */
export async function updateNickname(input: string): Promise<NicknameResult> {
  const check = checkNickname(input);
  const supabase = getSupabase();
  if (!check.ok) return check;
  if (!supabase) return { ok: false, reason: "failed" };
  const { error } = await supabase.auth.updateUser({
    data: { nickname: check.value || null },
  });
  return error ? { ok: false, reason: "failed" } : check;
}
