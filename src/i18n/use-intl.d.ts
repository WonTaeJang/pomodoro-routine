import type { Locale } from "./locales";
import type { Messages } from "./messages/ko";

// use-intl이 언어와 사전 모양을 알게 함: 없는 문구 키를 쓰면 타입 오류
declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
