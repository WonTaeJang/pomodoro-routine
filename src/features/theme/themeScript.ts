// 서버(레이아웃)에서도 쓰므로 "use client" 없이 둡니다.

/** 사용자가 직접 고른 테마를 저장하는 localStorage 키. 값이 없으면 기기 설정을 따름 */
export const THEME_STORAGE_KEY = "kkamidoro-theme";

/**
 * 화면이 그려지기 전에 <head>에서 실행되는 스크립트.
 * 저장된 테마를 먼저 적용해서 새로고침할 때 화면이 반대 색으로 번쩍이지 않게 합니다.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
