"use client";

import { useRef } from "react";
import { useTranslations } from "use-intl";
import { CloseIcon } from "@/components/icons";
import { useModalDialog } from "../Dialog/useModalDialog";
import { IconButton } from "../IconButton/IconButton";
import styles from "./ImageViewer.module.scss";

type ImageViewerProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

/**
 * 이미지를 화면 가득 크게 보기 (검은 바탕, 비율 유지). 아무 곳이나 누르거나 ESC로 닫힘.
 * 다른 팝업(예: 수료증 창) 위에도 겹쳐 열 수 있게 브라우저 기본 <dialog>를 씀
 */
export function ImageViewer({ open, src, alt, onClose }: ImageViewerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useTranslations("common");

  useModalDialog(ref, open);

  return (
    <dialog
      ref={ref}
      className={styles.viewer}
      aria-label={alt}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={onClose}
    >
      {open ? (
        // 만든 이미지를 그대로 보여주므로 next/image를 쓰지 않음
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={styles.image} />
      ) : null}
      <IconButton
        label={t("close")}
        icon={<CloseIcon />}
        variant="overlay"
        className={styles.close}
        onClick={onClose}
      />
    </dialog>
  );
}
