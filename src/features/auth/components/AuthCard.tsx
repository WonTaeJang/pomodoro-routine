import type { ReactNode } from "react";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import styles from "./AuthPage.module.scss";

/** 로그인·프로필·돌아오는 화면이 같이 쓰는 틀: 가운데 카드 하나 (제목이 있으면 맨 위에) */
export function AuthCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <PageMain>
      <div className={styles.page}>
        <Card className={styles.card}>
          {title ? <h1 className={styles.title}>{title}</h1> : null}
          {children}
        </Card>
      </div>
    </PageMain>
  );
}
