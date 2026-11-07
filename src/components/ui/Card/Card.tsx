import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import styles from "./Card.module.scss";

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** 어떤 태그로 그릴지 (영역이면 section) */
  as?: "div" | "section" | "article";
  /** default: 기본 안쪽 여백 / none: 여백 없음 (직접 지정할 때) */
  padding?: "default" | "none";
};

/** 흰 바탕의 둥근 카드. 타이머, 할 일 같은 큰 영역을 감쌉니다. */
export function Card({
  as: Tag = "div",
  padding = "default",
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cx(
        styles.card,
        padding === "default" && styles.padded,
        className,
      )}
      {...rest}
    />
  );
}
