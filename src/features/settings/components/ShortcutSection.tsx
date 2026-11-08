import { Section } from "@/components/ui";
import { SHORTCUT_ORDER, SHORTCUTS } from "@/features/shortcuts";
import styles from "./Settings.module.scss";

/** 단축키 목록. 키보드가 없는 기기(휴대폰)에서는 숨김 */
export function ShortcutSection() {
  return (
    <div className={styles.keyboardOnly}>
      <Section title="단축키" headingLevel={3}>
        <dl className={styles.shortcuts}>
          {SHORTCUT_ORDER.map((id) => (
            <div key={id} className={styles.shortcut}>
              <dt>{SHORTCUTS[id].description}</dt>
              <dd>
                <kbd className={styles.kbd}>{SHORTCUTS[id].key}</kbd>
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
