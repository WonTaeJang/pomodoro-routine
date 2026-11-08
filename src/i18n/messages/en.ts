import type { Messages } from "./ko";

/**
 * 화면 문구 사전 (영어). 한국어(ko.ts)와 같은 모양이어야 하고, 빠진 문구가 있으면 타입 오류.
 * 작은따옴표(')는 ICU 형식에서 특수 문자라 글 속 아포스트로피는 ’를 씁니다.
 */
const en: Messages = {
  app: {
    menu: {
      language: "Language",
    },
  },
  settings: {
    display: {
      language: "Language",
    },
  },
};

export default en;
