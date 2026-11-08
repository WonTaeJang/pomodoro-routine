/**
 * 키보드 단축키 정의와 판별 규칙 (순수 함수).
 * 한글 자판 상태에서도 되도록 입력된 글자(key)가 아닌 키 위치(code)로 판단합니다.
 * 예: 한글 상태에서 R을 누르면 key는 "ㄱ"이지만 code는 "KeyR"
 */

export type ShortcutId = "toggle" | "reset" | "skip" | "settings";

type Shortcut = {
  /** KeyboardEvent.code */
  code: string;
  /** 화면에 보여줄 키 이름 (aria-keyshortcuts 값으로도 씀) */
  key: string;
};

/** 하는 일 설명은 화면 문구 사전에 (shortcuts.<id>) */
export const SHORTCUTS: Record<ShortcutId, Shortcut> = {
  toggle: { code: "Space", key: "Space" },
  reset: { code: "KeyR", key: "R" },
  skip: { code: "KeyN", key: "N" },
  settings: { code: "KeyS", key: "S" },
};

export const SHORTCUT_ORDER: ShortcutId[] = [
  "toggle",
  "reset",
  "skip",
  "settings",
];

/** 단축키 판별에 필요한 키 입력 정보 (KeyboardEvent와 그때의 화면 상태) */
export type KeyInput = {
  code: string;
  repeat: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  isComposing: boolean;
  /** 입력칸 등 글자를 쓰는 곳에서 눌렀는지 */
  inEditable: boolean;
  /**
   * 키보드(Tab)로 옮겨 간 버튼, 체크박스 등에서 눌렀는지.
   * 마우스로 누른 뒤 포커스가 남아 있는 버튼은 해당하지 않음
   */
  onKeyboardFocusedControl: boolean;
  /** 팝업(설정 창, 완료 팝업 등)이 열려 있는지 */
  dialogOpen: boolean;
};

/**
 * 이 키 입력이 어떤 단축키인지 돌려줍니다. 단축키가 아니면 null.
 * 다음 경우는 실수로 눌리지 않도록 무시합니다.
 * - 입력칸에 쓰는 중, 한글 조합 중
 * - Ctrl, ⌘, Alt, Shift와 함께 (⌘+R 새로고침 같은 브라우저 단축키를 빼앗지 않게)
 * - 키를 꾹 누르고 있어서 반복 입력될 때
 * - 팝업이 열려 있을 때
 * - Tab으로 버튼 등에 옮겨 간 상태의 Space (그 버튼을 누르려는 것이므로 브라우저에 맡김)
 *
 * 마우스로 ⏭를 누른 뒤 Space를 누르면 포커스가 ⏭에 남아 있어도 시작/일시정지로 동작합니다.
 * (브라우저 기본 동작대로면 ⏭가 한 번 더 눌려 버림)
 */
export function matchShortcut(input: KeyInput): ShortcutId | null {
  if (input.repeat || input.isComposing || input.inEditable) return null;
  if (input.ctrlKey || input.metaKey || input.altKey || input.shiftKey) {
    return null;
  }
  if (input.dialogOpen) return null;
  const id = SHORTCUT_ORDER.find((s) => SHORTCUTS[s].code === input.code);
  if (!id) return null;
  if (id === "toggle" && input.onKeyboardFocusedControl) return null;
  return id;
}
