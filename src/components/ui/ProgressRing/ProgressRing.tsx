import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./ProgressRing.module.scss";

export type ProgressRingMarker = {
  /** 띠 위의 위치. 0 = 12시, 0.25 = 3시, 0.5 = 6시 */
  at: number;
  content: ReactNode;
};

export type ProgressRingProps = {
  /** 남은 비율 0~1. 1이면 띠가 가득 차 있고, 0이면 모두 지나감 */
  value: number;
  /**
   * 기준 지름(px). 화면에 그리는 크기는 CSS 변수 --ring-display-size로 줄이거나 늘릴 수 있음
   * (띠 두께, 도장 위치도 같은 비율로 따라감)
   */
  size?: number;
  /** 띠 두께(px) */
  thickness?: number;
  /** 띠 위에 올릴 표시 (예: 발자국 도장) */
  markers?: ProgressRingMarker[];
  /** 띠를 은은하게 빛나게 하고, 남은 띠의 끝에 빛나는 점을 표시 */
  glow?: boolean;
  /** 값이 바뀔 때마다 띠가 한 번 반짝 퍼져 나감 (예: 완료 시각) */
  flashKey?: string | number | null;
  /** 가운데에 들어갈 내용 (예: 까미 사진) */
  children?: ReactNode;
  /** 가운데 내용 위에 겹쳐 그릴 내용 (예: 축하 효과) */
  overlay?: ReactNode;
  /** 띠와 가운데 내용 뒤에 깔 내용 (예: 집중 소리 분위기). 맨 뒤(z-index -1)에 놓으면 됨 */
  underlay?: ReactNode;
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
  markers = [],
  glow = false,
  flashKey = null,
  children,
  overlay,
  underlay,
  className,
}: ProgressRingProps) {
  const remaining = Math.min(1, Math.max(0, value));
  const elapsed = 1 - remaining;
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // 지나간 만큼 시작점을 밀어서, 남은 띠가 "지금 위치 → 12시"까지 남도록 함
  const offset = -elapsed * circumference;
  // 남은 띠의 시작점(= 지금 위치). SVG를 -90도 돌려 두었으므로 0도가 12시
  const tipAngle = elapsed * 2 * Math.PI;
  // 기준 크기 대비 % (화면 크기가 바뀌어도 같은 위치)
  const percent = (value: number) => `${(value / size) * 100}%`;

  return (
    <div
      className={cx(styles.ring, glow && styles.glow, className)}
      style={
        {
          "--ring-size": `${size}px`,
          "--ring-thickness": `${thickness}px`,
          // 띠 안쪽 가운데 내용의 크기 비율 (띠 두께와 간격 12px을 뺌)
          "--ring-content": percent(size - thickness * 2 - 12),
        } as CSSProperties
      }
    >
      {underlay}
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
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
        />
        {remaining > 0 ? (
          <circle
            className={styles.indicator}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={thickness}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
          />
        ) : null}
        {glow && remaining > 0 ? (
          <circle
            className={styles.tip}
            cx={center + radius * Math.cos(tipAngle)}
            cy={center + radius * Math.sin(tipAngle)}
            r={thickness * 0.85}
          />
        ) : null}
      </svg>

      {children ? <div className={styles.content}>{children}</div> : null}

      {markers.map((marker) => {
        const angle = marker.at * 2 * Math.PI;
        return (
          <span
            key={marker.at}
            className={styles.marker}
            aria-hidden="true"
            style={{
              left: percent(center + radius * Math.sin(angle)),
              top: percent(center - radius * Math.cos(angle)),
            }}
          >
            {marker.content}
          </span>
        );
      })}

      {flashKey !== null ? (
        <span
          key={`flash-${flashKey}`}
          className={styles.flash}
          aria-hidden="true"
        />
      ) : null}

      {overlay}
    </div>
  );
}
