"use client";

import { useLocale } from "use-intl";
import type { Locale } from "@/i18n";
import en from "./content.en";
import ko from "./content.ko";

/**
 * 사용법 페이지(I-010)와 첫 방문 안내(I-009)의 글. 언어마다 content.<언어>.ts 하나씩.
 * 글이 길고 목록·아이콘 자리표시(`{paw}`)가 많아서 화면 문구 사전(src/i18n/messages) 대신 여기에 둡니다.
 * 시간·개수처럼 앱 설정에서 오는 값은 그 값을 그대로 씁니다 (앱이 바뀌어도 어긋나지 않게).
 */

export type GuideIcon =
  | "paw"
  | "timer"
  | "check"
  | "headphones"
  | "calendar"
  | "medal"
  | "bell"
  | "keyboard"
  | "save";

/** 글 속에 넣는 앱 아이콘. 문구에 `{paw}`처럼 쓰면 그 자리에 아이콘이 들어갑니다. */
export const INLINE_ICON_NAMES = [
  "paw",
  "calendar",
  "menu",
  "play",
  "reset",
  "skip",
  "grip",
  "headphones",
  "medal",
] as const;

export type InlineIcon = (typeof INLINE_ICON_NAMES)[number];

export type GuideSection = {
  /** 주소 #뒤에 붙는 이름 (목차 링크). 언어가 달라도 같음 */
  id: string;
  icon: GuideIcon;
  title: string;
  points: string[];
};

export type OnboardingSlide = {
  /** 그림을 고르는 이름 */
  id: "welcome" | "start" | "more" | "shortcuts";
  title: string;
  points: string[];
  /** 키보드가 있는 기기에서만 보여줌 */
  keyboardOnly?: boolean;
};

export type GuideContent = {
  page: { title: string; intro: string; tocLabel: string };
  /** 화면 낭독기가 글 속 아이콘 대신 읽는 말 */
  inlineIcons: Record<InlineIcon, string>;
  sections: GuideSection[];
  /** 첫 방문 안내의 버튼 등 */
  onboarding: {
    skip: string;
    prev: string;
    next: string;
    done: string;
    moreGuide: string;
    replay: string;
    progress: (current: number, total: number) => string;
  };
  slides: OnboardingSlide[];
};

export const GUIDE_CONTENT: Record<Locale, GuideContent> = { ko, en };

/** 지금 화면 언어의 사용법 글 */
export function useGuideContent(): GuideContent {
  return GUIDE_CONTENT[useLocale()];
}
