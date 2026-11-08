import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import styles from "./Kbd.module.scss";

export type KbdProps = HTMLAttributes<HTMLElement>;

/** 키보드 키 모양. 단축키 안내에 씁니다. 예: <Kbd>Space</Kbd> */
export function Kbd({ className, ...rest }: KbdProps) {
  return <kbd className={cx(styles.kbd, className)} {...rest} />;
}
