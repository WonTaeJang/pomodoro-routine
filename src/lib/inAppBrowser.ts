/**
 * 카카오톡 안에서 연 브라우저(인앱 브라우저)인지.
 * 이 브라우저는 페이지에서 만든 이미지(blob·data 주소)를 내려받거나 공유 창으로 보내지 못합니다.
 */
export function isKakaoTalkBrowser(): boolean {
  return (
    typeof navigator !== "undefined" && /KAKAOTALK/i.test(navigator.userAgent)
  );
}
