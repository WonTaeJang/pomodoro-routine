import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toSettingsJson,
  type SettingsRow,
  type SyncedSettings,
} from "./settingsRows";

/** 내 설정 줄을 받아옵니다. 아직 없으면 null. 받지 못하면 오류를 던집니다. */
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

/** 내 설정을 저장합니다 (없으면 만들고, 있으면 덮어씀). 못 하면 오류를 던집니다. */
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
