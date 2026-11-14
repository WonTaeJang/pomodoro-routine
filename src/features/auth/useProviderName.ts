"use client";

import { useTranslations } from "use-intl";

/** 이름을 번역해 둔 로그인 방법 */
const KNOWN = ["google", "kakao", "email"] as const;

/**
 * 로그인 방법(Supabase의 provider) → 화면에 쓸 이름 ("Google", "카카오", "이메일").
 * 번역해 두지 않은 방법은 그대로, 없으면 null. (프로필 배지, 관리자 회원 목록)
 */
export function useProviderName(): (provider: string | null) => string | null {
  const t = useTranslations("auth.profile.providers");
  return (provider) =>
    KNOWN.includes(provider as (typeof KNOWN)[number])
      ? t(provider as (typeof KNOWN)[number])
      : provider;
}
