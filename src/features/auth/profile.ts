import type { User } from "@supabase/supabase-js";

/** 화면에 보여줄 프로필 */
export type Profile = {
  /** 직접 정한 닉네임 → 없으면 구글 등의 이름 → 이메일 앞부분 */
  nickname: string;
  /** 직접 정한 닉네임이 있는지 */
  customNickname: boolean;
  avatarUrl: string | null;
  email: string | null;
  /** 로그인한 방법 (google, kakao …) */
  provider: string | null;
  /** 가입한 시각 (ms) */
  createdAt: number;
};

export const NICKNAME_MAX = 20;

/** 로그인 정보에서 프로필을 만듦. 닉네임은 Supabase 사용자 정보의 nickname에 저장 */
export function profileOf(user: User): Profile {
  const meta = user.user_metadata ?? {};
  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const custom = text(meta.nickname);
  const nickname =
    custom ??
    text(meta.full_name) ??
    text(meta.name) ??
    text(user.email?.split("@")[0]) ??
    "";
  return {
    nickname,
    customNickname: custom !== null,
    // 카카오는 사진 주소를 http://로 줄 때가 있어 https://로 (https 사이트에서 막히지 않게)
    avatarUrl:
      (text(meta.avatar_url) ?? text(meta.picture))?.replace(
        /^http:\/\//,
        "https://",
      ) ?? null,
    email: user.email ?? null,
    provider: text(user.app_metadata?.provider),
    createdAt: Date.parse(user.created_at),
  };
}

export type NicknameCheck =
  { ok: true; value: string } | { ok: false; reason: "tooLong" };

/**
 * 닉네임 확인: 앞뒤 공백을 떼고 20자까지 (이모지 등도 한 글자로 셈).
 * 빈 값도 괜찮음: 직접 정한 닉네임을 지우고 구글 등의 이름을 씀.
 */
export function checkNickname(input: string): NicknameCheck {
  const value = input.trim().replace(/\s+/g, " ");
  const length = [...new Intl.Segmenter().segment(value)].length;
  if (length > NICKNAME_MAX) return { ok: false, reason: "tooLong" };
  return { ok: true, value };
}

/**
 * 로그인 뒤 돌아갈 주소. 이 사이트 안의 주소만 허용 (다른 사이트로 보내는 데 쓰이지 않게).
 * 이상한 값이면 프로필로.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/profile";
  const inside =
    next.startsWith("/") &&
    // "//다른사이트", "/\다른사이트"는 브라우저가 다른 사이트 주소로 읽음
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    // 돌아오는 화면으로 다시 돌아가지 않게
    !next.startsWith("/auth/");
  return inside ? next : "/profile";
}
