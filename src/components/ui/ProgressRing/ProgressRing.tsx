import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./ProgressRing.module.scss";

export type ProgressRingProps = {
  /** 남은 비율 0~1. 1이면 띠가 가득 차 있고, 0이면 모두 지나감 */
  value: number;
  /** 전체 지름(px) */
  size?: number;
  /** 띠 두께(px) */
  thickness?: number;
  /** 가운데에 들어갈 내용 (예: 까미 사진) */
  children?: ReactNode;
  className?: string;
};

/**
 * 원형 진행 띠.
 * 12시 방향에서 시작해 시계 방향으로 지나간 부분이 흐려지고, 남은 부분은 강조색으로 보입니다.
 * 장식용이라 화면 낭독기에는 숨깁니다. (남은 시간은 숫자로 따로 전달)
 */
export function ProgressRing({
  value,
  size = 192,
  thickness = 8,
  children,
  className,
}: ProgressRingProps) {
  const remaining = Math.min(1, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // 지나간 만큼 시작점을 밀어서, 남은 띠가 "지금 위치 → 12시"까지 남도록 함
  const offset = -(1 - remaining) * circumference;

  return (
    <div
      className={cx(styles.ring, className)}
      style={
        {
          "--ring-size": `${size}px`,
          "--ring-thickness": `${thickness}px`,
        } as CSSProperties
      }
    >
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
        />
        {remaining > 0 ? (
          <circle
            className={styles.indicator}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
          />
        ) : null}
      </svg>
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
