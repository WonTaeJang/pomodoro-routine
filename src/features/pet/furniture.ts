import { isItemId, type ItemCounts, type ItemId } from "./items";

/** Places in the room that hold one piece of furniture each. */
export const SLOTS = ["window", "pot"] as const;
export type Slot = (typeof SLOTS)[number];

/** Furniture made from walk finds: three items each, two of one kind. */
export const FURNITURE = [
  { id: "twigWindow", slot: "window", need: { twig: 2, leaf: 1 } },
  { id: "flowerWindow", slot: "window", need: { flower: 2, twig: 1 } },
  { id: "stoneWindow", slot: "window", need: { stone: 2, twig: 1 } },
  { id: "flowerPot", slot: "pot", need: { flower: 2, stone: 1 } },
  { id: "pinePot", slot: "pot", need: { pinecone: 2, leaf: 1 } },
  { id: "succulentPot", slot: "pot", need: { stone: 2, leaf: 1 } },
] as const satisfies readonly {
  id: string;
  slot: Slot;
  need: Partial<Record<ItemId, number>>;
}[];

export type FurnitureId = (typeof FURNITURE)[number]["id"];
/** What a slot shows: its starting look or a made piece. */
export const DEFAULT_LOOK = {
  window: "plainWindow",
  pot: "plainPot",
} as const satisfies Record<Slot, string>;
export type LookId = FurnitureId | (typeof DEFAULT_LOOK)[Slot];
export type Placed = Partial<Record<Slot, FurnitureId>>;

export const furnitureById = (id: FurnitureId) =>
  FURNITURE.find((piece) => piece.id === id)!;

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
      (piece) => piece.slot === slot && owned.includes(piece.id),
    ).map((piece) => piece.id),
  ];
}

export const lookOf = (slot: Slot, placed: Placed): LookId =>
  placed[slot] ?? DEFAULT_LOOK[slot];

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

export function canMake(id: FurnitureId, available: ItemCounts): boolean {
  return Object.entries(furnitureById(id).need).every(
    ([item, count]) => (available[item as ItemId] ?? 0) >= count,
  );
}
