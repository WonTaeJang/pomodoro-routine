import { describe, expect, it } from "vitest";
import { toAdminStats, toAdminUser } from "./api";

describe("toAdminUser", () => {
  it("서버 한 줄을 화면 모양으로 (개수는 글자로 와도 숫자로)", () => {
    expect(
      toAdminUser({
        id: "u1",
        email: "a@example.com",
        nickname: "까미",
        provider: "kakao",
        created_at: "2026-11-14T00:00:00Z",
        last_sign_in_at: null,
        vip: true,
        focus_count: "12",
      }),
    ).toEqual({
      id: "u1",
      email: "a@example.com",
      nickname: "까미",
      provider: "kakao",
      createdAt: Date.parse("2026-11-14T00:00:00Z"),
      lastSignInAt: null,
      vip: true,
      focusCount: 12,
    });
  });

  it("빈 값은 없음으로, VIP는 true일 때만", () => {
    const user = toAdminUser({ id: "u2", email: "", vip: "yes" });
    expect(user.email).toBeNull();
    expect(user.nickname).toBe("");
    expect(user.vip).toBe(false);
    expect(user.focusCount).toBe(0);
  });
});

describe("toAdminStats", () => {
  it("없는 값은 0", () => {
    expect(toAdminStats({ total_users: 3, vip_users: "1" })).toEqual({
      totalUsers: 3,
      vipUsers: 1,
      newUsers7d: 0,
      activeUsers7d: 0,
      focusSessions7d: 0,
    });
  });
});
