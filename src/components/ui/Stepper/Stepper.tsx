"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { IconButton } from "../IconButton/IconButton";
import styles from "./Stepper.module.scss";

export type StepperProps = {
  /** 무엇을 조절하는지. 화면 낭독기와 버튼 설명에 쓰임 (예: "집중 시간") */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 값 표시 형식 (예: v => `${v}분`) */
  format?: (value: number) => string;
  /** 값 앞에 붙는 아이콘 등 */
  prefix?: ReactNode;
  className?: string;
};

/** − 값 + 형태로 숫자를 조절합니다. 설정 화면의 시간, 할 일의 예상 개수 등에 사용 */
export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  format = String,
  prefix,
  className,
}: StepperProps) {
  const t = useTranslations("common");
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.stepper, className)}
    >
      <IconButton
        label={t("decrease", { label })}
        icon={<MinusIcon size={16} />}
        size="sm"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      />
      <output className={styles.value} aria-live="polite">
        {prefix}
        {format(value)}
      </output>
      <IconButton
        label={t("increase", { label })}
        icon={<PlusIcon size={16} />}
        size="sm"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      />
    </div>
  );
}
