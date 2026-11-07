import type { ReactNode } from "react";
import { PawIcon } from "@/components/icons";
import { APP_NAME } from "@/lib/brand";
import styles from "./AppHeader.module.scss";

type AppHeaderProps = {
  /** 오른쪽 영역 (오늘 기록, 버튼 등) */
  children?: ReactNode;
};

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>
        <PawIcon size={22} />
        {APP_NAME}
      </span>
      <div className={styles.right}>{children}</div>
    </header>
  );
}
