"use client";

import { useTranslations } from "use-intl";
import { Dialog } from "@/components/ui";
import { useHoldAutoPopups } from "@/lib/popupHold";
import { AlertSection } from "./AlertSection";
import { DataSection } from "./DataSection";
import { DisplaySection } from "./DisplaySection";
import styles from "./Settings.module.scss";
import { ShortcutSection } from "./ShortcutSection";
import { TimerSection } from "./TimerSection";

type SettingsDialogProps = {
  onClose: () => void;
  /** 등장 효과 없이 바로 보이기 (메뉴에서 열 때: 메뉴가 닫히며 뒤 화면이 비쳐 보이지 않게) */
  instant?: boolean;
};

/**
 * 설정 창. 바꾸는 즉시 저장되고 적용됩니다.
 * 그래서 "완료"·"저장" 버튼을 두지 않고, X·Esc·바깥 클릭으로 닫습니다.
 */
export function SettingsDialog({ onClose, instant }: SettingsDialogProps) {
  // 설정을 보는 중에 세션이 끝나도 완료 팝업이 덮지 않게, 닫을 때까지 기다리게 함
  useHoldAutoPopups();
  const t = useTranslations("settings");
  return (
    <Dialog
      open
      onClose={onClose}
      title={t("title")}
      className={styles.dialog}
      instant={instant}
    >
      <div className={styles.sections}>
        <TimerSection />
        <AlertSection />
        <DisplaySection />
        <ShortcutSection />
        <DataSection />
      </div>
    </Dialog>
  );
}
