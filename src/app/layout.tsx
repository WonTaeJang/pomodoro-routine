import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.scss";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "까미도로",
  description: "까미랑 함께하는 뽀모도로 타이머",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
