import { isItemId, type ItemCounts, type ItemId } from "./items";

/**
 * Places in the room that hold one piece of furniture each, in decorating
 * order: the walls and floor as one set, then the window, pot and rug, what
 * Kkami wears, and his speech bubble.
 */
export const SLOTS = [
  "room",
  "window",
  "pot",
  "rug",
  "outfit",
  "bubble",
] as const;
export type Slot = (typeof SLOTS)[number];

/**
 * What things are made from: walk finds, hearts from level ups, and paw
 * stamps from finished cycles (counted from focus records, src/features/pet/stamps.ts).
 */
export type Material = ItemId | "heart" | "stamp";
export type MaterialCounts = Partial<Record<Material, number>>;

/**
 * Furniture made from walk finds: three each, two of one kind. Outfits take
 * a heart and two finds; the brown hat is everyone's from the start (free).
 * Speech bubbles take a paw stamp and two finds (I-066), and so does the
 * palace set: one more wall, window, pot and rug (I-067).
 */
export const FURNITURE = [
  { id: "twigWindow", slot: "window", need: { twig: 2, leaf: 1 } },
  { id: "flowerWindow", slot: "window", need: { flower: 2, twig: 1 } },
  { id: "stoneWindow", slot: "window", need: { stone: 2, twig: 1 } },
  { id: "palaceWindow", slot: "window", need: { stamp: 1, stone: 2 } },
  { id: "flowerPot", slot: "pot", need: { flower: 2, stone: 1 } },
  { id: "pinePot", slot: "pot", need: { pinecone: 2, leaf: 1 } },
  { id: "succulentPot", slot: "pot", need: { stone: 2, leaf: 1 } },
  { id: "palacePot", slot: "pot", need: { stamp: 1, leaf: 2 } },
  { id: "cabinRoom", slot: "room", need: { twig: 2, pinecone: 1 } },
  { id: "floralRoom", slot: "room", need: { flower: 2, leaf: 1 } },
  { id: "stripeRoom", slot: "room", need: { stone: 2, pinecone: 1 } },
  { id: "palaceRoom", slot: "room", need: { stamp: 1, pinecone: 2 } },
  { id: "braidRug", slot: "rug", need: { leaf: 2, flower: 1 } },
  { id: "pinkRug", slot: "rug", need: { flower: 2, ball: 1 } },
  { id: "fringeRug", slot: "rug", need: { pinecone: 2, ball: 1 } },
  { id: "palaceRug", slot: "rug", need: { stamp: 1, ball: 2 } },
  { id: "brownHat", slot: "outfit", need: {}, free: true },
  { id: "ginghamBib", slot: "outfit", need: { heart: 1, flower: 2 } },
  { id: "creamScarf", slot: "outfit", need: { heart: 1, leaf: 2 } },
  { id: "checkShirt", slot: "outfit", need: { heart: 1, stone: 2 } },
  { id: "coneCollar", slot: "outfit", need: { heart: 1, ball: 2 } },
  { id: "gameBubble", slot: "bubble", need: { stamp: 1, stone: 1, ball: 1 } },
  { id: "cloudBubble", slot: "bubble", need: { stamp: 1, leaf: 1, flower: 1 } },
  { id: "heartBubble", slot: "bubble", need: { stamp: 1, flower: 2 } },
  {
    id: "stampBubble",
    slot: "bubble",
    need: { stamp: 1, twig: 1, pinecone: 1 },
  },
] as const satisfies readonly {
  id: string;
  slot: Slot;
  need: MaterialCounts;
  free?: true;
}[];

export type FurnitureId = (typeof FURNITURE)[number]["id"];
/** What a slot shows: its starting look or a made piece. */
export const DEFAULT_LOOK = {
  room: "plainRoom",
  window: "plainWindow",
  pot: "plainPot",
  rug: "plainRug",
  outfit: "plainOutfit",
  bubble: "plainBubble",
} as const satisfies Record<Slot, string>;
export type LookId = FurnitureId | (typeof DEFAULT_LOOK)[Slot];
/** The looks one slot can show: its starting look and what is made for it. */
export type SlotLook<S extends Slot> =
  | Extract<(typeof FURNITURE)[number], { slot: S }>["id"]
  | (typeof DEFAULT_LOOK)[S];
export type Placed = Partial<Record<Slot, FurnitureId>>;

export const furnitureById = (id: FurnitureId) =>
  FURNITURE.find((piece) => piece.id === id)!;

/** Owned without being made (the brown hat). */
export const isFree = (id: FurnitureId) => "free" in furnitureById(id);
/** Made, or free to everyone. */
export const owns = (made: readonly FurnitureId[], id: FurnitureId) =>
  made.includes(id) || isFree(id);
/** What can be made, in catalog order. */
export const RECIPES = FURNITURE.filter((piece) => !("free" in piece));

/** A material used on what was made. */
const spentOn = (material: Material, furniture: readonly FurnitureId[]) =>
  furniture.reduce(
    (sum, id) =>
      sum + ((furnitureById(id).need as MaterialCounts)[material] ?? 0),
    0,
  );
/** Hearts used on what was made. */
export const heartsSpent = (furniture: readonly FurnitureId[]) =>
  spentOn("heart", furniture);
/** Paw stamps used on what was made. */
export const stampsSpent = (furniture: readonly FurnitureId[]) =>
  spentOn("stamp", furniture);

export function isFurnitureId(value: unknown): value is FurnitureId {
  return FURNITURE.some((piece) => piece.id === value);
}

export function isSlot(value: unknown): value is Slot {
  return SLOTS.includes(value as Slot);
}

/** The looks a slot can show, starting look first, in catalog order. */
export function looksFor(slot: Slot, owned: readonly FurnitureId[]): LookId[] {
  return [
    DEFAULT_LOOK[slot],
    ...FURNITURE.filter(
      (piece) => piece.slot === slot && owns(owned, piece.id),
    ).map((piece) => piece.id),
  ];
}

export const lookOf = (slot: Slot, placed: Placed): LookId =>
  placed[slot] ?? DEFAULT_LOOK[slot];

/** The palace set: placed all together, Kkami notices (src/features/pet/speech.ts). */
export const PALACE_SET = {
  room: "palaceRoom",
  window: "palaceWindow",
  pot: "palacePot",
  rug: "palaceRug",
} as const satisfies Partial<Record<Slot, FurnitureId>>;

export const isPalace = (placed: Placed) =>
  Object.entries(PALACE_SET).every(([slot, id]) => placed[slot as Slot] === id);

/** Items left to use: found minus spent. */
export function availableItems(
  found: ItemCounts,
  spent: ItemCounts,
): ItemCounts {
  return Object.fromEntries(
    Object.entries(found)
      .filter(([id]) => isItemId(id))
      .map(([id, count]) => [id, (count ?? 0) - (spent[id as ItemId] ?? 0)])
      .filter(([, count]) => (count as number) > 0),
  );
}

export function canMake(id: FurnitureId, available: MaterialCounts): boolean {
  return Object.entries(furnitureById(id).need).every(
    ([material, count]) => (available[material as Material] ?? 0) >= count,
  );
}
