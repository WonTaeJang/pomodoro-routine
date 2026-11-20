"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pickItem, type ItemId } from "./items";
import { TRIP, tripAt, type TripStage } from "./walkTrip";
// Long gaps (a background tab) do not jump ahead, the same as the walk scene.
import { MAX_STEP_MS } from "./pixel/usePixelCanvas";

// The map moves in small steps; finer updates would only re-render more.
const TICK_MS = 50;

export type WalkTrip = {
  /** The first walk ever is watched to the end. */
  canSkip: boolean;
  /** Kkami took the first step and the trip clock runs. */
  stepped: boolean;
  stage: TripStage;
  progress: number;
  item: ItemId | null;
};

type Events = {
  /** The find at B, or the item a skip brings back right away. */
  onFound: (item: ItemId, skipped: boolean) => void;
  onDone: (skipped: boolean) => void;
};

/**
 * One walk out to a find and back, timed from Kkami's first step so the page
 * and the walk scene stay together. The clock only runs while frames render.
 */
export function useWalkTrip(events: Events) {
  const [trip, setTrip] = useState<WalkTrip | null>(null);
  const handlers = useRef(events);
  useEffect(() => {
    handlers.current = events;
  });
  const found = useRef<ItemId | null>(null);

  const find = useCallback((skipped: boolean) => {
    if (found.current) return found.current;
    found.current = pickItem();
    handlers.current.onFound(found.current, skipped);
    return found.current;
  }, []);

  const begin = useCallback((canSkip: boolean) => {
    found.current = null;
    setTrip({
      canSkip,
      stepped: false,
      stage: "toSpot",
      progress: 0,
      item: null,
    });
  }, []);

  const step = useCallback(() => {
    setTrip((current) => current && { ...current, stepped: true });
  }, []);

  const skip = useCallback(() => {
    const skipped = found.current === null;
    find(true);
    setTrip(null);
    handlers.current.onDone(skipped);
  }, [find]);

  /** Leave without an item (the walk could not load). */
  const cancel = useCallback(() => setTrip(null), []);

  const running = trip?.stepped ?? false;
  useEffect(() => {
    if (!running) return;
    let elapsed = 0,
      shown = -1,
      last: number | null = null,
      frame = 0;
    const tick = (now: number) => {
      elapsed += last === null ? 0 : Math.min(now - last, MAX_STEP_MS);
      last = now;
      const { stage, progress } = tripAt(elapsed);
      if (elapsed >= TRIP.toSpot) find(false);
      if (stage === "done") {
        setTrip(null);
        handlers.current.onDone(false);
        return;
      }
      if (Math.floor(elapsed / TICK_MS) !== shown) {
        shown = Math.floor(elapsed / TICK_MS);
        setTrip(
          (current) =>
            current && { ...current, stage, progress, item: found.current },
        );
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, find]);

  return { trip, begin, step, skip, cancel };
}
