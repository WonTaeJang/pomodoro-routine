import { STORAGE_KEYS } from "@/lib/storage";

/**
 * 계정과 맞출 때 기억해 둘 것 (이 브라우저, 계정 하나 기준). 새로고침해도 이어서 맞추려고 저장합니다.
 * - tasks.baseline: 서버와 같다고 확인한 할 일의 모양. 이것과 달라진 할 일 = 아직 올리지 않은 변경,
 *   여기 있는데 목록에 없는 할 일 = 이 브라우저에서 지운 할 일
 * - tasks.cursor: 서버에서 받은 할 일 중 가장 늦게 고친 시각 (다음에는 그 뒤에 바뀐 것만 받음)
 * - settings: 서버와 같다고 확인한 설정의 모양
 */
export type TaskMemory = {
  cursor: string | null;
  baseline: Record<string, string>;
};

export type SyncMemory = {
  userId: string;
  tasks: TaskMemory;
  settings: string | null;
};

const emptyMemory = (userId: string): SyncMemory => ({
  userId,
  tasks: { cursor: null, baseline: {} },
  settings: null,
});

/** 이 계정의 기억을 읽습니다. 다른 계정의 기억이거나 읽을 수 없으면 빈 기억 */
export function readSyncMemory(userId: string): SyncMemory {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.accountSync) ?? "null",
    ) as SyncMemory | null;
    if (saved?.userId !== userId) return emptyMemory(userId);
    return {
      userId,
      tasks: {
        cursor: saved.tasks?.cursor ?? null,
        baseline: saved.tasks?.baseline ?? {},
      },
      settings: saved.settings ?? null,
    };
  } catch {
    return emptyMemory(userId);
  }
}

/**
 * 이 계정의 기억 중 한 부분만 바꿔 저장합니다. 할 일과 설정을 따로 맞추므로,
 * 저장 직전에 다시 읽어서 다른 부분을 덮어쓰지 않게 합니다.
 */
export function updateSyncMemory(
  userId: string,
  patch: Partial<Omit<SyncMemory, "userId">>,
) {
  try {
    const memory = { ...readSyncMemory(userId), ...patch };
    localStorage.setItem(STORAGE_KEYS.accountSync, JSON.stringify(memory));
  } catch {
    // 저장하지 못해도 다음에 서버와 다시 비교해서 맞춤
  }
}
