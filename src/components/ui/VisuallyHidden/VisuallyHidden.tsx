import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import styles from "./VisuallyHidden.module.scss";

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  /** 어떤 태그로 그릴지 (표 전체를 숨기면 table) */
  as?: "span" | "div" | "table";
};

/** 화면에는 보이지 않고 화면 낭독기만 읽는 내용. 예: 아이콘 버튼 옆 "(새 탭에서 열림)" */
export function VisuallyHidden({
  as: Tag = "span",
  className,
  ...rest
}: VisuallyHiddenProps) {
  return <Tag className={cx(styles.hidden, className)} {...rest} />;
}
