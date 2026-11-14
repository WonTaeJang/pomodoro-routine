import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.scss";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "danger" | "overlay";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentProps<"button"> & {
  /** primary: 강조색 / secondary: 테두리 / ghost: 배경 없음 / danger: 삭제 등 / overlay: 사진 위 (반투명 검은 바탕·흰 글자) */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 글자 앞에 붙는 아이콘 */
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      {...rest}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </button>
  );
}
