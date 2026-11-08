"use client";

import { useEffect, useRef, useState } from "react";
import type { CertificateData } from "../certificate";
import { renderCertificate } from "../render/drawCertificate";

type CertificateImage = {
  file: File;
  /** 미리보기, 내려받기에 쓰는 주소 (blob:) */
  url: string;
};

type State = { key: string; image: CertificateImage } | null;

/**
 * 수료증 이미지를 만들어 둡니다.
 * - 내용(data, showTasks)이 실제로 바뀔 때만 다시 그립니다. (같은 내용이면 그대로)
 * - 새 이미지가 나오기 전까지는 예전 이미지를 미리보기로 두되, 공유·저장은 막습니다.
 * - 쓰지 않게 된 이미지 주소는 바로 정리합니다.
 */
export function useCertificateImage(
  data: CertificateData | null,
  showTasks: boolean,
) {
  const key = data ? `${JSON.stringify(data)}:${showTasks}` : null;
  const [state, setState] = useState<State>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  // 그릴 때 쓸 최신 값. 다시 그릴지는 key(내용)로만 정함
  const latest = useRef({ data, showTasks });
  useEffect(() => {
    latest.current = { data, showTasks };
  });

  useEffect(() => {
    const { data, showTasks } = latest.current;
    if (key === null || data === null) return;
    let cancelled = false;
    renderCertificate(data, { showTasks })
      .then((blob) => {
        if (cancelled) return;
        const image = {
          file: new File([blob], `kkamodoro-certificate-${data.number}.png`, {
            type: "image/png",
          }),
          url: URL.createObjectURL(blob),
        };
        setState((previous) => {
          if (previous) URL.revokeObjectURL(previous.image.url);
          return { key, image };
        });
      })
      .catch(() => {
        if (!cancelled) setFailedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // 팝업을 닫을 때 마지막 이미지 주소 정리
  const lastUrl = useRef<string | null>(null);
  useEffect(() => {
    lastUrl.current = state?.image.url ?? null;
  }, [state]);
  useEffect(
    () => () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    },
    [],
  );

  return {
    /** 미리보기용 (내용이 바뀌는 중이면 예전 이미지) */
    preview: state?.image ?? null,
    /** 지금 내용으로 다 만든 이미지. 만드는 중이면 null */
    current: state && state.key === key ? state.image : null,
    failed: key !== null && failedKey === key,
  };
}
