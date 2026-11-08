import { useTranslations } from "use-intl";
import { Section } from "@/components/ui";
import { ShortcutList } from "@/features/shortcuts";
import styles from "./Settings.module.scss";

/** 단축키 목록. 키보드가 없는 기기(휴대폰)에서는 숨김 */
export function ShortcutSection() {
  const t = useTranslations("settings");
  return (
    <div className={styles.keyboardOnly}>
      <Section title={t("shortcuts")} headingLevel={3}>
        <ShortcutList />
      </Section>
    </div>
  );
}
