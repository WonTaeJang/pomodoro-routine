import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import styles from "./AuthPage.module.scss";

type AuthCardProps = {
  /** 맨 위 제목 */
  title?: string;
  /** 제목 아래 짧은 소개 */
  intro?: ReactNode;
  /** 있으면 제목·소개 왼쪽에 둥근 까미 사진 (꾸밈용) */
  photo?: StaticImageData;
  children: ReactNode;
};

/** 로그인·프로필·돌아오는 화면이 같이 쓰는 틀: 가운데 카드 하나 (제목이 있으면 맨 위에) */
export function AuthCard({ title, intro, photo, children }: AuthCardProps) {
  const heading =
    title || intro ? (
      <div className={styles.headText}>
        {title ? <h1 className={styles.title}>{title}</h1> : null}
        {intro ? <p>{intro}</p> : null}
      </div>
    ) : null;

  return (
    <PageMain>
      <div className={styles.page}>
        <Card className={styles.card}>
          {photo ? (
            <div className={styles.head}>
              <Image
                src={photo}
                alt=""
                width={96}
                height={96}
                sizes="(min-width: 768px) 96px, 80px"
                className={styles.photo}
              />
              {heading}
            </div>
          ) : (
            heading
          )}
          {children}
        </Card>
      </div>
    </PageMain>
  );
}
