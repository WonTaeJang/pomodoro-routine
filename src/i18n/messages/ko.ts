/**
 * 화면 문구 사전 (한국어, 기준). 다른 언어(en.ts)는 이 파일과 같은 모양이어야 합니다.
 * 기능별로 묶었고, 화면에서는 useTranslations("묶음")으로 읽습니다.
 * 값을 넣는 자리는 {이름}, 개수에 따라 말이 바뀌면 {count, plural, ...} (ICU 메시지 형식).
 */
const ko = {
  app: {
    menu: {
      language: "언어",
    },
  },
  settings: {
    display: {
      language: "언어",
    },
  },
};

export type Messages = typeof ko;
export default ko;
