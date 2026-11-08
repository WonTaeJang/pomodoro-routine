import { useTranslations } from "use-intl";
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
  const t = useTranslations("tasks.pawCount");
  return (
    <span
      className={cx(styles.count, styles[size], className)}
      aria-label={t("label", { done, estimate })}
      title={t("title", { done, estimate })}
    >
      <PawIcon size={size === "sm" ? 14 : 16} />
      {done}/{estimate}
    </span>
  );
}
