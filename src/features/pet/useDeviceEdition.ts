"use client";

import { useEffect, useState } from "react";
import { editionOf, tintOf, type EditionId, type Placed } from "./furniture";
import { petStore, usePetStore } from "./store";
import { shownPlaced } from "./usePetVip";

// 에디션 세트(궁전 I-067, 아이돌 무대 = VIP 에디션) 넷을 모두 놓으면 게임기 모양이 바뀝니다.
// 이번 방문 중에 넷이 갖춰지는 순간에만 헤더로 잠깐 알립니다.
// 다른 세트(숲속 오두막·파스텔 꽃·줄무늬 클래식)는 넷을 다 놓으면 본체 색만 바뀌고 알리지 않습니다.

const NOTICE_MS = 3500;

/** The edition the room makes as this account sees it (VIP pieces only on VIP). */
const shownEdition = (placed: Placed, vip: boolean | null) =>
  editionOf(shownPlaced(placed, vip));

/**
 * The device's edition, its colour from a tint set, and which edition was
 * just completed (for a few seconds). VIP pieces count only on a VIP
 * account, like everywhere else.
 */
export function useDeviceEdition(vip: boolean | null) {
  const current = usePetStore((s) => shownEdition(s.pet?.placed ?? {}, vip));
  const tint = usePetStore((s) => tintOf(s.pet?.placed ?? {}));
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
      const now = shownEdition(next.pet.placed, vip);
      if (!now || now === shownEdition(previous.pet.placed, vip)) return;
      clearTimeout(timer);
      setNotice(now);
      timer = setTimeout(() => setNotice(null), NOTICE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [vip]);

  return { current, tint, notice };
}
