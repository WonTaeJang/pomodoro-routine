import { readCare, type PendingCare } from "@/features/pet/pendingCare";
import type { PetProfile } from "@/features/pet/profile";
import { readSavedPet, type OutboxCare } from "@/features/pet/repository";
import { fromIso, isUuid, toIso } from "./rowValues";

// 까미 기록 ↔ 서버 표 (supabase/pet-game.sql)

/** pet_game에서 받는 열 */
export const PET_GAME_COLUMNS = "pet,version,history_until";
export type PetGameRow = {
  pet: unknown;
  version: number;
  /** 정리에 넣은 마지막 돌봄 기록의 created_at. 서버가 준 글자 그대로 씀(마이크로초까지) */
  history_until: string | null;
};

/** pet_game_history에서 받는 열 */
export const PET_HISTORY_COLUMNS =
  "id,pet_id,kind,day,at,count,item,furniture,slot,created_at";
export type PetHistoryRow = {
  id: string;
  pet_id: string;
  kind: string;
  day: string;
  at: string;
  count: number;
  item: string | null;
  furniture: string | null;
  slot: string | null;
  created_at: string;
};
export type PetHistoryInsert = Omit<PetHistoryRow, "created_at"> & {
  user_id: string;
};

/** 계정의 까미. 앱보다 새 버전이거나 읽을 수 없으면 PetStorageError를 던짐 */
export function fromPetGameRow(row: PetGameRow): PetProfile | null {
  return readSavedPet(row.version, row.pet);
}

/** 올릴 돌봄 → 표의 줄. id가 uuid가 아니면 null (올리지 않음) */
export function toHistoryRow(
  care: OutboxCare,
  userId: string,
): PetHistoryInsert | null {
  if (!isUuid(care.id)) return null;
  return {
    user_id: userId,
    id: care.id,
    pet_id: care.petId,
    kind: care.kind,
    day: care.day,
    at: toIso(care.at),
    count: care.count,
    item: care.kind === "walks" ? care.item : null,
    furniture:
      care.kind === "craft" || care.kind === "place" ? care.furniture : null,
    slot: care.kind === "place" ? care.slot : null,
  };
}

/** 표의 줄 → 돌봄. 모르는 종류(새 버전 앱)거나 값이 이상하면 null */
export function fromHistoryRow(row: PetHistoryRow): PendingCare | null {
  return readCare({
    kind: row.kind,
    day: row.day,
    at: fromIso(row.at),
    count: row.count,
    item: row.item,
    furniture: row.furniture,
    slot: row.slot,
  });
}
