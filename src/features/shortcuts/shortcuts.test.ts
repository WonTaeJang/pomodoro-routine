import { describe, expect, it } from "vitest";
import { matchShortcut, type KeyInput } from "./shortcuts";

const key = (code: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  code,
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  isComposing: false,
  inEditable: false,
  onKeyboardFocusedControl: false,
  dialogOpen: false,
  ...extra,
});

describe("단축키 판별", () => {
  it("Space, R, N, S를 알아본다", () => {
    expect(matchShortcut(key("Space"))).toBe("toggle");
    expect(matchShortcut(key("KeyR"))).toBe("reset");
    expect(matchShortcut(key("KeyN"))).toBe("skip");
    expect(matchShortcut(key("KeyS"))).toBe("settings");
  });

  it("다른 키는 단축키가 아니다", () => {
    expect(matchShortcut(key("KeyA"))).toBeNull();
    expect(matchShortcut(key("Enter"))).toBeNull();
  });

  it("입력칸에 쓰는 중이거나 한글 조합 중이면 무시", () => {
    expect(matchShortcut(key("KeyS", { inEditable: true }))).toBeNull();
    expect(matchShortcut(key("KeyR", { isComposing: true }))).toBeNull();
  });

  it("Ctrl, ⌘, Alt, Shift와 함께 누르면 무시 (⌘+R 새로고침 등)", () => {
    expect(matchShortcut(key("KeyR", { metaKey: true }))).toBeNull();
    expect(matchShortcut(key("KeyS", { ctrlKey: true }))).toBeNull();
    expect(matchShortcut(key("KeyN", { altKey: true }))).toBeNull();
    expect(matchShortcut(key("KeyR", { shiftKey: true }))).toBeNull();
  });

  it("꾹 누르고 있어서 반복되는 입력은 무시", () => {
    expect(matchShortcut(key("Space", { repeat: true }))).toBeNull();
  });

  it("팝업이 열려 있으면 무시", () => {
    expect(matchShortcut(key("Space", { dialogOpen: true }))).toBeNull();
    expect(matchShortcut(key("KeyS", { dialogOpen: true }))).toBeNull();
  });

  it("Tab으로 버튼에 옮겨 갔으면 Space는 그 버튼에 맡기고, 글자 단축키는 동작", () => {
    expect(
      matchShortcut(key("Space", { onKeyboardFocusedControl: true })),
    ).toBeNull();
    expect(matchShortcut(key("KeyR", { onKeyboardFocusedControl: true }))).toBe(
      "reset",
    );
  });
});
