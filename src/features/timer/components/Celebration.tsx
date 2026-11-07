import type { CSSProperties } from "react";
import { PawIcon } from "@/components/icons";
import styles from "./Celebration.module.scss";

const COLORS = [
  "var(--color-accent)",
  "#f5c542",
  "#ff8fab",
  "#6ea8fe",
  "#63c78b",
];

type CelebrationProps = {
  /** 한 사이클 완료면 더 크고 화려하게 */
  big?: boolean;
};

/**
 * 원 둘레에서 발자국과 색종이가 바깥으로 팡 터지는 효과.
 * 같은 결과가 나오도록 무작위 대신 순번으로 위치와 색을 정합니다.
 */
export function Celebration({ big = false }: CelebrationProps) {
  const count = big ? 28 : 18;

  return (
    <div className={styles.celebration} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 2 * Math.PI + (i % 2 ? 0.12 : -0.12);
        const distance = (big ? 130 : 112) + (i % 3) * 26;
        const style = {
          "--x": `${Math.cos(angle) * distance}px`,
          "--y": `${Math.sin(angle) * distance}px`,
          "--r": `${(i * 47) % 360}deg`,
          "--delay": `${(i % 4) * 40}ms`,
          color: COLORS[i % COLORS.length],
        } as CSSProperties;

        return i % 3 === 0 ? (
          <span key={i} className={styles.particle} style={style}>
            <PawIcon size={big ? 22 : 18} />
          </span>
        ) : (
          <span
            key={i}
            className={`${styles.particle} ${styles.confetti}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
