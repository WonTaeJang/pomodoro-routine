"use client";

import { useRef, useState, type PointerEvent } from "react";

/** 이만큼(px) 넘게 밀면 넘김 */
const THRESHOLD = 50;

type SwipeOptions = {
  /** 왼쪽으로 밀었을 때(다음) */
  onNext: () => void;
  /** 오른쪽으로 밀었을 때(이전) */
  onPrev: () => void;
  /** 더 넘길 곳이 있는지. 끝에서는 덜 따라 움직여서 막혀 있음을 보여줌 */
  canNext: boolean;
  canPrev: boolean;
};

/**
 * 손가락으로 좌우로 밀어 넘기기. 터치(와 펜)만 받고 마우스는 무시합니다.
 * 붙일 요소에 `touch-action: pan-y`를 주면 위아래 스크롤은 브라우저가 그대로 처리합니다.
 * 돌려준 `offset`(px)으로 미는 동안 내용을 손가락에 맞춰 옮길 수 있습니다.
 */
export function useSwipe({ onNext, onPrev, canNext, canPrev }: SwipeOptions) {
  const start = useRef<{ id: number; x: number } | null>(null);
  const [offset, setOffset] = useState(0);

  const end = () => {
    start.current = null;
    setOffset(0);
  };

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.pointerType === "mouse") return;
      start.current = { id: e.pointerId, x: e.clientX };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      if (start.current?.id !== e.pointerId) return;
      const dx = e.clientX - start.current.x;
      const blocked = (dx < 0 && !canNext) || (dx > 0 && !canPrev);
      setOffset(blocked ? dx / 4 : dx);
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      if (start.current?.id !== e.pointerId) return;
      const dx = e.clientX - start.current.x;
      if (dx <= -THRESHOLD && canNext) onNext();
      if (dx >= THRESHOLD && canPrev) onPrev();
      end();
    },
    // 브라우저가 위아래 스크롤로 가져가면 취소
    onPointerCancel: end,
  };

  return { handlers, offset, dragging: offset !== 0 };
}
