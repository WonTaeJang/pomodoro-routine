"use client";

import { useState } from "react";
import { Button, ConfirmDialog, FieldRow } from "@/components/ui";
import { resetAllData, resetSettings } from "../resetData";
import { SettingsSection } from "./SettingsSection";

type Pending = "settings" | "all" | null;

/** 설정 되돌리기, 모든 데이터 지우기 */
export function DataSection() {
  const [pending, setPending] = useState<Pending>(null);
  const close = () => setPending(null);

  return (
    <SettingsSection title="데이터">
      <FieldRow
        label="설정 되돌리기"
        description="시간, 알림, 화면 설정을 처음 값으로"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPending("settings")}
        >
          되돌리기
        </Button>
      </FieldRow>
      <FieldRow
        label="모든 데이터 지우기"
        description="할 일, 기록, 설정을 모두 지워요"
      >
        <Button variant="danger" size="sm" onClick={() => setPending("all")}>
          지우기
        </Button>
      </FieldRow>

      <ConfirmDialog
        open={pending === "settings"}
        title="설정을 되돌릴까요?"
        confirmLabel="되돌리기"
        onConfirm={resetSettings}
        onClose={close}
      >
        시간, 알림, 화면(테마 포함) 설정이 처음 값으로 돌아가요. 할 일과 기록은
        그대로예요.
      </ConfirmDialog>
      <ConfirmDialog
        open={pending === "all"}
        title="모든 데이터를 지울까요?"
        confirmLabel="모두 지우기"
        tone="danger"
        onConfirm={resetAllData}
        onClose={close}
      >
        이 브라우저에 저장된 할 일, 집중 기록, 설정이 모두 지워져요. 지운 뒤에는
        되돌릴 수 없어요.
      </ConfirmDialog>
    </SettingsSection>
  );
}
