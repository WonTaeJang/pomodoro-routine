import { applyPending, type PendingCare } from "@/features/pet/pendingCare";
import type { PetProfile } from "@/features/pet/profile";
import type { OutboxCare, PetRecord } from "@/features/pet/repository";
import {
  fromHistoryRow,
  fromPetGameRow,
  toHistoryRow,
  type PetGameRow,
  type PetHistoryInsert,
  type PetHistoryRow,
} from "./petRows";
import { fromIso } from "./rowValues";
import { createRunner, type Runner } from "./runner";

type PetSyncDeps = {
  userId: string;
  /** 계정의 정리한 까미 기록 (없으면 null) */
  fetchGame: () => Promise<PetGameRow | null>;
  /** 계정에 까미를 처음 올림. 이미 있으면 false */
  createGame: (pet: PetProfile) => Promise<boolean>;
  /** 정리한 까미로 바꿈 (until: 정리에 넣은 마지막 돌봄 기록의 created_at) */
  compactGame: (pet: PetProfile, until: string) => Promise<void>;
  /** after 뒤에 들어온 돌봄 기록 (들어온 순서) */
  fetchHistory: (after: string | null) => Promise<PetHistoryRow[]>;
  /** 돌봄 기록 올리기 (같은 id는 건너뜀) */
  uploadHistory: (rows: PetHistoryInsert[]) => Promise<void>;
  /** 이 브라우저의 까미 기록 읽기·바꾸기 (다른 탭과 겹치지 않게 잠그고 씀) */
  loadRecord: () => Promise<PetRecord>;
  updateRecord: (
    change: (record: PetRecord) => PetRecord,
  ) => Promise<PetRecord>;
  /** 브라우저 기록을 바꿨을 때 화면(store)에 다시 불러오기 */
  reload: () => void;
  /** 지금 시각 (기기 시계) */
  now?: () => number;
};

/**
 * 정리할 때 들어온 지 이만큼이 안 된 기록은 남겨 둡니다. 거의 같은 때 다른 기기에서 들어온 기록이
 * 조금 늦게 보이더라도 정리에서 빠지지 않게 (남긴 기록은 다음 정리 때 들어감)
 */
export const SETTLE_MS = 10_000;
/** 처음 올리기와 다른 기기가 겹쳐도 다시 받아서 맞추는 횟수 */
const MAX_ROUNDS = 3;

/** 이 까미의 돌봄만, 들어온 순서대로. 읽을 수 없는 줄은 건너뜀 */
function caresOf(rows: readonly PetHistoryRow[], petId: string): PendingCare[] {
  return rows.flatMap((row) => {
    const care = row.pet_id === petId ? fromHistoryRow(row) : null;
    return care ? [care] : [];
  });
}

/**
 * 이 브라우저에서 올릴 것이 있는지: 계정 까미면 못 올린 돌봄, 아니면 까미 자체
 * (계정에 까미가 없으면 올리고, 있으면 계정 까미로 바꿈)
 */
export function hasUnsent(record: PetRecord, userId: string): boolean {
  return record.account?.userId === userId
    ? record.account.outbox.length > 0
    : record.pet !== null;
}

/**
 * 정리할 수 있는 앞부분: 들어온 지 SETTLE_MS가 안 된 기록과, 읽을 수 없는 줄(새 버전 앱의 기록)부터는
 * 남깁니다. 정리할 것이 없으면 null.
 * 들어온 시각은 서버 시계라, 기기 시계가 늦으면 받은 기록 중 가장 늦은 것을 지금으로 봄
 */
function settledHistory(rows: readonly PetHistoryRow[], now: number) {
  const latest = Math.max(...rows.map((row) => fromIso(row.created_at)));
  const cutoff = Math.max(latest, now) - SETTLE_MS;
  let end = 0;
  while (
    end < rows.length &&
    fromIso(rows[end].created_at) <= cutoff &&
    fromHistoryRow(rows[end]) !== null
  )
    end++;
  return end === 0
    ? null
    : { rows: rows.slice(0, end), until: rows[end - 1].created_at };
}

