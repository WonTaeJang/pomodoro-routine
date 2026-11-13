"use client";

import Link from "next/link";
import { useTranslations } from "use-intl";

/** 푸터의 개인정보처리방침·이용약관 링크. 서버 컴포넌트(AppFooter) 안에서 번역하려고 따로 둠 */
export function FooterLegalLinks({ className }: { className: string }) {
  const t = useTranslations("app.legal");
  return (
    <>
      <Link className={className} href="/privacy">
        {t("privacy")}
      </Link>
      <span aria-hidden="true">·</span>
      <Link className={className} href="/terms">
        {t("terms")}
      </Link>
    </>
  );
}
