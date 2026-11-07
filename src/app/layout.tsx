import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeInitScript } from "@/features/theme/themeScript";
import { APP_NAME } from "@/lib/brand";
import { migrateLegacyStorageScript } from "@/lib/storage";
import "@/styles/globals.scss";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "까미랑 함께하는 뽀모도로 타이머",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 아래 스크립트가 화면 표시 전에 바꾸므로 서버 결과와 다를 수 있음
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        {/* 화면 표시 전: 예전 저장 이름의 데이터 옮기기 → 저장된 테마 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: migrateLegacyStorageScript + themeInitScript,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
