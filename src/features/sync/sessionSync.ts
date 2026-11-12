import { sessionKey } from "@/features/history/sessions";
import type { CompletedSession } from "@/features/timer/types";
import { createRunner, type Runner } from "./runner";

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

/**
 * 한 계정의 집중 기록 맞추기. sync()는 (처음이거나 refresh면) 서버 기록을 받아 합치고,
 * 서버에 없는 기록을 올립니다. 실패하면 false이고 다음에 부르면 못 한 것부터 다시 합니다.
 * 기록은 추가만 되고 바뀌지 않으므로 "서버에 있는 것으로 확인한 기록"만 기억해 두고,
 * 거기 없는 것을 올리면 됩니다. 계정이 바뀌면 새로 만듭니다.
 */
export function createSessionSync(deps: SessionSyncDeps): Runner {
  /** 서버에 있는 것으로 확인한 기록. 아직 한 번도 받아오지 못했으면 null */
  let known: Set<string> | null = null;

  return createRunner(async (refresh, isStopped) => {
    try {
      if (!known || refresh) {
        const remote = await deps.fetchAll();
        if (isStopped()) return false;
        known = new Set([...(known ?? []), ...remote.map(sessionKey)]);
        deps.mergeLocal(remote);
      }
      const confirmed = known;
      const pending = deps
        .getLocal()
        .filter((session) => !confirmed.has(sessionKey(session)));
      if (pending.length > 0) {
        await deps.upload(pending);
        if (isStopped()) return false;
        for (const session of pending) confirmed.add(sessionKey(session));
      }
      return true;
    } catch {
      // 인터넷이 끊겼거나 서버 오류: 브라우저 기록은 그대로이므로 다음에 다시 맞춤
      return false;
    }
  });
}
