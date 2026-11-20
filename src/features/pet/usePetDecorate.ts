"use client";

import { useState } from "react";
import {
  DEFAULT_LOOK,
  SLOTS,
  furnitureById,
  lookOf,
  looksFor,
  type FurnitureId,
  type LookId,
  type Placed,
  type Slot,
} from "./furniture";
import { petStore } from "./store";
import type { PetLogEvent } from "./usePetLog";

/** Picking a slot, then a look for it. */
export type DecorateStep =
  { step: "slot"; slot: Slot } | { step: "look"; slot: Slot; index: number };

type Options = {
  furniture: readonly FurnitureId[];
  placed: Placed;
  addLog: (event: PetLogEvent) => void;
  /** Kkami's happy reaction once something new is placed. */
  onPlaced: () => void;
};

const wrap = (index: number, length: number) => (index + length) % length;

/**
 * Tamagotchi-style decorating with four keys: ◀ ▶ move, ✓ chooses, ✕ steps
 * back. Looks preview in the room before they are placed; placing one goes
 * back to choosing a slot, so the room can be done in one go.
 */
export function usePetDecorate({
  furniture,
  placed,
  addLog,
  onPlaced,
}: Options) {
  const [mode, setMode] = useState<DecorateStep | null>(null);
  const looks = mode ? looksFor(mode.slot, furniture) : [];

  /** Choose a look for a slot, starting from what it shows now. */
  const pickLook = (slot: Slot): DecorateStep => ({
    step: "look",
    slot,
    index: Math.max(0, looksFor(slot, furniture).indexOf(lookOf(slot, placed))),
  });

  function move(by: 1 | -1) {
    setMode((current) => {
      if (!current) return current;
      if (current.step === "slot")
        return {
          step: "slot",
          slot: SLOTS[wrap(SLOTS.indexOf(current.slot) + by, SLOTS.length)],
        };
      const total = looksFor(current.slot, furniture).length;
      return { ...current, index: wrap(current.index + by, total) };
    });
  }

  function place(slot: Slot, look: LookId) {
    if (look === lookOf(slot, placed)) return;
    const piece = look === DEFAULT_LOOK[slot] ? null : (look as FurnitureId);
    void petStore.getState().recordPlace(slot, piece);
    addLog({ kind: "place", slot, look });
    onPlaced();
  }

  /** ✓: choose the slot, or place the look and go back to choosing a slot. */
  function confirm() {
    if (!mode) return;
    if (mode.step === "slot") return setMode(pickLook(mode.slot));
    place(mode.slot, looks[mode.index]);
    setMode({ step: "slot", slot: mode.slot });
  }

  function back() {
    setMode((current) =>
      current?.step === "look" ? { step: "slot", slot: current.slot } : null,
    );
  }

  return {
    mode,
    /** The looks to cycle through for the chosen slot. */
    looks,
    /** What the room shows while choosing. */
    preview:
      mode?.step === "look"
        ? ({ [mode.slot]: looks[mode.index] } as Partial<Record<Slot, LookId>>)
        : undefined,
    start: () => setMode({ step: "slot", slot: SLOTS[0] }),
    /** Put something made in its place right away (the item box's button). */
    apply: (piece: FurnitureId) => place(furnitureById(piece).slot, piece),
    /** Tap a slot in the room to go straight to its looks. */
    select: (slot: Slot) => setMode(pickLook(slot)),
    prev: () => move(-1),
    next: () => move(1),
    confirm,
    back,
  };
}
