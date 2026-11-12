import type { SupabaseClient } from "@supabase/supabase-js";
import { chunk } from "@/lib/chunk";
import { TASK_COLUMNS, type RemoteTaskRow, type TaskRow } from "./taskRows";

/** 한 번에 받는 줄 수. Supabase는 한 번에 1,000줄까지만 내려줌 */
const PAGE_SIZE = 1000;
/** 한 번에 올리거나 지우는 줄 수 */
const WRITE_SIZE = 200;

/**
 * since 이후에 고친 내 할 일을 모두 받아옵니다 (지운 표시가 된 것 포함). since가 없으면 전부.
 * 받지 못하면 오류를 던집니다.
 */
export async function fetchTasksSince(
  supabase: SupabaseClient,
  since: string | null,
): Promise<RemoteTaskRow[]> {
  const rows: RemoteTaskRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase.from("tasks").select(TASK_COLUMNS);
    if (since) query = query.gte("updated_at", since);
    const { data, error } = await query
      // 나눠 받는 동안 순서가 흔들리지 않게
      .order("updated_at")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = data as unknown as RemoteTaskRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/** 할 일을 올립니다. 서버에 이미 있으면 덮어씀 ("나중에 고친 쪽이 이김"). 못 올리면 오류를 던집니다. */
export async function uploadTasks(
  supabase: SupabaseClient,
  rows: TaskRow[],
): Promise<void> {
  for (const part of chunk(rows, WRITE_SIZE)) {
    const { error } = await supabase
      .from("tasks")
      .upsert(part, { onConflict: "user_id,id" });
    if (error) throw error;
  }
}

/**
 * 할 일에 지운 표시를 합니다. 줄을 없애지 않아서 아직 그 할 일을 가진 다른 기기도 지워진 걸 압니다.
 * 못 하면 오류를 던집니다.
 */
export async function markTasksDeleted(
  supabase: SupabaseClient,
  ids: string[],
  deletedAt: string,
): Promise<void> {
  for (const part of chunk(ids, WRITE_SIZE)) {
    const { error } = await supabase
      .from("tasks")
      .update({ deleted_at: deletedAt })
      .in("id", part);
    if (error) throw error;
  }
}
