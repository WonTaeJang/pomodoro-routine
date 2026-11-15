/**
 * One walk, measured from Kkami's first step (the `walkStarted` trigger).
 * The Rive scene plays the same timeline; walkSprite.test.ts checks they match.
 */
export const TRIP = {
  /** A → B: out along the path to the find. */
  toSpot: 3000,
  /** B: sniff and pick it up. */
  pick: 1500,
  /** B → C: back home. */
  toHome: 2000,
  /** C: the outdoors slides away and Kkami turns to face you. */
  arrive: 1000,
} as const;
export const TRIP_MS = TRIP.toSpot + TRIP.pick + TRIP.toHome + TRIP.arrive;
/** The find card stays up for this long, fading out on the way home. */
export const FOUND_CARD_MS = 3000;

export type TripStage = keyof typeof TRIP | "done";

/** Stage and map position (0 at A, 0.5 at B, 1 at C) for elapsed ms. */
export function tripAt(elapsed: number): {
  stage: TripStage;
  progress: number;
} {
  const homeFrom = TRIP.toSpot + TRIP.pick;
  if (elapsed < TRIP.toSpot)
    return { stage: "toSpot", progress: (0.5 * elapsed) / TRIP.toSpot };
  if (elapsed < homeFrom) return { stage: "pick", progress: 0.5 };
  if (elapsed < homeFrom + TRIP.toHome)
    return {
      stage: "toHome",
      progress: 0.5 + (0.5 * (elapsed - homeFrom)) / TRIP.toHome,
    };
  if (elapsed < TRIP_MS) return { stage: "arrive", progress: 1 };
  return { stage: "done", progress: 1 };
}
