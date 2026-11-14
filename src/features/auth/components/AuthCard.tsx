import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import { cx } from "@/lib/cx";
import styles from "./AuthPage.module.scss";

type AuthCardProps = {
  /** 맨 위 제목 */
  title?: string;
  /** 제목을 화면에서 숨기고 화면 낭독기에만 읽힘 (페이지 제목 h1은 남김) */
  hideTitle?: boolean;
  /** 있으면 카드 맨 위 가운데에 둥근 까미 사진 (꾸밈용) */
  photo?: StaticImageData;
  children: ReactNode;
};

/** 로그인·프로필·돌아오는 화면이 같이 쓰는 틀: 가운데 카드 하나 (사진·제목이 있으면 맨 위에) */
export function AuthCard({
  title,
  hideTitle = false,
  photo,
  children,
}: AuthCardProps) {
  return (
    <PageMain>
      <div className={styles.page}>
        <Card className={styles.card}>
          {photo ? (
            <Image
              src={photo}
              alt=""
              width={120}
              height={120}
              sizes="(min-width: 768px) 120px, 104px"
              className={styles.photo}
            />
          ) : null}
          {title ? (
            <h1 className={cx(styles.title, hideTitle && styles.hiddenTitle)}>
              {title}
            </h1>
          ) : null}
          {children}
        </Card>
      </div>
    </PageMain>
  );
}
