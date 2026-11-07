import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.scss";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /**
   * solid: 강조색 바탕 (예: "집중 중")
   * soft: 카드 바탕에 흐린 글자 (예: 오늘 기록)
   * medal: 금색 바탕 (예: 사이클 완료)
   * outline: 점선 테두리 (예: 테스트 모드)
   */
  variant?: "solid" | "soft" | "medal" | "outline";
  size?: "sm" | "md" | "lg";
  /** 글자 앞 아이콘. variant에 맞는 색이 칠해짐 */
  icon?: ReactNode;
};

/** 짧은 정보를 담는 둥근 배지 */
export function Badge({
  variant = "soft",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(styles.badge, styles[variant], styles[size], className)}
      {...rest}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </span>
  );
}
