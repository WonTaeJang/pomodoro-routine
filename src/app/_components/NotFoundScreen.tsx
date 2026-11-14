"use client";

import Image from "next/image";
import { useTranslations } from "use-intl";
import kkami from "@/assets/kkami/kkami-not-found-002.webp";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { ButtonLink } from "@/components/ui";
import styles from "./NotFoundScreen.module.scss";

/** 404 화면: 넥카라를 하고 어리둥절한 까미 사진, 안내 문구, 타이머로 돌아가는 버튼 */
export function NotFoundScreen() {
  const t = useTranslations("notFound");
  return (
    <CenteredCard className={styles.card}>
      <Image
        src={kkami}
        alt=""
        width={136}
        height={136}
        sizes="(min-width: 768px) 136px, 112px"
        className={styles.photo}
      />
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.message}>{t("message")}</p>
      <ButtonLink href="/" className={styles.home}>
        {t("home")}
      </ButtonLink>
    </CenteredCard>
  );
}
