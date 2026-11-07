import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { ButtonVariant } from "../Button/Button";
import styles from "./IconButton.module.scss";

export type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** 버튼 이름. 화면 낭독기와 마우스를 올렸을 때 보이는 설명으로 쓰임 (필수) */
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "xl";
};

/** 아이콘만 있는 동그란 버튼 */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        styles.iconButton,
        styles[variant],
        styles[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
