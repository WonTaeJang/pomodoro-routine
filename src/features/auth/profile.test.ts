import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { checkNickname, profileOf, safeNextPath } from "./profile";

function user(meta: Record<string, unknown>, email = "kkami@example.com") {
  return {
    id: "1",
    email,
    created_at: "2026-11-10T01:00:00Z",
    app_metadata: { provider: "google" },
    user_metadata: meta,
  } as unknown as User;
}

describe("프로필", () => {
  it("직접 정한 닉네임이 먼저", () => {
    const p = profileOf(user({ nickname: " 까미 ", full_name: "Kim" }));
    expect(p.nickname).toBe("까미");
    expect(p.customNickname).toBe(true);
  });

  it("닉네임이 없으면 구글 이름 → 이메일 앞부분", () => {
    expect(profileOf(user({ full_name: "Won Tae" })).nickname).toBe("Won Tae");
    expect(profileOf(user({ name: "WT" })).nickname).toBe("WT");
    const fallback = profileOf(user({}));
    expect(fallback.nickname).toBe("kkami");
    expect(fallback.customNickname).toBe(false);
  });

  it("사진, 이메일, 로그인 방법, 가입 시각", () => {
    const p = profileOf(user({ picture: "https://example.com/a.png" }));
    expect(p.avatarUrl).toBe("https://example.com/a.png");
    expect(p.email).toBe("kkami@example.com");
    expect(p.provider).toBe("google");
    expect(p.createdAt).toBe(Date.parse("2026-11-10T01:00:00Z"));
  });
});

describe("카카오 로그인 프로필", () => {
  it("이메일이 없어도 이름·사진으로 만들고, http 사진 주소는 https로", () => {
    const kakao = {
      ...user(
        { name: "까미", avatar_url: "http://k.kakaocdn.net/a.jpg" },
        undefined,
      ),
      email: undefined,
      app_metadata: { provider: "kakao" },
    } as unknown as User;
    const p = profileOf(kakao);
    expect(p.nickname).toBe("까미");
    expect(p.avatarUrl).toBe("https://k.kakaocdn.net/a.jpg");
    expect(p.email).toBeNull();
    expect(p.provider).toBe("kakao");
  });
});

describe("닉네임 확인", () => {
  it("앞뒤 공백을 떼고 가운데 공백은 하나로", () => {
    expect(checkNickname("  까미  짱 ")).toEqual({
      ok: true,
      value: "까미 짱",
    });
  });

  it("비우면 직접 정한 닉네임을 지움 (빈 값)", () => {
    expect(checkNickname("   ")).toEqual({ ok: true, value: "" });
  });

  it("20자를 넘으면 안 됨", () => {
    expect(checkNickname("가".repeat(20)).ok).toBe(true);
    expect(checkNickname("가".repeat(21))).toEqual({
      ok: false,
      reason: "tooLong",
    });
  });

  it("이모지는 한 글자로 셈", () => {
    expect(checkNickname("🐩".repeat(20)).ok).toBe(true);
  });
});

describe("로그인 뒤 돌아갈 주소", () => {
  it("이 사이트 안의 주소만", () => {
    expect(safeNextPath("/calendar")).toBe("/calendar");
    expect(safeNextPath("/pet?x=1")).toBe("/pet?x=1");
  });

  it("다른 사이트나 이상한 값이면 프로필로", () => {
    for (const next of [
      null,
      "",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/auth/callback",
    ]) {
      expect(safeNextPath(next)).toBe("/profile");
    }
  });
});
