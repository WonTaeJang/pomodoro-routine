import { cx } from "@/lib/cx";
import styles from "./PlayingBars.module.scss";

type PlayingBarsProps = {
  /** 놓을 자리 (크기와 모양은 여기서 정함) */
  className?: string;
};

/**
 * "소리가 나오는 중" 표시: 작은 막대 3개가 오르내립니다. (헤더 버튼, 소리 고르기 칸)
 * 움직임 줄이기를 켜면 멈춘 모양으로 보입니다. 꾸밈이라 화면 낭독기용 글은 쓰는 쪽에서 따로 넣습니다.
 */
export function PlayingBars({ className }: PlayingBarsProps) {
  return (
    <span className={cx(styles.bars, className)} aria-hidden="true">
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </span>
  );
}
