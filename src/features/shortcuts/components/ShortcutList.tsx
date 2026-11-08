"use client";

import { useTranslations } from "use-intl";
import { Kbd } from "@/components/ui";
import { cx } from "@/lib/cx";
import { SHORTCUT_ORDER, SHORTCUTS } from "../shortcuts";
import styles from "./ShortcutList.module.scss";

/** 단축키 목록 (하는 일 | 키). 설정 창과 사용법 페이지가 함께 씀 */
export function ShortcutList({ className }: { className?: string }) {
  const t = useTranslations("shortcuts");
  return (
    <dl className={cx(styles.list, className)}>
      {SHORTCUT_ORDER.map((id) => (
        <div key={id} className={styles.item}>
          <dt>{t(id)}</dt>
          <dd>
            <Kbd>{SHORTCUTS[id].key}</Kbd>
          </dd>
        </div>
      ))}
    </dl>
  );
}
