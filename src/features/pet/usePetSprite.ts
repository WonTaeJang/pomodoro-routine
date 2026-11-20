"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { LookId } from "./furniture";
import type { PetPose } from "./pet";
import {
  machinePose,
  startMachine,
  stepMachine,
  type MachineRun,
} from "./pixel/machine";
import { frameAt, lastChange, override } from "./pixel/timeline";
import { usePixelCanvas, type Animation } from "./pixel/usePixelCanvas";
import {
  HOME_INPUTS,
  HOME_MACHINE,
  HOME_SCENE,
  outfitPose,
  type HomeInput,
  type HomeState,
} from "./sprites/homeScene";

/** The home Kkami: the state machine, what the page sets, and his outfit. */
class HomeAnimation implements Animation {
  private run: MachineRun<HomeState> = startMachine(HOME_MACHINE);
  private inputs = { ...HOME_INPUTS };
  private triggers = new Set<"snackAgain">();
  private outfit: LookId = "plainOutfit";
  private outfitNodes = outfitPose(this.outfit);
  private active = true;
  private still = false;
  /** Counts states entered, so a quick there-and-back still redraws. */
  private entered = 0;

  set(inputs: Readonly<Record<HomeInput, boolean>>) {
    this.inputs = { ...inputs };
  }
  /** Another treat while one is being eaten: start eating again. */
  snackAgain() {
    this.triggers.add("snackAgain");
  }
  /** Paused while away on a walk; still (first frames only) for reduced motion. */
  play(active: boolean, still: boolean) {
    this.active = active;
    this.still = still;
  }
  playing() {
    return this.active && !this.still;
  }
  wear(look: LookId) {
    this.outfit = look;
    this.outfitNodes = outfitPose(look);
  }
  advance(ms: number) {
    const next = stepMachine(
      HOME_MACHINE,
      this.run,
      ms,
      this.inputs,
      this.triggers,
    );
    this.triggers.clear();
    if (next.state !== this.run.state || next.elapsed < this.run.elapsed)
      this.entered++;
    this.run = next;
  }
  frameKey() {
    const { clip } = HOME_MACHINE.states[this.run.state];
    const frame = lastChange(clip, frameAt(clip, this.run.elapsed));
    return `${this.entered}:${this.run.state}:${frame}:${this.outfit}`;
  }
  pose() {
    return override(machinePose(HOME_MACHINE, this.run), this.outfitNodes);
  }
}

/**
 * The home Kkami on a canvas. `ready` once the first frame is drawn and the
 * page is ready for him; nothing is downloaded.
 */
export function usePetSprite(enabled: boolean) {
  const [animation] = useState(() => new HomeAnimation());
  const canvas = usePixelCanvas(HOME_SCENE, animation);
  return {
    animation,
    bindCanvas: canvas.bindCanvas,
    refresh: canvas.refresh,
    failed: canvas.failed,
    ready: canvas.drawn && enabled && !canvas.failed,
  };
}
export type PetSprite = ReturnType<typeof usePetSprite>;

/**
 * Called after care derives its pose from readiness. With reduced motion,
 * each pose shows its first frame and stays still.
 */
export function usePetSpritePose(
  sprite: PetSprite,
  {
    pose,
    snackSequence,
    active = true,
  }: {
    pose: PetPose;
    snackSequence: number;
    active?: boolean;
  },
) {
  const { animation, refresh } = sprite;
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const previousSnack = useRef(snackSequence);
  const sleeping = pose === "sleeping";
  const startled = pose === "startled";
  const snacking = pose === "snacking";
  const happy = pose === "happy" || snacking;

  useEffect(() => {
    animation.set({
      isHappy: happy,
      isStartled: startled,
      isSleeping: sleeping,
      isSnacking: snacking,
    });
    if (previousSnack.current !== snackSequence) {
      previousSnack.current = snackSequence;
      if (snacking) animation.snackAgain();
    }
    animation.play(active, reducedMotion);
    refresh();
  }, [
    animation,
    refresh,
    active,
    reducedMotion,
    happy,
    startled,
    sleeping,
    snacking,
    snackSequence,
  ]);
}

/** Dress the home Kkami: one outfit at a time (none for the collar). */
export function usePetSpriteOutfit(sprite: PetSprite, look: LookId) {
  const { animation, refresh } = sprite;
  useEffect(() => {
    animation.wear(look);
    refresh();
  }, [animation, refresh, look]);
}
