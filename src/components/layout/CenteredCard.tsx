import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { cx } from "@/lib/cx";
import { PageMain } from "./PageMain";
import styles from "./CenteredCard.module.scss";

/** 페이지 가운데 카드 하나 (로그인·프로필, 404 등). 카드 안 배치는 className으로 */
export function CenteredCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <PageMain>
      <div className={styles.page}>
        <Card className={cx(styles.card, className)}>{children}</Card>
      </div>
    </PageMain>
  );
}
