/** Things Kkami finds on a walk, in box order. Weights are relative chances. */
export const ITEMS = [
  { id: "leaf", weight: 25 },
  { id: "twig", weight: 25 },
  { id: "stone", weight: 20 },
  { id: "pinecone", weight: 12 },
  { id: "flower", weight: 12 },
  { id: "ball", weight: 6 },
] as const;

export type ItemId = (typeof ITEMS)[number]["id"];
export type ItemCounts = Partial<Record<ItemId, number>>;

const TOTAL_WEIGHT = ITEMS.reduce((sum, item) => sum + item.weight, 0);

export function isItemId(value: unknown): value is ItemId {
  return ITEMS.some((item) => item.id === value);
}

/** Pick one item by weight. `random` returns [0, 1) like Math.random. */
export function pickItem(random: () => number = Math.random): ItemId {
  let roll = random() * TOTAL_WEIGHT;
  for (const item of ITEMS) {
    roll -= item.weight;
    if (roll < 0) return item.id;
  }
  return ITEMS[ITEMS.length - 1].id;
}

export function totalItems(items: ItemCounts): number {
  return Object.values(items).reduce((sum, count) => sum + (count ?? 0), 0);
}

export function isItemCounts(value: unknown): value is ItemCounts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(
    ([id, count]) =>
      isItemId(id) && Number.isSafeInteger(count) && (count as number) > 0,
  );
}
