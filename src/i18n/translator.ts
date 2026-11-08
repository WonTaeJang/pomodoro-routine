import { createTranslator } from "use-intl/core";
import { getLocale } from "./locale";
import type { Locale } from "./locales";
import { MESSAGES } from "./messages";

/**
 * 화면(React) 밖에서 쓰는 번역 함수: 브라우저 알림, 탭 제목, 수료증 그림 등.
 * 화면에서는 useTranslations()를 씁니다. 둘 다 같은 사전을 읽습니다.
 */
export function getTranslator(locale: Locale = getLocale()) {
  return createTranslator({ locale, messages: MESSAGES[locale] });
}

/** 사전 전체를 읽는 번역 함수. useTranslations()의 결과도 같은 모양 */
export type Translator = ReturnType<typeof getTranslator>;
