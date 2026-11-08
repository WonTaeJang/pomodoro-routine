"use client";

import { Dialog } from "@/components/ui";
import { AlertSection } from "./AlertSection";
import { DataSection } from "./DataSection";
import { DisplaySection } from "./DisplaySection";
import styles from "./Settings.module.scss";
import { ShortcutSection } from "./ShortcutSection";
import { TimerSection } from "./TimerSection";

type SettingsDialogProps = {
  onClose: () => void;
};

/**
 * 설정 창. 바꾸는 즉시 저장되고 적용됩니다.
 * 그래서 "완료"·"저장" 버튼을 두지 않고, X·Esc·바깥 클릭으로 닫습니다.
 */
export function SettingsDialog({ onClose }: SettingsDialogProps) {
  return (
    <Dialog open onClose={onClose} title="설정" className={styles.dialog}>
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
