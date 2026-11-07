/**
 * 지금 포커스가 키보드(Tab, 방향키)로 옮겨 온 것인지 기억합니다.
 *
 * 마우스로 ⏭를 누르면 포커스가 ⏭에 남는데, 이때 Space를 브라우저에 맡기면 ⏭가 한 번 더 눌립니다.
 * 그래서 마우스로 생긴 포커스에서는 Space를 시작/일시정지로 쓰고,
 * Tab으로 버튼을 골라 온 경우에만 그 버튼을 누르도록 브라우저에 맡깁니다.
 * (CSS :focus-visible은 키를 누르는 순간 키보드 쪽으로 바뀌어서 이 구분에 쓸 수 없음)
 */

let movedByKeyboard = false;
let focusedByKeyboard = false;
let installed = false;

/** 포커스를 옮기는 키 */
function isNavigationKey(key: string): boolean {
  return key === "Tab" || key.startsWith("Arrow");
}

/** 기록을 시작합니다. 여러 번 불러도 한 번만 설치되고, 앱이 떠 있는 동안 유지됩니다. */
export function trackFocusSource() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const options = { capture: true, passive: true };
  window.addEventListener(
    "keydown",
    (event) => {
      if (isNavigationKey(event.key)) movedByKeyboard = true;
    },
    options,
  );
  window.addEventListener(
    "pointerdown",
    () => (movedByKeyboard = false),
    options,
  );
  window.addEventListener(
    "focusin",
    () => (focusedByKeyboard = movedByKeyboard),
    options,
  );
}

/** 지금 포커스가 키보드로 옮겨 온 것인지 */
export function isFocusedByKeyboard(): boolean {
  return focusedByKeyboard;
}
