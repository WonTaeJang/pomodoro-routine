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

/**
 * 스위치 모양만 (누를 수 없음). 메뉴 항목처럼 줄 전체가 버튼일 때 상태를 보여줍니다.
 * 상태는 그 줄의 aria-checked로 알리고, 이 모양은 화면 낭독기에서 숨깁니다.
 */
export function SwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className={styles.switch} data-checked={checked} aria-hidden="true">
      <span className={styles.thumb} />
    </span>
  );
}

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
