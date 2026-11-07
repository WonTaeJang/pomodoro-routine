import { PawIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import styles from "./PawCount.module.scss";

type PawCountProps = {
  /** 완료한 뽀모도로 수 */
  done: number;
  /** 예상 뽀모도로 수 */
  estimate: number;
  size?: "sm" | "md";
  className?: string;
};

/** 할 일의 뽀모도로 진행 (🐾 완료/예상) */
export function PawCount({
  done,
  estimate,
  size = "sm",
  className,
}: PawCountProps) {
  return (
    <span
      className={cx(styles.count, styles[size], className)}
      aria-label={`뽀모도로 ${done}개 완료, 예상 ${estimate}개`}
      title={`완료 ${done}번 · 예상 ${estimate}번`}
    >
      <PawIcon size={size === "sm" ? 14 : 16} />
      {done}/{estimate}
    </span>
  );
}
