"use client";

import { useState } from "react";
import { SettingsIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { SHORTCUTS, useShortcuts } from "@/features/shortcuts";
import { SettingsDialog } from "./SettingsDialog";

type SettingsButtonProps = {
  /** 저장된 값을 불러오기 전이면 false (설정 창을 열지 않음) */
  ready: boolean;
};

/** 헤더의 설정 버튼. 누르거나 S 키로 설정 창을 엽니다. */
export function SettingsButton({ ready }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);
  useShortcuts({ settings: () => setOpen(true) }, ready);

  return (
    <>
      <IconButton
        label="설정"
        shortcut={SHORTCUTS.settings.key}
        icon={<SettingsIcon />}
        disabled={!ready}
        onClick={() => setOpen(true)}
      />
      {/* 열 때만 그려서, 열 때마다 알림 권한 같은 현재 상태를 새로 읽음 */}
      {open ? <SettingsDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
