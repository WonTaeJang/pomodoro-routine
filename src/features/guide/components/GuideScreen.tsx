import Image from "next/image";
import kkami from "@/assets/mascot/kkami-basic.svg";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import { GUIDE, GUIDE_SECTIONS } from "../content.ko";
import { SectionBody, SectionIcon } from "./GuideParts";
import styles from "./GuideScreen.module.scss";

/**
 * 사용법 페이지. 넓은 화면은 왼쪽에 고정 목차, 휴대폰은 제목 아래 가로로 넘기는 목차.
 * 문구는 content.ko.ts에서 읽습니다.
 */
export function GuideScreen() {
  return (
    <PageMain>
      <div className={styles.layout}>
        <div className={styles.head}>
          <Image src={kkami} alt="" width={64} height={64} />
          <div>
            <h1 className={styles.title}>{GUIDE.title}</h1>
            <p className={styles.intro}>{GUIDE.intro}</p>
          </div>
        </div>
        <nav aria-label={GUIDE.tocLabel} className={styles.toc}>
          <ul>
            {GUIDE_SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <SectionIcon icon={s.icon} size={16} />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sections}>
          {GUIDE_SECTIONS.map((s) => (
            <Card
              as="section"
              key={s.id}
              id={s.id}
              className={styles.section}
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
