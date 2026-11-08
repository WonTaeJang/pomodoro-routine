import type { ReactNode } from "react";
import { PawIcon } from "@/components/icons";
import { APP_NAME } from "@/lib/brand";
import styles from "./AppHeader.module.scss";

type AppHeaderProps = {
  /** 이름 옆 페이지 이동 메뉴 */
  nav?: ReactNode;
  /** 오른쪽 영역 (오늘 기록, 버튼 등) */
  children?: ReactNode;
};

export function AppHeader({ nav, children }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.brand}>
          <PawIcon size={22} />
          <span className={styles.brandName}>{APP_NAME}</span>
        </span>
        {nav}
      </div>
      <div className={styles.right}>{children}</div>
    </header>
  );
}
