import { getSupabase } from "@/features/auth";

/**
 * 관리자 페이지와 VIP 표시 (supabase/admin.sql).
 * 관리자 확인은 서버 함수가 하므로, 관리자가 아니면 목록·통계·VIP 바꾸기가 모두 거부됩니다.
 */

export type AdminUser = {
  id: string;
  email: string | null;
  nickname: string;
  provider: string | null;
  /** epoch ms */
  createdAt: number;
  lastSignInAt: number | null;
  vip: boolean;
  focusCount: number;
};

export type AdminStats = {
  totalUsers: number;
  vipUsers: number;
  newUsers7d: number;
  activeUsers7d: number;
  focusSessions7d: number;
};

type Row = Record<string, unknown>;

const text = (value: unknown) =>
  typeof value === "string" && value !== "" ? value : null;
const time = (value: unknown) => {
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? null : parsed;
};
/** 개수(bigint)는 숫자나 글자로 올 수 있음 */
const count = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** 서버 함수 admin_list_users의 한 줄 → 화면에서 쓰는 모양 */
export function toAdminUser(row: Row): AdminUser {
  return {
    id: String(row.id),
    email: text(row.email),
    nickname: text(row.nickname) ?? "",
    provider: text(row.provider),
    createdAt: time(row.created_at) ?? 0,
    lastSignInAt: time(row.last_sign_in_at),
    vip: row.vip === true,
    focusCount: count(row.focus_count),
  };
}

/** 서버 함수 admin_stats의 결과(한 줄) → 화면에서 쓰는 모양 */
export function toAdminStats(row: Row): AdminStats {
  return {
    totalUsers: count(row.total_users),
    vipUsers: count(row.vip_users),
    newUsers7d: count(row.new_users_7d),
    activeUsers7d: count(row.active_users_7d),
    focusSessions7d: count(row.focus_sessions_7d),
  };
}

/** 관리자 페이지에 보일 것. 관리자가 아니거나 실패하면 null */
export async function fetchAdminData(): Promise<{
  users: AdminUser[];
  stats: AdminStats;
} | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const [users, stats] = await Promise.all([
    supabase.rpc("admin_list_users"),
    supabase.rpc("admin_stats"),
  ]);
  if (users.error || stats.error) return null;
  const statsRow = (Array.isArray(stats.data) ? stats.data[0] : stats.data) as
    Row | undefined;
  return {
    users: ((users.data ?? []) as Row[]).map(toAdminUser),
    stats: toAdminStats(statsRow ?? {}),
  };
}

/** 회원의 VIP를 켜거나 끕니다. 성공하면 true */
export async function setVip(userId: string, on: boolean): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.rpc("admin_set_vip", {
    target: userId,
    on_vip: on,
  });
  if (!error) forgetAccountFlags(userId);
  return !error;
}

// --- 지금 로그인한 계정이 관리자·VIP인지 ---

export type AccountFlags = { admin: boolean; vip: boolean };

const NO_FLAGS: AccountFlags = { admin: false, vip: false };
/** 계정마다 한 번만 물어봄 (메뉴·프로필이 함께 씀) */
const flagsCache = new Map<string, Promise<AccountFlags>>();

async function loadAccountFlags(userId: string): Promise<AccountFlags> {
  const supabase = getSupabase();
  if (!supabase) return NO_FLAGS;
  const [admin, vip] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("vip_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  // admin.sql을 아직 실행하지 않았거나 실패하면 둘 다 아님으로 (화면은 그대로)
  return {
    admin: !admin.error && admin.data === true,
    vip: !vip.error && vip.data !== null,
  };
}

export function getAccountFlags(userId: string): Promise<AccountFlags> {
  let flags = flagsCache.get(userId);
  if (!flags) {
    flags = loadAccountFlags(userId).catch(() => NO_FLAGS);
    flagsCache.set(userId, flags);
  }
  return flags;
}

/** VIP를 바꾼 계정은 다음에 다시 물어봄 */
function forgetAccountFlags(userId: string) {
  flagsCache.delete(userId);
}
