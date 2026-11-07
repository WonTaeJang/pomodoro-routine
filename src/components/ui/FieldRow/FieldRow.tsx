import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./FieldRow.module.scss";

export type FieldRowProps = {
  label: string;
  /** 라벨 아래 작은 설명 */
  description?: string;
  /** 라벨을 눌렀을 때 조작할 요소의 id. 없으면 라벨은 글자로만 표시 */
  htmlFor?: string;
  /** 설명에 붙일 id (조작 요소의 aria-describedby와 연결) */
  descriptionId?: string;
  /** 오른쪽 조작 요소 (Switch 버튼, Stepper, SegmentedControl 등) */
  children: ReactNode;
  className?: string;
};

/**
 * 왼쪽에 이름과 설명, 오른쪽에 조작 요소가 있는 한 줄 (설정 화면 등).
 * 자리가 좁으면 조작 요소가 다음 줄로 내려갑니다.
 */
export function FieldRow({
  label,
  description,
  htmlFor,
  descriptionId,
  children,
  className,
}: FieldRowProps) {
  return (
    <div className={cx(styles.row, className)}>
      <span className={styles.text}>
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className={cx(styles.label, styles.clickable)}
          >
            {label}
          </label>
        ) : (
          <span className={styles.label}>{label}</span>
        )}
        {description ? (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}
