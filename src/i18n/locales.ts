// 레이아웃의 시작 스크립트(서버에서 만듦)에서도 쓰므로 "use client" 없이 둡니다.
import { STORAGE_KEYS } from "@/lib/storage";

/** 화면 언어. 앞의 것이 기본 언어 */
export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** 서버가 그리는 언어. 브라우저에서 다른 언어로 정해지면 그 언어로 다시 그림 */
export const DEFAULT_LOCALE: Locale = "ko";

/** 지원하지 않는 언어를 쓰는 브라우저에 보여줄 언어 */
export const FALLBACK_LOCALE: Locale = "en";

/** 언어 메뉴에 쓰는 이름. 어느 언어 화면에서든 그 언어로 씀 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * 브라우저 언어 목록(navigator.languages)에서 지원하는 첫 언어. "ko-KR" → "ko".
 * 하나도 없으면 영어.
 */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return FALLBACK_LOCALE;
}

/**
 * 화면이 그려지기 전에 <head>에서 실행되는 스크립트. 위 detectLocale과 같은 규칙입니다.
 * 직접 고른 언어 → 없으면 브라우저 언어로 <html lang>을 정합니다.
 * 고르지 않았으면 저장하지 않아서, 브라우저 언어를 바꾸면 따라갑니다.
 */
export const localeInitScript = `try{var L=${JSON.stringify(LOCALES)},l=localStorage.getItem("${STORAGE_KEYS.locale}");if(L.indexOf(l)<0){l="${FALLBACK_LOCALE}";var n=navigator.languages||[navigator.language];for(var i=0;i<n.length;i++){var b=String(n[i]).toLowerCase().split("-")[0];if(L.indexOf(b)>=0){l=b;break}}}document.documentElement.lang=l}catch(e){}`;
