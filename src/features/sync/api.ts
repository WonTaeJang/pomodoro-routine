import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompletedSession } from "@/features/timer/types";
import { chunk } from "@/lib/chunk";
import {
  fromSessionRow,
  SESSION_COLUMNS,
  toSessionRow,
  type SessionRow,
} from "./sessionRows";
import {
  toSettingsJson,
  type SettingsRow,
  type SyncedSettings,
} from "./settingsRows";
import { TASK_COLUMNS, type RemoteTaskRow, type TaskRow } from "./taskRows";

// 계정(Supabase 표)에 읽고 쓰는 조회문. 표마다 RLS가 "로그인한 본인 행만" 허용하므로
// 조건에 사용자 id를 넣지 않아도 내 것만 오고, 남의 것은 쓸 수 없음 (supabase/sync-tables.sql).
// 모두 실패하면 오류를 던집니다.

/** 한 번에 받는 줄 수. Supabase는 한 번에 1,000줄까지만 내려줌 */
const PAGE_SIZE = 1000;
/** 한 번에 쓰는 줄 수 (한 줄이 거절되면 그 묶음이 모두 실패) */
const WRITE_SIZE = 200;

type QueryResult = PromiseLike<{ data: unknown; error: unknown }>;

/** 1,000줄씩 나눠 받아 모두 모읍니다. page(from, to)는 순서가 정해진 조회여야 함 */
export async function fetchAllPages<T>(
  page: (from: number, to: number) => QueryResult,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const part = (data ?? []) as T[];
    rows.push(...part);
    if (part.length < PAGE_SIZE) return rows;
  }
}

/** 나눠서 씁니다. 하나라도 실패하면 거기서 멈추고 오류를 던짐 */
export async function writeInChunks<T>(
  items: T[],
  write: (part: T[]) => PromiseLike<{ error: unknown }>,
): Promise<void> {
  for (const part of chunk(items, WRITE_SIZE)) {
    const { error } = await write(part);
    if (error) throw error;
  }
}

// 집중 기록 ---------------------------------------------------------------

/** 내 집중 기록을 모두 받아옵니다. */
export async function fetchSessions(
  supabase: SupabaseClient,
): Promise<CompletedSession[]> {
  const rows = await fetchAllPages<Omit<SessionRow, "user_id">>((from, to) =>
    supabase
      .from("sessions")
      .select(SESSION_COLUMNS)
      // 나눠 받는 동안 순서가 흔들리지 않게 기본 키 순서로
      .order("ended_at")
      .order("mode")
      .range(from, to),
  );
  return rows.map(fromSessionRow).filter((session) => session !== null);
}

/** 집중 기록을 올립니다. 이미 있는 기록(같은 종류, 같은 끝난 시각)은 건너뜀 */
export async function uploadSessions(
  supabase: SupabaseClient,
  userId: string,
  sessions: CompletedSession[],
): Promise<void> {
  const rows = sessions
    .map((session) => toSessionRow(session, userId))
    .filter((row) => row !== null);
  await writeInChunks(rows, (part) =>
    supabase.from("sessions").upsert(part, {
      onConflict: "user_id,mode,ended_at",
      ignoreDuplicates: true,
    }),
  );
}

// 할 일 -------------------------------------------------------------------

/** since 이후에 고친 내 할 일을 모두 받아옵니다 (지운 표시가 된 것 포함). since가 없으면 전부 */
export function fetchTasksSince(
  supabase: SupabaseClient,
  since: string | null,
): Promise<RemoteTaskRow[]> {
  return fetchAllPages<RemoteTaskRow>((from, to) => {
    let query = supabase.from("tasks").select(TASK_COLUMNS);
    if (since) query = query.gte("updated_at", since);
    return query.order("updated_at").order("id").range(from, to);
  });
}

/** 할 일을 올립니다. 서버에 이미 있으면 덮어씀 ("나중에 고친 쪽이 이김") */
export function uploadTasks(
  supabase: SupabaseClient,
  rows: TaskRow[],
): Promise<void> {
  return writeInChunks(rows, (part) =>
    supabase.from("tasks").upsert(part, { onConflict: "user_id,id" }),
  );
}

/** 할 일에 지운 표시를 합니다. 줄을 없애지 않아서 아직 그 할 일을 가진 다른 기기도 지워진 걸 앎 */
export function markTasksDeleted(
  supabase: SupabaseClient,
  ids: string[],
  deletedAt: string,
): Promise<void> {
  return writeInChunks(ids, (part) =>
    supabase.from("tasks").update({ deleted_at: deletedAt }).in("id", part),
  );
}

// 설정 --------------------------------------------------------------------

/** 내 설정 줄을 받아옵니다. 아직 없으면 null */
export async function fetchSettings(
  supabase: SupabaseClient,
): Promise<SettingsRow | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("settings,active_task_id")
    .maybeSingle();
  if (error) throw error;
  return data as SettingsRow | null;
}

/** 내 설정을 저장합니다 (없으면 만들고, 있으면 덮어씀) */
export async function uploadSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: SyncedSettings,
): Promise<void> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      settings: toSettingsJson(settings),
      active_task_id: settings.activeTaskId,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}
