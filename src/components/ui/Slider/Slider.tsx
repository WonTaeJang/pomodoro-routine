import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Slider.module.scss";

export type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 값 표시 형식 (예: v => `${v}%`) */
  format?: (value: number) => string;
  disabled?: boolean;
  /** 막대 왼쪽·오른쪽 끝에 붙는 장식 아이콘 (예: 작은 소리, 큰 소리) */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
};

/** 끌어서 값을 고르는 막대 (예: 소리 크기). 방향키로도 조절됩니다. */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = String,
  disabled = false,
  startIcon,
  endIcon,
  className,
}: SliderProps) {
  const id = useId();
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={cx(styles.field, className)}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value}>
          {format(value)}
        </output>
      </div>
      <div className={styles.row}>
        {startIcon ? <span className={styles.icon}>{startIcon}</span> : null}
        <input
          id={id}
          type="range"
          className={styles.range}
          style={{ "--fill": `${fill}%` } as CSSProperties}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={format(value)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {endIcon ? <span className={styles.icon}>{endIcon}</span> : null}
      </div>
    </div>
  );
}
