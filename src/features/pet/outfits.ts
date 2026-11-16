import type { FurnitureId } from "./furniture";

/**
 * The Rive flag that shows each outfit on the home Kkami
 * (scripts/pet-outfits.mjs). Kkami wears one at a time.
 */
export const OUTFIT_FLAGS = {
  brownHat: "isHat",
  ginghamBib: "isGingham",
  creamScarf: "isScarf",
  checkShirt: "isShirt",
  coneCollar: "isCone",
} as const satisfies Partial<Record<FurnitureId, string>>;
