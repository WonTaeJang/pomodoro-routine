"use client";

import { lookOf, type LookId, type Slot } from "../furniture";
import { lookArt, type PixelArt } from "../roomArt";
import { usePetStore } from "../store";
import { useTimeOfDay } from "../useTimeOfDay";
import styles from "./PetPlayground.module.scss";

/** A room drawing at the room's cell size, or at `cell` pixels per cell. */
export function Pixels({ art, cell }: { art: PixelArt; cell?: number }) {
  const unit = cell ? `${cell}px` : "var(--room-cell)";
  return (
    <svg
      className={styles.pixels}
      style={{
        width: `calc(${unit} * ${art.width})`,
        height: `calc(${unit} * ${art.height})`,
      }}
      viewBox={`0 0 ${art.width} ${art.height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {art.paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
}

/**
 * A furniture look as a small picture: `cell` pixels per cell, or scaled to
 * `height` pixels (log icons).
 */
export function LookPicture({
  look,
  cell,
  height,
}: {
  look: LookId;
} & ({ cell: number; height?: never } | { height: number; cell?: never })) {
  const art = lookArt(look, "day");
  return <Pixels art={art} cell={cell ?? height! / art.height} />;
}

export type RoomDecorating = {
  selected: Slot;
  /** Shown under the selected slot, e.g. the look being tried. */
  tag: string;
  /** Accessible name of each slot's button. */
  label: (slot: Slot) => string;
  onSelect: (slot: Slot) => void;
};

/**
 * The room's window, plant and rug, shared by home and the start of a walk.
 * Shows the placed furniture, or `preview` looks while decorating.
 */
export function PetRoomArt({
  preview,
  decorating,
}: {
  preview?: Partial<Record<Slot, LookId>>;
  decorating?: RoomDecorating;
}) {
  const placed = usePetStore((s) => s.pet?.placed);
  const time = useTimeOfDay();
  const slot = (name: Slot, className: string) => {
    const selected = decorating?.selected === name;
    return (
      <div className={className} data-selected={selected}>
        <Pixels
          art={lookArt(preview?.[name] ?? lookOf(name, placed ?? {}), time)}
        />
        {decorating && (
          <button
            type="button"
            className={styles.slotPick}
            aria-label={decorating.label(name)}
            aria-pressed={selected}
            onClick={() => decorating.onSelect(name)}
          />
        )}
        {selected && (
          <span className={styles.slotTag} aria-hidden="true">
            {decorating.tag}
          </span>
        )}
      </div>
    );
  };
  return (
    <>
      {slot("window", styles.window)}
      {slot("pot", styles.plant)}
      <div className={styles.rug} aria-hidden="true" />
    </>
  );
}
