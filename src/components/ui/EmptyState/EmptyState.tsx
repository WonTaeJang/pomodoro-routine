import Image from "next/image";
import type { ReactNode } from "react";
import kkami from "@/assets/kkami/kkami-empty-019.webp";
import styles from "./EmptyState.module.scss";

export type EmptyStateProps = {
  /** 안내 문구 */
  children: ReactNode;
  /** 까미 사진 크기(px) */
  imageSize?: number;
};

/** 보여줄 기록이 없을 때: 가운데 길게 뻗고 쉬는 까미 사진과 흐린 안내 문구 */
export function EmptyState({ children, imageSize = 64 }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <Image
        src={kkami}
        alt=""
        width={imageSize}
        height={imageSize}
        className={styles.photo}
      />
      <p>{children}</p>
    </div>
  );
}
