import { useId, type ComponentProps } from "react";
import { FieldRow } from "../FieldRow/FieldRow";
import styles from "./Switch.module.scss";

export type SwitchProps = Omit<
  ComponentProps<"button">,
  "onChange" | "children"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  /** 라벨 아래 작은 설명 */
  description?: string;
};

/** 켜기/끄기 토글. 라벨을 눌러도 바뀝니다. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  id,
  className,
  ...rest
}: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const descriptionId = `${switchId}-description`;

  return (
    <FieldRow
      label={label}
      description={description}
      htmlFor={switchId}
      descriptionId={descriptionId}
      className={className}
    >
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        className={styles.switch}
        onClick={() => onCheckedChange(!checked)}
        {...rest}
      >
        <span className={styles.thumb} />
      </button>
    </FieldRow>
  );
}
