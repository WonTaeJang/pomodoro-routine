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
  /** 키보드 단축키 (예: "Space"). 마우스를 올리면 "시작 (Space)"처럼 보임 */
  shortcut?: string;
};

/** 아이콘만 있는 동그란 버튼 */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  shortcut,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={shortcut ? `${label} (${shortcut})` : label}
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
