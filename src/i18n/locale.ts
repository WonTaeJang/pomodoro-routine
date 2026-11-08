"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_LOCALE, detectLocale, isLocale, type Locale } from "./locales";

const CHANGE_EVENT = "kkamodoro-locale-change";

/**
 * 지금 화면 언어. 시작 스크립트(localeInitScript)가 정한 <html lang>을 읽습니다.
 * 화면 밖 코드(브라우저 알림, 수료증 그림 등)도 이걸로 언어를 정합니다.
 */
export function getLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/**
 * 지금 화면 언어 (I18nProvider용. 화면에서는 use-intl의 useLocale을 씀).
 * 서버와 첫 렌더링에서는 기본 언어라서 화면이 서버 결과와 맞고, 그다음 고른 언어로 다시 그립니다.
 */
export function useLocaleState(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => DEFAULT_LOCALE);
}

/** 언어를 직접 고릅니다. null이면 저장을 지우고 브라우저 언어를 따릅니다. */
export function setLocale(locale: Locale | null) {
  try {
    if (locale) localStorage.setItem(STORAGE_KEYS.locale, locale);
    else localStorage.removeItem(STORAGE_KEYS.locale);
  } catch {
    // 저장이 막힌 환경(사생활 보호 모드 등)에서도 화면 언어는 바뀌게 함
  }
  applyLocale(locale ?? detectBrowserLocale());
}

/** 다른 탭이 저장한 언어를 이 탭에도 적용합니다. */
export function applySavedLocale() {
  const saved = localStorage.getItem(STORAGE_KEYS.locale);
  applyLocale(isLocale(saved) ? saved : detectBrowserLocale());
}

function detectBrowserLocale(): Locale {
  return detectLocale(navigator.languages ?? [navigator.language]);
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
