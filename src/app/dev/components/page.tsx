import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { Playground } from "./Playground";

export const metadata: Metadata = {
  title: `컴포넌트 미리보기 · ${APP_NAME}`,
  robots: { index: false },
};

/** 공통 컴포넌트 미리보기. 개발 중(npm run dev)에만 열립니다. */
export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Playground />;
}
