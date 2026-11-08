"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** 무엇이 어떻게 되는지 알려주는 문구 */
  children: ReactNode;
  /** 확인 버튼 글자 (예: "바꾸기", "지우기") */
  confirmLabel: string;
  /** danger: 지우기처럼 되돌릴 수 없는 동작 */
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

/** "정말 할까요?"를 한 번 묻는 팝업. 확인을 누르면 onConfirm 뒤에 닫힙니다. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const t = useTranslations("common");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant={tone}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
