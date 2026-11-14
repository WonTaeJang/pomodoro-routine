import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";
import type { ButtonSize, ButtonVariant } from "./Button";
import styles from "./Button.module.scss";

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** 버튼 모양의 페이지 이동 링크 (예: 404의 "타이머로 돌아가기"). 모양은 Button과 같음 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cx(
        styles.button,
        styles.link,
        styles[variant],
        styles[size],
        className,
      )}
      {...rest}
    />
  );
}
