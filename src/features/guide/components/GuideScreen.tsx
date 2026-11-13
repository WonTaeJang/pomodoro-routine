"use client";

import Image from "next/image";
import kkami from "@/assets/kkami/kkami-guide-016.webp";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useGuideContent } from "../content";
import { SectionBody, SectionIcon } from "./GuideParts";
import { ReplayOnboardingButton } from "./ReplayOnboardingButton";
import styles from "./GuideScreen.module.scss";

/**
 * 사용법 페이지. 넓은 화면은 왼쪽에 고정 목차, 휴대폰은 제목 아래 가로로 넘기는 목차.
 * 글은 content.<언어>.ts에서 읽습니다.
 */
export function GuideScreen() {
  const { page, sections } = useGuideContent();
  return (
    <PageMain>
      <div className={styles.layout}>
        <div className={styles.head}>
          {/* 모자 쓴 까미 */}
          <Image
            src={kkami}
            alt=""
            width={72}
            height={72}
            className={styles.kkami}
          />
          <div className={styles.headText}>
            <h1 className={styles.title}>{page.title}</h1>
            <p className={styles.intro}>{page.intro}</p>
            <ReplayOnboardingButton className={styles.replay} />
          </div>
        </div>
        <nav aria-label={page.tocLabel} className={styles.toc}>
          <ul>
            {sections.map((s) => (
              <li
                key={s.id}
                className={s.keyboardOnly ? styles.keyboardOnly : undefined}
              >
                <a href={`#${s.id}`}>
                  <SectionIcon icon={s.icon} size={16} />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sections}>
          {sections.map((s) => (
            <Card
              as="section"
              key={s.id}
              id={s.id}
              className={cx(
                styles.section,
                s.keyboardOnly && styles.keyboardOnly,
              )}
              aria-labelledby={`${s.id}-title`}
            >
              <h2 id={`${s.id}-title`} className={styles.sectionTitle}>
                <span className={styles.iconBadge}>
                  <SectionIcon icon={s.icon} />
                </span>
                {s.title}
              </h2>
              <SectionBody section={s} />
            </Card>
          ))}
        </div>
      </div>
    </PageMain>
  );
}
