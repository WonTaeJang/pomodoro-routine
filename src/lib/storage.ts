// 레이아웃의 시작 스크립트(서버에서 만듦)에서도 쓰므로 "use client" 없이 둡니다.

/** 브라우저(localStorage)에 저장하는 이름. 한곳에서 관리합니다. */
export const STORAGE_KEYS = {
  timer: "kkamodoro-timer",
  history: "kkamodoro-history",
  tasks: "kkamodoro-tasks",
  theme: "kkamodoro-theme",
  /** 데이터가 아니라 탭끼리 정하는 값: 소리와 알림을 낼 탭 (src/lib/soundTab.ts) */
  soundTab: "kkamodoro-sound-tab",
} as const;

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
