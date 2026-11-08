"use client";

import { useEffect, useRef } from "react";
import { isFocusedByKeyboard, trackFocusSource } from "./focusSource";
import { matchShortcut, type ShortcutId } from "./shortcuts";

type Handlers = Partial<Record<ShortcutId, () => void>>;

const EDITABLE =
  "input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable]:not([contenteditable=false])";
const CONTROL = "button, a[href], input, summary, [role=button], [role=switch]";

/**
 * 키보드 단축키를 연결합니다. 단축키를 쓰는 컴포넌트마다 자기 동작만 넘깁니다.
 * (예: 타이머 버튼은 toggle·reset·skip, 설정 버튼은 settings)
 */
export function useShortcuts(handlers: Handlers, enabled = true) {
  // 매번 새로 만들어지는 함수여도 리스너를 다시 달지 않도록 최신 값만 보관
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;
    trackFocusSource();

    function onKeyDown(event: KeyboardEvent) {
      // 다른 곳에서 이미 쓴 키는 넘김 (예: 할 일 손잡이에서 Space로 끌기 시작)
      if (event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      const id = matchShortcut({
        code: event.code,
        repeat: event.repeat,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        isComposing: event.isComposing,
        inEditable: target?.closest(EDITABLE) != null,
        onKeyboardFocusedControl:
          target?.closest(CONTROL) != null && isFocusedByKeyboard(),
        dialogOpen: document.querySelector("dialog[open]") !== null,
      });
      const handler = id ? handlersRef.current[id] : undefined;
      if (!handler) return;
      // Space로 페이지가 스크롤되거나, 포커스가 남은 버튼이 한 번 더 눌리지 않게
      event.preventDefault();
      handler();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
