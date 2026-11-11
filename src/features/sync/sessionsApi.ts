import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompletedSession } from "@/features/timer/types";
import { chunk } from "@/lib/chunk";
import {
  fromSessionRow,
  SESSION_COLUMNS,
  toSessionRow,
  type SessionRow,
} from "./sessionRows";

/** 한 번에 받는 줄 수. Supabase는 한 번에 1,000줄까지만 내려줌 */
const PAGE_SIZE = 1000;
/** 한 번에 올리는 줄 수 */
const UPLOAD_SIZE = 500;

/**
 * 내 집중 기록을 모두 받아옵니다. (RLS가 내 것만 내려줌)
 * 받지 못하면 오류를 던집니다.
 */
export async function fetchSessions(
  supabase: SupabaseClient,
): Promise<CompletedSession[]> {
  const sessions: CompletedSession[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("sessions")
      .select(SESSION_COLUMNS)
      // 나눠 받는 동안 순서가 흔들리지 않게 기본 키 순서로
      .order("ended_at")
      .order("mode")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = data as unknown as Omit<SessionRow, "user_id">[];
    for (const row of rows) {
      const session = fromSessionRow(row);
      if (session) sessions.push(session);
    }
    if (rows.length < PAGE_SIZE) return sessions;
  }
}

/**
 * 집중 기록을 내 계정에 올립니다. 이미 있는 기록(같은 종류, 같은 끝난 시각)은 건너뜁니다.
 * 올리지 못하면 오류를 던집니다.
 */
export async function uploadSessions(
  supabase: SupabaseClient,
  userId: string,
  sessions: CompletedSession[],
): Promise<void> {
  const rows = sessions
    .map((session) => toSessionRow(session, userId))
    .filter((row) => row !== null);
  for (const part of chunk(rows, UPLOAD_SIZE)) {
    const { error } = await supabase.from("sessions").upsert(part, {
      onConflict: "user_id,mode,ended_at",
      ignoreDuplicates: true,
    });
    if (error) throw error;
  }
}
