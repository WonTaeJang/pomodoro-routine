"use client";

import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import { useLegalContent, type LegalBlock, type LegalDocId } from "../content";
import { LEGAL_EFFECTIVE_DATE } from "../operator";
import styles from "./LegalScreen.module.scss";

/**
 * 개인정보처리방침(/privacy)·이용약관(/terms) 페이지. 사용법 페이지와 같은 틀(styles/_doc-page.scss):
 * 넓은 화면은 왼쪽에 고정 목차, 휴대폰은 제목 아래 가로로 넘기는 목차. 글은 content.<언어>.ts.
 */
export function LegalScreen({ doc }: { doc: LegalDocId }) {
  const content = useLegalContent();
  const { title, intro, sections } = content.docs[doc];
  return (
    <PageMain>
      <div className={styles.layout}>
        <div className={styles.head}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.date}>
            {content.effective(LEGAL_EFFECTIVE_DATE)}
          </p>
          <p className={styles.intro}>{intro}</p>
        </div>
        <nav aria-label={content.tocLabel} className={styles.toc}>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <Card className={styles.body}>
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className={styles.section}
              aria-labelledby={`${s.id}-title`}
            >
              <h2 id={`${s.id}-title`} className={styles.sectionTitle}>
                {s.title}
              </h2>
              {s.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </Card>
      </div>
    </PageMain>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{block}</p>;
  return (
    <div>
      <p>{block.text}</p>
      <ul className={styles.items}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
