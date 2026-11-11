"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, ConfirmDialog, FieldRow, Section } from "@/components/ui";
import { resetSettings } from "../resetData";

/** 설정 되돌리기 */
export function DataSection() {
  const [confirming, setConfirming] = useState(false);
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
          onClick={() => setConfirming(true)}
        >
          {t("resetSettings.button")}
        </Button>
      </FieldRow>

      <ConfirmDialog
        open={confirming}
        title={t("resetSettings.confirm.title")}
        confirmLabel={t("resetSettings.confirm.action")}
        onConfirm={resetSettings}
        onClose={() => setConfirming(false)}
      >
        {t("resetSettings.confirm.message")}
      </ConfirmDialog>
    </Section>
  );
}
