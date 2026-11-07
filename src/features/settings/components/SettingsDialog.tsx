"use client";

import { Button, Dialog } from "@/components/ui";
import { AlertSection } from "./AlertSection";
import { DataSection } from "./DataSection";
import { DisplaySection } from "./DisplaySection";
import styles from "./Settings.module.scss";
import { ShortcutSection } from "./ShortcutSection";
import { TimerSection } from "./TimerSection";

type SettingsDialogProps = {
  onClose: () => void;
};

/** 설정 창. 바꾸는 즉시 저장되고 적용됩니다. */
export function SettingsDialog({ onClose }: SettingsDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="설정"
      className={styles.dialog}
      footer={<Button onClick={onClose}>완료</Button>}
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
