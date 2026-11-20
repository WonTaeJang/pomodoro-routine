"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { TimeOfDay } from "./roomArt";
import { useTimeOfDay } from "./useTimeOfDay";
import { usePixelCanvas, type Animation } from "./pixel/usePixelCanvas";
import {
  WALK_SCENE,
  WALK_STEP_MS,
  walkFrameKey,
  walkPose,
} from "./sprites/walkScene";

/** One walk from its start; tells once when Kkami takes his first step. */
class WalkAnimation implements Animation {
  private ms = 0;
  private time: TimeOfDay = "day";
  private paused = false;
  private stepped = false;
  private stepListener: (() => void) | null = null;

  /** Hear about the first step; returns a function to stop listening. */
  onStep(listener: () => void) {
    this.stepListener = listener;
    return () => {
      if (this.stepListener === listener) this.stepListener = null;
    };
  }
  set(time: TimeOfDay, paused: boolean) {
    this.time = time;
    this.paused = paused;
  }
  playing() {
    return !this.paused;
  }
  advance(ms: number) {
    this.ms += ms;
    if (!this.stepped && this.ms >= WALK_STEP_MS) {
      this.stepped = true;
      this.stepListener?.();
    }
  }
  frameKey() {
    return walkFrameKey(this.ms, this.time);
  }
  pose() {
    return walkPose(this.ms, this.time);
  }
}

/**
 * One walk on a canvas, under the same sky as the home window. With reduced
 * motion the start (turning round in the room) still plays, then it holds
 * the first step while the page's trip clock, map and find card carry on.
 */
export function useWalkSprite(onStep: () => void) {
  const [animation] = useState(() => new WalkAnimation());
  const [walking, setWalking] = useState(false);
  const { bindCanvas, drawn, failed, refresh } = usePixelCanvas(
    WALK_SCENE,
    animation,
  );
  useEffect(
    () =>
      animation.onStep(() => {
        setWalking(true);
        onStep();
      }),
    [animation, onStep],
  );

  const time = useTimeOfDay();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    animation.set(time, walking && reducedMotion);
    refresh();
  }, [animation, refresh, time, walking, reducedMotion]);

  return { bindCanvas, drawn, failed };
}
