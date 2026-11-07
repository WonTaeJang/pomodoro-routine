"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { IconButton } from "../IconButton/IconButton";
import styles from "./Dialog.module.scss";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 아래쪽 버튼 영역 */
  footer?: ReactNode;
  className?: string;
};

/**
 * 팝업 창. 브라우저 기본 <dialog>를 사용해서
 * ESC로 닫기, 포커스 가두기, 뒤 화면 클릭 막기를 브라우저가 처리합니다.
 * 바깥(어두운 영역)을 클릭해도 닫힙니다.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, className)}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // ESC: 브라우저가 직접 닫지 않게 하고 open 상태로 제어
        event.preventDefault();
        // 이 팝업 위에 겹쳐 연 팝업의 ESC가 React 트리를 타고 올라온 경우는 무시
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
      onClick={(event) => {
        // 패널 바깥(backdrop)을 클릭했을 때만 닫기
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton
            label="닫기"
            icon={<CloseIcon />}
            size="sm"
            onClick={onClose}
          />
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
