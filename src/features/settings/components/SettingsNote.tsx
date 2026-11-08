import type { ReactNode } from "react";
import styles from "./Settings.module.scss";

/** 설정 아래 덧붙이는 안내 문구 */
export function SettingsNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
