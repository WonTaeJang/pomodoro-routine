"use client";

import { useLocale } from "use-intl";
import en from "./content.en";
import ko from "./content.ko";

/**
 * 개인정보처리방침(/privacy)과 이용약관(/terms)의 글. 언어마다 content.<언어>.ts 하나씩.
 * 운영자 이름·연락처·시행일처럼 두 언어가 같이 쓰는 값은 operator.ts 한곳에 둡니다.
 * 실제 수집 항목·저장 위치·탈퇴 방식이 바뀌면 이 글도 같이 고칩니다 (supabase/*.sql, src/lib/storage.ts).
 */

/** 문단 하나. 목록이 딸린 문단은 { text, items } */
export type LegalBlock = string | { text: string; items: string[] };

export type LegalSection = {
  /** 주소 #뒤에 붙는 이름 (목차 링크). 언어가 달라도 같음 */
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalDocId = "privacy" | "terms";

export type LegalContent = {
  tocLabel: string;
  /** "시행일 {date}" */
  effective: (date: string) => string;
  docs: Record<LegalDocId, LegalDoc>;
};

const CONTENT = { ko, en };

export function useLegalContent(): LegalContent {
  return CONTENT[useLocale()];
}
