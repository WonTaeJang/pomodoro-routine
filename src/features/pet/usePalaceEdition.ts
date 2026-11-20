"use client";

import { useEffect, useState } from "react";
import { isPalace } from "./furniture";
import { petStore, usePetStore } from "./store";

// 궁전 세트 넷을 모두 놓으면 게임기가 궁전 에디션이 됩니다 (I-067).
// 이번 방문 중에 넷이 갖춰지는 순간에만 헤더로 잠깐 알립니다.

const NOTICE_MS = 3500;

/** Whether the palace set is placed, and whether it just was. */
export function usePalaceEdition() {
  const palace = usePetStore((s) => isPalace(s.pet?.placed ?? {}));
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = petStore.subscribe((next, previous) => {
      // A Kkami loaded or replaced (another account) is not a change.
      if (!next.pet || next.pet.id !== previous.pet?.id) {
        clearTimeout(timer);
        setNotice(false);
        return;
      }
      if (!isPalace(next.pet.placed) || isPalace(previous.pet.placed)) return;
      clearTimeout(timer);
      setNotice(true);
      timer = setTimeout(() => setNotice(false), NOTICE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return { palace, notice };
}
