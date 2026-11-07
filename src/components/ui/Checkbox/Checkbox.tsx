import type { ComponentProps, ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import styles from "./Checkbox.module.scss";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
};

/** 체크박스. 실제 <input type="checkbox">를 숨기고 모양만 새로 그립니다. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx(styles.checkbox, className)}>
      <input type="checkbox" className={styles.input} {...rest} />
      <span className={styles.box} aria-hidden="true">
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      <span>{label}</span>
    </label>
  );
}
