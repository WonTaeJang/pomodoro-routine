"use client";

import { useTranslations } from "use-intl";
import { VisuallyHidden } from "@/components/ui";

/** 새 탭으로 여는 링크 뒤에 붙이는 화면 낭독기용 "(새 탭에서 열림)". 서버 컴포넌트 안에서 번역하려고 따로 둠 */
export function NewTabNote() {
  const t = useTranslations("common");
  return <VisuallyHidden>{t("opensInNewTab")}</VisuallyHidden>;
}
