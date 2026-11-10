"use client";

import {
  useEffect,
  useReducer,
  useRef,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { createPetState, petReducer, PET_STROKE_DISTANCE } from "./pet";

/** 포인터 제스처와 종료 예약만 연결. 쓰담 횟수는 페이지 안에서만 유지. */
export function usePetCare(ready: boolean) {
  const [state, dispatch] = useReducer(petReducer, undefined, createPetState);
  const stroke = useRef<{ id: number; x: number; y: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (state.happyUntil === null) return;
    const timer = setTimeout(
      () => dispatch({ type: "settle", now: performance.now() }),
      // Round up so the timeout cannot run just before its deadline.
      Math.ceil(Math.max(0, state.happyUntil - performance.now())),
    );
    return () => clearTimeout(timer);
  }, [state.happyUntil]);

  function pet() {
    if (ready) dispatch({ type: "pet", now: performance.now() });
  }

  function startStroke(event: PointerEvent<HTMLButtonElement>) {
    if (!ready || !event.isPrimary || event.button !== 0) return;
    dragged.current = false;
    stroke.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveStroke(event: PointerEvent<HTMLButtonElement>) {
    const start = stroke.current;
    if (!start || start.id !== event.pointerId) return;
    if (
      Math.hypot(event.clientX - start.x, event.clientY - start.y) <
      PET_STROKE_DISTANCE
    )
      return;
    dragged.current = true;
    stroke.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    pet();
  }

  function endStroke(event: PointerEvent<HTMLButtonElement>) {
    if (stroke.current?.id === event.pointerId) stroke.current = null;
  }

  function clickPet(event: MouseEvent<HTMLButtonElement>) {
    // Pointer-up also dispatches click after a drag. Keyboard clicks still work.
    if (event.detail === 0 || !dragged.current) pet();
    dragged.current = false;
  }

  function reset() {
    stroke.current = null;
    dragged.current = false;
    dispatch({ type: "reset" });
  }

  return {
    happy: state.happyUntil !== null,
    pats: state.pats,
    pet,
    reset,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  };
}
