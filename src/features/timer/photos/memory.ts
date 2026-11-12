import { STORAGE_KEYS } from "@/lib/storage";
import type { PhotoPool } from "./pools";

/** 사진을 보여 주는 자리. timer: 타이머 화면, completion: 완료 팝업 */
export type PhotoSlot = "timer" | "completion";

/**
 * 어떤 사진을 보여 주고 있는지 기억해 둔 것 (이 브라우저 기준).
 * - slots: 자리마다 지금 보여 주는 사진. key가 같은 동안(같은 세션)은 같은 사진을 계속 보여 줌
 * - last: 사진 묶음마다 마지막으로 고른 사진. 다음에 같은 사진이 바로 또 나오지 않게 함
 */
export type PhotoMemory = {
  slots: Partial<Record<PhotoSlot, { key: string; index: number }>>;
  last: Partial<Record<PhotoPool, number>>;
};

const EMPTY: PhotoMemory = { slots: {}, last: {} };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIndex(value: unknown, count: number): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= 0 &&
    (value as number) < count
  );
}

/** 저장된 글을 읽습니다. 없거나 깨졌으면 빈 기억 */
export function parsePhotoMemory(raw: string | null): PhotoMemory {
  if (raw === null) return EMPTY;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved)) return EMPTY;
    return {
      slots: isRecord(saved.slots) ? (saved.slots as PhotoMemory["slots"]) : {},
      last: isRecord(saved.last) ? (saved.last as PhotoMemory["last"]) : {},
    };
  } catch {
    return EMPTY;
  }
}

/** 사진 count장 중 하나를 랜덤으로. avoid번 사진은 (다른 사진이 있으면) 피함 */
export function pickIndex(
  count: number,
  avoid: number | undefined,
  random: () => number = Math.random,
): number {
  if (count <= 1) return 0;
  if (!isIndex(avoid, count)) return Math.floor(random() * count);
  const index = Math.floor(random() * (count - 1));
  return index >= avoid ? index + 1 : index;
}

/** 이 자리에 key 세션의 사진이 이미 정해져 있으면 그 번호, 아니면 null */
export function shownIndex(
  memory: PhotoMemory,
  slot: PhotoSlot,
  key: string,
  count: number,
): number | null {
  const shown = memory.slots[slot];
  return shown?.key === key && isIndex(shown.index, count) ? shown.index : null;
}

/**
 * 이 자리에 보여 줄 사진을 정합니다. 같은 세션(key)이면 그대로 두고(같은 기억을 돌려줌),
 * 새 세션이면 묶음(pool)에서 바로 전과 다른 사진을 새로 고릅니다.
 */
export function choosePhoto(
  memory: PhotoMemory,
  slot: PhotoSlot,
  key: string,
  pool: PhotoPool,
  count: number,
  random: () => number = Math.random,
): PhotoMemory {
  if (shownIndex(memory, slot, key, count) !== null) return memory;
  const index = pickIndex(count, memory.last[pool], random);
  return {
    slots: { ...memory.slots, [slot]: { key, index } },
    last: { ...memory.last, [pool]: index },
  };
}

// --- 브라우저 저장 ---

const listeners = new Set<() => void>();
/** localStorage를 쓸 수 없을 때(사생활 보호 모드 등) 대신 쓰는 값 */
let memoryOnly: string | null = null;
let storageBroken = false;

/** 저장된 기억(글 그대로). 화면에서 바뀜을 알아채는 기준으로 씀 */
export function readPhotoMemory(): string | null {
  if (storageBroken) return memoryOnly;
  try {
    return localStorage.getItem(STORAGE_KEYS.kkamiPhotos);
  } catch {
    storageBroken = true;
    return memoryOnly;
  }
}

function writePhotoMemory(value: string) {
  memoryOnly = value;
  try {
    localStorage.setItem(STORAGE_KEYS.kkamiPhotos, value);
  } catch {
    storageBroken = true;
  }
  listeners.forEach((listener) => listener());
}

/** 기억이 바뀌면 알려 줌 (다른 탭에서 바꾼 것 포함) */
export function subscribePhotoMemory(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.kkamiPhotos) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** 이 자리의 사진이 아직 정해지지 않았으면 골라서 저장 */
export function ensurePhoto(
  slot: PhotoSlot,
  key: string,
  pool: PhotoPool,
  count: number,
) {
  const memory = parsePhotoMemory(readPhotoMemory());
  const next = choosePhoto(memory, slot, key, pool, count);
  if (next !== memory) writePhotoMemory(JSON.stringify(next));
}
