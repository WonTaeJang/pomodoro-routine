"use client";

import { useEffect, type ReactNode } from "react";
import { IntlProvider } from "use-intl";
import { getLocale, useLocaleState } from "./locale";
import { MESSAGES } from "./messages";

/**
 * use-intl의 날짜 형식은 쓰지 않지만(날짜는 lib/date.ts가 브라우저에서 만듦),
 * 시간대 설정이 없으면 경고를 내므로 이 기기의 시간대를 넘김
 */
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * 화면 문구 사전을 아래 화면에 내려줍니다. 화면에서는 use-intl의 useTranslations로 읽습니다.
 * 서버는 기본 언어(한국어)로 그리고, 브라우저에서 고른 언어가 다르면 바로 다시 그립니다.
 * 그동안 화면은 숨겨 둡니다 (globals.scss). 언어를 바꾸면 주소는 그대로 두고 문구만 바뀝니다.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleState();

  useEffect(() => {
    // 고른 언어로 그린 뒤에 화면을 보여줌
    if (locale === getLocale()) {
      document.documentElement.dataset.i18nReady = "";
    }
  }, [locale]);

  return (
    <IntlProvider
      locale={locale}
      messages={MESSAGES[locale]}
      timeZone={TIME_ZONE}
    >
      {children}
    </IntlProvider>
  );
}
