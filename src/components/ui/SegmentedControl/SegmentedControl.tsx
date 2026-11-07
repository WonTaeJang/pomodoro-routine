import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SegmentedControl.module.scss";

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  /** 그룹 이름. 화면 낭독기가 읽음 (예: "타이머 모드") */
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * 여러 개 중 하나를 고르는 버튼 묶음 (예: 집중 / 짧은 휴식 / 긴 휴식).
 * 내부적으로 라디오 버튼이라 방향키로 이동할 수 있습니다.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(styles.group, className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cx(styles.option, selected && styles.selected)}
          >
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
