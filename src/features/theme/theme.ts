"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/storage";

export type Theme = "light" | "dark";
/** 사용자가 고른 테마. system이면 기기 설정을 따름 */
export type ThemeChoice = Theme | "system";

const CHANGE_EVENT = "kkamodoro-theme-change";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** 지금 화면에 적용된 테마 (직접 고른 값 → 없으면 기기 설정) */
function getEffectiveTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return darkQuery().matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const query = darkQuery();
  query.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** 지금 테마. 서버와 첫 렌더링에서는 null */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, getEffectiveTheme, () => null);
}

function getThemeChoice(): ThemeChoice {
  const chosen = document.documentElement.dataset.theme;
  return chosen === "light" || chosen === "dark" ? chosen : "system";
}

/** 사용자가 고른 테마 (설정 화면용). 서버와 첫 렌더링에서는 null */
export function useThemeChoice(): ThemeChoice | null {
  return useSyncExternalStore(subscribe, getThemeChoice, () => null);
}

/** 테마를 직접 고릅니다. null이면 기기 설정을 따릅니다. */
export function setTheme(theme: Theme | null) {
  try {
    if (theme) localStorage.setItem(STORAGE_KEYS.theme, theme);
    else localStorage.removeItem(STORAGE_KEYS.theme);
  } catch {
    // 저장이 막힌 환경(사생활 보호 모드 등)에서도 화면 전환은 되게 함
  }
  applyTheme(theme);
}

/** 다른 탭이 저장한 테마를 이 탭에도 적용합니다. */
export function applySavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  applyTheme(saved === "light" || saved === "dark" ? saved : null);
}

function applyTheme(theme: Theme | null) {
  const root = document.documentElement;
  if (theme) root.dataset.theme = theme;
  else delete root.dataset.theme;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
