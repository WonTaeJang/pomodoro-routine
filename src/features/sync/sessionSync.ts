import { sessionKey } from "@/features/history/sessions";
import type { CompletedSession } from "@/features/timer/types";

type SessionSyncDeps = {
  /** 서버의 내 기록 전부 */
  fetchAll: () => Promise<CompletedSession[]>;
  /** 서버에 올리기 (이미 있는 것은 서버가 건너뜀) */
  upload: (sessions: CompletedSession[]) => Promise<void>;
  /** 이 브라우저의 기록 */
  getLocal: () => CompletedSession[];
  /** 서버에서 받은 기록을 이 브라우저 기록에 합치기 (이미 있는 것은 빼고) */
  mergeLocal: (sessions: CompletedSession[]) => void;
};

export type SessionSync = {
  /**
   * 서버와 맞춥니다: (처음이거나 refresh면) 서버 기록을 받아 합치고, 서버에 없는 기록을 올림.
   * 실패해도 던지지 않고 false를 돌려주며, 다음에 부르면 못 한 것부터 다시 합니다.
   */
  sync: (options?: { refresh?: boolean }) => Promise<boolean>;
  /**
   * 그만 맞춥니다 (로그아웃, 계정 바꿈). 서버 응답을 기다리던 중이어도
   * 그 뒤로는 브라우저 기록에 합치거나 서버에 올리지 않습니다.
   */
  stop: () => void;
};

/**
 * 한 계정의 집중 기록 맞추기. 기록은 추가만 되고 바뀌지 않으므로
 * "서버에 있는 것으로 확인한 기록"만 기억해 두고, 거기 없는 것을 올리면 됩니다.
 * 계정이 바뀌면 새로 만듭니다.
 */
export function createSessionSync(deps: SessionSyncDeps): SessionSync {
  /** 서버에 있는 것으로 확인한 기록. 아직 한 번도 받아오지 못했으면 null */
  let known: Set<string> | null = null;
  let running: Promise<boolean> | null = null;
  /** 맞추는 중에 또 요청이 왔으면 끝난 뒤 한 번 더 (그 사이 생긴 기록을 올리게) */
  let queued: { refresh: boolean } | null = null;
  let stopped = false;

  async function run(refresh: boolean): Promise<boolean> {
    try {
      if (!known || refresh) {
        const remote = await deps.fetchAll();
        if (stopped) return false;
        known = new Set([...(known ?? []), ...remote.map(sessionKey)]);
        deps.mergeLocal(remote);
      }
      const confirmed = known;
      const pending = deps
        .getLocal()
        .filter((session) => !confirmed.has(sessionKey(session)));
      if (pending.length > 0) {
        await deps.upload(pending);
        if (stopped) return false;
        for (const session of pending) confirmed.add(sessionKey(session));
      }
      return true;
    } catch {
      // 인터넷이 끊겼거나 서버 오류: 브라우저 기록은 그대로이므로 다음에 다시 맞춤
      return false;
    }
  }

  function sync({ refresh = false } = {}): Promise<boolean> {
    if (stopped) return Promise.resolve(false);
    if (running) {
      queued = { refresh: refresh || queued?.refresh === true };
      return running;
    }
    running = run(refresh).finally(() => {
      running = null;
      if (queued) {
        const next = queued;
        queued = null;
        void sync(next);
      }
    });
    return running;
  }

  return {
    sync,
    stop: () => {
      stopped = true;
      queued = null;
    },
  };
}
