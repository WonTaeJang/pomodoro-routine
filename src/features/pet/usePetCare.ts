"use client";

import {
  useEffect,
  useState,
  useRef,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { useStore } from "zustand";
import { PET_STROKE_DISTANCE, nextReactionAt, petPose } from "./pet";
import { createPetCareStore } from "./careStore";
import { petStore } from "./store";

/**
 * 포인터·타이머는 페이지별 상태, 인정된 쓰담·간식은 영구 기록으로 전달.
 * resting: 휴식 중에 만나면 자고 있지 않고 깨어서 반김
 */
export function usePetCare(ready: boolean, resting = false) {
  const [careStore] = useState(() =>
    createPetCareStore(
      () => {
        void petStore.getState().recordPat();
      },
      () => {
        void petStore.getState().recordSnack();
      },
    ),
  );
  const state = useStore(careStore, (s) => s.state);
  const dispatch = careStore.getState().dispatch;
  const stroke = useRef<{ id: number; x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const reactionAt = nextReactionAt(state);
  // Start only acts once, before the intro: a break that begins later wakes nobody.
  useEffect(() => {
    if (ready)
      dispatch({ type: "start", now: performance.now(), awake: resting });
  }, [ready, resting, state.phase, state.introUntil, dispatch]);

  useEffect(() => {
    if (!ready || state.introUntil === null) return;
    const timer = setTimeout(
      () => dispatch({ type: "advanceIntro", now: performance.now() }),
      Math.ceil(Math.max(0, state.introUntil - performance.now())),
    );
    return () => clearTimeout(timer);
  }, [ready, state.introUntil, dispatch]);

  useEffect(() => {
    if (reactionAt === null) return;
    const timer = setTimeout(
      () => dispatch({ type: "settle", now: performance.now() }),
      // Round up so the timeout cannot run just before its deadline.
      Math.ceil(Math.max(0, reactionAt - performance.now())),
    );
    return () => clearTimeout(timer);
  }, [reactionAt, dispatch]);

  function pet() {
    if (ready) dispatch({ type: "pet", now: performance.now() });
  }

  function feed() {
    if (ready) dispatch({ type: "feed", now: performance.now() });
  }

  function walk() {
    stroke.current = null;
    dragged.current = false;
    if (ready) dispatch({ type: "walk", now: performance.now() });
  }

  /** A happy reaction that is not a pat (the room was decorated). */
  function cheer() {
    if (ready) dispatch({ type: "cheer", now: performance.now() });
  }

  function returnHome() {
    dispatch({ type: "returnHome", now: performance.now() });
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

  return {
    walking: state.location === "walk",
    awakeAt: state.awakeAt,
    homeAt: state.homeAt,
    walk,
    returnHome,
    cheer,
    pose: petPose(state),
    snackSequence: state.snacks,
    pet,
    feed,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  };
}
