import { useId, type ComponentProps } from "react";
import { cx } from "@/lib/cx";
import styles from "./TextField.module.scss";

export type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  /** 입력칸 아래 도움말 */
  hint?: string;
  /** 오류 문구. 있으면 빨간 테두리로 표시 */
  error?: string;
  /** 라벨을 화면에서 숨기고 화면 낭독기에만 제공 */
  hideLabel?: boolean;
};

/** 라벨이 붙은 입력칸. type="number" 등 input 속성을 그대로 쓸 수 있습니다. */
export function TextField({
  label,
  hint,
  error,
  hideLabel = false,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label} hidden={hideLabel}>
        {label}
      </label>
      <input
        id={inputId}
        className={cx(styles.input, error && styles.invalid)}
        aria-label={hideLabel ? label : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...rest}
      />
      {message ? (
        <p id={messageId} className={error ? styles.error : styles.hint}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
