import type { ReactNode } from "react";
import styles from "./Settings.module.scss";

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

/** 설정 창 안의 묶음 (타이머, 알림, 화면, 데이터) */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

/** 설정 아래 덧붙이는 안내 문구 */
export function SettingsNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
