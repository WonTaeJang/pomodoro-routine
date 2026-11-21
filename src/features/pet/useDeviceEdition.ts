"use client";

import { useEffect, useState } from "react";
import { editionOf, type EditionId } from "./furniture";
import { petStore, usePetStore } from "./store";
import { shownPlaced } from "./usePetVip";

// 에디션 세트(궁전 I-067, 아이돌 무대 = VIP 에디션) 넷을 모두 놓으면 게임기 모양이 바뀝니다.
// 이번 방문 중에 넷이 갖춰지는 순간에만 헤더로 잠깐 알립니다.

const NOTICE_MS = 3500;

/**
 * The device's edition, and which edition was just completed (for a few
 * seconds). VIP pieces count only on a VIP account, like everywhere else.
 */
export function useDeviceEdition(vip: boolean | null) {
  const edition = usePetStore((s) =>
    editionOf(shownPlaced(s.pet?.placed ?? {}, vip)),
  );
  const [notice, setNotice] = useState<EditionId | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = petStore.subscribe((next, previous) => {
      // A Kkami loaded or replaced (another account) is not a change.
      if (!next.pet || next.pet.id !== previous.pet?.id) {
        clearTimeout(timer);
        setNotice(null);
        return;
      }
      const now = editionOf(shownPlaced(next.pet.placed, vip));
      if (!now || now === editionOf(shownPlaced(previous.pet.placed, vip)))
        return;
      clearTimeout(timer);
      setNotice(now);
      timer = setTimeout(() => setNotice(null), NOTICE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [vip]);

  return { edition, notice };
}
