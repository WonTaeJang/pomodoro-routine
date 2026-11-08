import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Section.module.scss";

export type SectionProps = {
  title: string;
  /** 제목 단계. 팝업 안처럼 이미 h2가 있는 곳에서는 3 */
  headingLevel?: 2 | 3;
  children: ReactNode;
  className?: string;
};

/** 밑줄 있는 작은 제목 + 내용을 세로로 쌓은 묶음 (예: 설정 창의 타이머·알림·화면) */
export function Section({
  title,
  headingLevel = 2,
  children,
  className,
}: SectionProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <section className={cx(styles.section, className)}>
      <Heading className={styles.title}>{title}</Heading>
      {children}
    </section>
  );
}
