import { useEffect, type RefObject } from "react";

/**
 * open 값에 맞춰 <dialog>를 모달로 열고 닫습니다 (showModal / close).
 * 모달로 열면 브라우저가 ESC 처리, 포커스 가두기, 뒤 화면 막기를 해 줍니다.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [ref, open]);
}