/**
 * 한 계정의 까미 맞추기. 계정의 까미 = pet_game(정리한 기록) + 그 뒤 돌봄 기록을 들어온 순서대로 적용.
 * 이 브라우저의 까미 = 계정의 까미 + 아직 올리지 못한 돌봄(outbox).
 * - 계정에 까미가 없으면: 이 브라우저의 까미(게스트로 키운 것 포함)를 정리한 기록으로 올림
 * - 계정에 까미가 있으면: 같은 까미면 못 올린 돌봄을 올리고 받아서 맞춤,
 *   다른 까미(게스트 까미, 다른 기기에서 처음 만난 까미)면 계정 까미로 바꿈
 * - sync({ refresh: true })면 정리까지: 받은 돌봄 기록을 pet_game에 넣음 (다마고치 화면에 들어올 때)
 * 정리된 돌봄 기록은 하루 뒤 서버가 지움 (supabase/pet-game.sql 3번)
 */
export function createPetSync(deps: PetSyncDeps): Runner {
  const { userId, now = Date.now } = deps;

  /**
   * 바뀌었을 때만 쓰고 화면에 다시 불러옴. 그만둔 뒤(로그아웃)에는 쓰지 않음:
   * 잠금을 기다리는 사이 로그아웃으로 지운 기록을 되살리지 않게
   */
  async function rewrite(
    change: (record: PetRecord) => PetRecord,
    isStopped: () => boolean,
  ) {
    let changed = false;
    await deps.updateRecord((record) => {
      if (isStopped()) return record;
      const next = change(record);
      changed = JSON.stringify(next) !== JSON.stringify(record);
      return next;
    });
    if (changed) deps.reload();
  }

  /** 계정에 까미가 없을 때: 이 브라우저의 까미를 올림. 올릴 까미가 없으면 false */
  async function uploadLocal(isStopped: () => boolean): Promise<boolean> {
    const claimed: { pet: PetProfile | null } = { pet: null };
    await rewrite((record) => {
      // 다른 계정의 까미 (로그아웃 때 지우지 못함): 올리지 않고 지움
      if (record.account && record.account.userId !== userId)
        return { pet: null, account: null };
      if (!record.pet) return record;
      // 지금까지의 돌봄은 올릴 까미에 모두 들어 있음. 이 뒤의 돌봄부터 outbox에 쌓임
      claimed.pet = record.pet;
      return { pet: record.pet, account: { userId, outbox: [] } };
    }, isStopped);
    if (!claimed.pet || isStopped()) return false;
    // 이미 있으면(다른 기기가 먼저 올림) 다음 번에 받아서 계정 까미를 따름
    await deps.createGame(claimed.pet);
    return true;
  }

  async function follow(
    game: PetGameRow,
    compact: boolean,
    isStopped: () => boolean,
  ) {
    const accountPet = fromPetGameRow(game);
    if (!accountPet) return;
    const petId = accountPet.id;
    /** 이 계정의 이 까미에 쌓인 못 올린 돌봄. 다른 까미(바뀔 것)면 없음 */
    const unsentOf = ({ pet, account }: PetRecord): OutboxCare[] =>
      account?.userId === userId && pet?.id === petId
        ? account.outbox.filter((care) => care.petId === petId)
        : [];

    const sending = unsentOf(await deps.loadRecord());
    const rows = sending.flatMap((care) => toHistoryRow(care, userId) ?? []);
    if (rows.length > 0) await deps.uploadHistory(rows);
    if (isStopped()) return;
    const sent = new Set(sending.map((care) => care.id));

    const history = await deps.fetchHistory(game.history_until);
    if (isStopped()) return;
    const current = applyPending(accountPet, caresOf(history, petId));
    await rewrite((latest) => {
      // 이 사이에 생긴 돌봄은 남겨서 다음에 올림. 다른 까미였으면 계정 까미로 바꾸고 비움
      const outbox = unsentOf(latest).filter((care) => !sent.has(care.id));
      return {
        pet: applyPending(current, outbox),
        account: { userId, outbox },
      };
    }, isStopped);

    if (!compact || history.length === 0 || isStopped()) return;
    const settled = settledHistory(history, now());
    if (!settled) return;
    await deps.compactGame(
      applyPending(accountPet, caresOf(settled.rows, petId)),
      settled.until,
    );
  }

  return createRunner(async (compact, isStopped) => {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const game = await deps.fetchGame();
      if (isStopped()) return false;
      if (game) {
        await follow(game, compact, isStopped);
        return !isStopped();
      }
      if (!(await uploadLocal(isStopped))) return !isStopped();
      if (isStopped()) return false;
    }
    return false;
  });
}
