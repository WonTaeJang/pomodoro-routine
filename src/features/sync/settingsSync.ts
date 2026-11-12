import { createRunner, type Runner } from "./runner";
import {
  fromSettingsRow,
  settingsShape,
  type SettingsRow,
  type SyncedSettings,
} from "./settingsRows";

type SettingsSyncDeps = {
  /** 서버의 내 설정 (없으면 null) */
  fetch: () => Promise<SettingsRow | null>;
  /** 서버에 저장 (덮어씀) */
  upload: (settings: SyncedSettings) => Promise<void>;
  /** 이 브라우저의 설정 */
  getLocal: () => SyncedSettings;
  /** 서버 설정을 이 브라우저에 반영 */
  setLocal: (settings: SyncedSettings) => void;
  /** 서버와 같다고 확인한 설정의 모양 읽기·쓰기 */
  readMemory: () => string | null;
  writeMemory: (shape: string | null) => void;
};

/**
 * 한 계정의 설정 맞추기. sync()는 (처음이거나 refresh면) 서버 설정을 받아, 이 브라우저에서
 * 고치지 않았으면 반영하고, 이 브라우저에서 고쳤으면 올립니다 ("나중에 고친 쪽이 이김").
 * 이 브라우저에서 처음 맞출 때 서버에 설정이 있으면 서버 설정을 따릅니다.
 */
export function createSettingsSync(deps: SettingsSyncDeps): Runner {
  let pulled = false;

  return createRunner(async (refresh, isStopped) => {
    let memory = deps.readMemory();
    try {
      if (!pulled || refresh) {
        const row = await deps.fetch();
        if (isStopped()) return false;
        const local = deps.getLocal();
        if (row) {
          const remote = fromSettingsRow(row, local);
          const remoteShape = settingsShape(remote);
          // 이 브라우저에서 처음 맞추는 거면(기억 없음) 계정 설정을 따름 (새 기기에서 로그인)
          const editedHere = memory !== null && settingsShape(local) !== memory;
          if (!editedHere && remoteShape !== memory) {
            deps.setLocal(remote);
            memory = remoteShape;
          } else if (settingsShape(local) === remoteShape) {
            memory = remoteShape;
          }
        }
        pulled = true;
      }
      const local = deps.getLocal();
      const shape = settingsShape(local);
      if (shape !== memory) {
        await deps.upload(local);
        if (isStopped()) return false;
        memory = shape;
      }
      return true;
    } finally {
      // 실패해도 확인한 데까지는 기억
      if (!isStopped()) deps.writeMemory(memory);
    }
  });
}
