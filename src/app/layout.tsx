import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeInitScript } from "@/features/theme/themeScript";
import { APP_NAME } from "@/lib/brand";
import { migrateLegacyStorageScript } from "@/lib/storage";
import "@/styles/globals.scss";
import { AppShell } from "./_components/AppShell";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

// 제목(title)은 아래 <head>에 직접 둠: 타이머가 탭 제목에 남은 시간을 쓰는데,
// metadata로 두면 페이지를 옮길 때마다 Next.js가 제목을 되돌려서 남은 시간이 사라짐
export const metadata: Metadata = {
  description: "까미랑 함께하는 뽀모도로 타이머",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 아래 스크립트가 화면 표시 전에 바꾸므로 서버 결과와 다를 수 있음
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        <title>{APP_NAME}</title>
        {/* 화면 표시 전: 예전 저장 이름의 데이터 옮기기 → 저장된 테마 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: migrateLegacyStorageScript + themeInitScript,
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
