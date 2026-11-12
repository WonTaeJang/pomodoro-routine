// 레이아웃의 시작 스크립트(서버에서 만듦)에서도 쓰므로 "use client" 없이 둡니다.

import type { StateStorage } from "zustand/middleware";

/** 브라우저(localStorage)에 저장하는 이름. 한곳에서 관리합니다. */
export const STORAGE_KEYS = {
  timer: "kkamodoro-timer",
  history: "kkamodoro-history",
  tasks: "kkamodoro-tasks",
  pet: "kkamodoro-pet",
  theme: "kkamodoro-theme",
  /** 직접 고른 화면 언어. 고르지 않았으면 없음 (src/i18n/locale.ts) */
  locale: "kkamodoro-locale",
  /** 첫 방문 안내를 봤는지 (src/features/guide/onboarding.ts) */
  onboarding: "kkamodoro-onboarding",
  /** 로그인 정보. Supabase가 직접 읽고 씀 (src/features/auth/supabase.ts) */
  auth: "kkamodoro-auth",
  /** 계정과 맞출 때 기억해 둘 것: 서버와 같다고 확인한 할 일·설정 (src/features/sync/memory.ts) */
  accountSync: "kkamodoro-account-sync",
  /** 데이터가 아니라 탭끼리 정하는 값: 소리와 알림을 낼 탭 (src/lib/soundTab.ts) */
  soundTab: "kkamodoro-sound-tab",
} as const;

/** 저장 이름별로 이 탭이 마지막으로 읽거나 쓴 값 */
const lastSeen = new Map<string, string | null>();

/**
 * store들이 저장할 때 쓰는 저장소. 저장할 내용이 이 탭이 마지막으로 읽거나 쓴 값과 같으면 쓰지 않습니다.
 *
 * store는 무엇이 바뀌든(예: 저장하지 않는 완료 팝업) 저장할 부분을 통째로 다시 씁니다.
 * 탭을 여러 개 열었을 때, 다른 탭이 방금 저장한 새 값을 아직 받지 못한 탭이 이렇게 다시 쓰면
 * 예전 값으로 덮어써 버립니다. 실제로 바뀐 것이 없으면 쓰지 않아서 이를 막습니다.
 *
 * `storage`를 바로 받는 이유: 서버·테스트처럼 localStorage가 없으면 만들 때 오류가 나서
 * zustand가 저장 없이 동작하게 하기 위함 (createJSONStorage가 그 오류를 잡음)
 */
export function tabSafeStorage(storage: Storage): StateStorage {
  return {
    getItem(name) {
      const value = storage.getItem(name);
      lastSeen.set(name, value);
      return value;
    },
    setItem(name, value) {
      if (lastSeen.get(name) === value) return;
      lastSeen.set(name, value);
      storage.setItem(name, value);
    },
    removeItem(name) {
      lastSeen.delete(name);
      storage.removeItem(name);
    },
  };
}

/**
 * 서비스 이름을 "까미도로"에서 "까모도로"로 바꾸기 전의 저장 이름.
 * 예전 이름으로 저장된 데이터를 새 이름으로 옮기는 데만 씁니다.
 * (공개 전 개발 중에 쌓인 데이터용이라, 공개 후 충분히 지나면 지워도 됩니다)
 */
const LEGACY_STORAGE_KEYS: Record<string, string> = {
  "kkamidoro-timer": STORAGE_KEYS.timer,
  "kkamidoro-history": STORAGE_KEYS.history,
  "kkamidoro-tasks": STORAGE_KEYS.tasks,
  "kkamidoro-theme": STORAGE_KEYS.theme,
};

/**
 * 화면이 그려지기 전에 실행되어, 예전 이름의 데이터를 새 이름으로 옮기는 스크립트.
 * 새 이름에 이미 데이터가 있으면 덮어쓰지 않고, 예전 데이터는 지웁니다.
 */
export const migrateLegacyStorageScript = `try{var m=${JSON.stringify(
  LEGACY_STORAGE_KEYS,
)};for(var o in m){var v=localStorage.getItem(o);if(v!==null){if(localStorage.getItem(m[o])===null)localStorage.setItem(m[o],v);localStorage.removeItem(o)}}}catch(e){}`;
