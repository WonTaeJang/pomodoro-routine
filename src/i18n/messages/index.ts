import type { Locale } from "../locales";
import en from "./en";
import ko, { type Messages } from "./ko";

/** 언어별 화면 문구 사전. 한국어(ko.ts)가 기준이고 다른 언어는 같은 모양이어야 합니다. */
export const MESSAGES: Record<Locale, Messages> = { ko, en };
