import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeInitScript } from "@/features/theme/themeScript";
import { I18nProvider } from "@/i18n";
import { localeInitScript } from "@/i18n/locales";
import { APP_NAME } from "@/lib/brand";
import { migrateLegacyStorageScript } from "@/lib/storage";
import "@/styles/globals.scss";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppShell } from "./_components/AppShell";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

// 제목(title)은 아래 <head>에 직접 둠: 타이머가 탭 제목에 남은 시간을 쓰는데,
// metadata로 두면 페이지를 옮길 때마다 Next.js가 제목을 되돌려서 남은 시간이 사라짐
// 설명·링크 미리보기는 언어별로 나눌 수 없어서 (주소가 하나) 두 언어를 함께 씀
const DESCRIPTION =
  "까미랑 함께하는 뽀모도로 타이머 · A pomodoro timer with Kkami";

// 링크 미리보기 이미지(app/opengraph-image.png)를 전체 주소로 내보내는 기준.
// Vercel 운영 배포는 운영 주소, 그 밖(개발 서버 등)은 localhost
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description: DESCRIPTION,
  // 카카오톡·슬랙 등 링크 미리보기. 이미지는 app/opengraph-image.png를 Next.js가 자동으로 붙임
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: DESCRIPTION,
    locale: "ko_KR",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme, lang은 아래 스크립트가 화면 표시 전에 바꾸므로 서버 결과와 다를 수 있음
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        <title>{APP_NAME}</title>
        {/* 화면 표시 전: 예전 저장 이름의 데이터 옮기기 → 저장된 테마 적용 → 언어 정하기 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              migrateLegacyStorageScript + themeInitScript + localeInitScript,
          }}
        />
      </head>
      <body>
        <I18nProvider>
          <AppShell footer={<AppFooter />}>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
