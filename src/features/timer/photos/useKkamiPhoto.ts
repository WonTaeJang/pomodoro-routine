"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import {
  ensurePhoto,
  parsePhotoMemory,
  readPhotoMemory,
  shownIndex,
  subscribePhotoMemory,
  type PhotoSlot,
} from "./memory";
import { KKAMI_PHOTOS, type PhotoPool } from "./pools";

/**
 * 이 자리(slot)에 보여 줄 까미 사진. 세션(key)이 바뀔 때만 묶음(pool)에서 새로 랜덤으로 고르고,
 * 같은 세션이면 일시정지·새로고침·다른 탭에서도 같은 사진입니다.
 *
 * 랜덤은 브라우저에서만 고르므로 서버가 그린 첫 화면과 아직 고르기 전에는 null.
 * key가 null이면(아직 저장된 값을 불러오기 전 등) 고르지 않습니다.
 */
export function useKkamiPhoto(
  slot: PhotoSlot,
  key: string | null,
  pool: PhotoPool,
): StaticImageData | null {
  const raw = useSyncExternalStore(
    subscribePhotoMemory,
    readPhotoMemory,
    () => null,
  );
  const photos = KKAMI_PHOTOS[pool];

  useEffect(() => {
    if (key !== null) ensurePhoto(slot, key, pool, photos.length);
  }, [slot, key, pool, photos.length]);

  if (key === null) return null;
  const index = shownIndex(parsePhotoMemory(raw), slot, key, photos.length);
  return index === null ? null : photos[index];
}
