import Image from "next/image";
import Link from "next/link";
import kkami from "@/assets/mascot/kkami-basic.svg";
import { PageMain } from "@/components/layout/PageMain";
import { Card } from "@/components/ui";
import styles from "./GuideScreen.module.scss";

/** 사용법 페이지. 내용은 백로그 I-010에서 채웁니다. 지금은 준비 중 안내만 */
export function GuideScreen() {
  return (
    <PageMain>
      <Card as="section" className={styles.card} aria-labelledby="guide-title">
        <Image src={kkami} alt="" width={72} height={72} />
        <h1 id="guide-title" className={styles.title}>
          사용법
        </h1>
        <p className={styles.text}>사용법을 준비하고 있어요.</p>
        <Link href="/" className={styles.link}>
          타이머로 돌아가기
        </Link>
      </Card>
    </PageMain>
  );
}
