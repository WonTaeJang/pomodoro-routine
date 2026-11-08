import type { ReactNode } from "react";
import styles from "./PageMain.module.scss";

/**
 * 페이지 본문. 휴대폰은 위아래로 쌓고, 넓은 화면은 왼쪽(넓게) · 오른쪽 두 칸.
 * 예: 타이머 | 할 일, 달력 | 날짜 상세
 */
export function PageMain({ children }: { children: ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}
