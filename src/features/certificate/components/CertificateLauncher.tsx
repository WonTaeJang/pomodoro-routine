"use client";

import { useState, type ReactNode } from "react";
import { CertificateDialog } from "./CertificateDialog";

type CertificateLauncherProps = {
  /** 몇 번째 사이클의 수료증인지 (제 N호). 없으면 가장 최근 사이클 */
  number?: number;
  /** 수료증 팝업을 여는 버튼 등. open을 누르면 열림 */
  children: (open: () => void) => ReactNode;
};

/** 수료증 팝업을 여는 곳 (완료 팝업의 버튼, 메달 배지, 캘린더)에서 씁니다. */
export function CertificateLauncher({
  number,
  children,
}: CertificateLauncherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {children(() => setOpen(true))}
      {/* 열 때만 그려서, 열 때마다 이미지를 새로 만듦 */}
      {open ? (
        <CertificateDialog number={number} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
