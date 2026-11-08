"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, ConfirmDialog, FieldRow, Section } from "@/components/ui";
import { resetAllData, resetSettings } from "../resetData";

type Pending = "settings" | "all" | null;

/** 설정 되돌리기, 모든 데이터 지우기 */
export function DataSection() {
  const [pending, setPending] = useState<Pending>(null);
  const close = () => setPending(null);
  const t = useTranslations("settings.data");

  return (
    <Section title={t("title")} headingLevel={3}>
      <FieldRow
        label={t("resetSettings.label")}
        description={t("resetSettings.description")}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPending("settings")}
        >
          {t("resetSettings.button")}
        </Button>
      </FieldRow>
      <FieldRow
        label={t("clearAll.label")}
        description={t("clearAll.description")}
      >
        <Button variant="danger" size="sm" onClick={() => setPending("all")}>
          {t("clearAll.button")}
        </Button>
      </FieldRow>

      <ConfirmDialog
        open={pending === "settings"}
        title={t("resetSettings.confirm.title")}
        confirmLabel={t("resetSettings.confirm.action")}
        onConfirm={resetSettings}
        onClose={close}
      >
        {t("resetSettings.confirm.message")}
      </ConfirmDialog>
      <ConfirmDialog
        open={pending === "all"}
        title={t("clearAll.confirm.title")}
        confirmLabel={t("clearAll.confirm.action")}
        tone="danger"
        onConfirm={resetAllData}
        onClose={close}
      >
        {t("clearAll.confirm.message")}
      </ConfirmDialog>
    </Section>
  );
}
