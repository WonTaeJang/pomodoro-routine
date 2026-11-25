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
export type Material = ItemId | "heart" | "stamp" | "snow";
export type MaterialCounts = Partial<Record<Material, number>>;

/**
 * Furniture made from walk finds: three each, two of one kind. Outfits take
 * a heart and two finds; the brown hat is everyone's from the start (free).
 * Speech bubbles take a paw stamp and two finds (I-066), and so does the
 * palace set: one more wall, window, pot and rug (I-067). The Christmas
 * pieces take two snowflakes from the winter snow boxes and a find (I-074,
 * season). The idol stage and its cheer sign bubble are never made: VIP
 * accounts have them (vip).
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
  {
    id: "christmasRoom",
    slot: "room",
    need: { snow: 2, pinecone: 1 },
    season: "winter",
  },
  {
    id: "christmasWindow",
    slot: "window",
    need: { snow: 2, twig: 1 },
    season: "winter",
  },
  {
    id: "christmasTree",
    slot: "pot",
    need: { snow: 2, leaf: 1 },
    season: "winter",
  },
  { id: "santaRug", slot: "rug", need: { snow: 2, ball: 1 }, season: "winter" },
  {
    id: "santaSuit",
    slot: "outfit",
    need: { snow: 2, flower: 1 },
    season: "winter",
  },
  {
    id: "christmasBubble",
    slot: "bubble",
    need: { snow: 2, stone: 1 },
    season: "winter",
  },
  { id: "stageRoom", slot: "room", need: {}, vip: true },
  { id: "lightstickWindow", slot: "window", need: {}, vip: true },
  { id: "standMicPot", slot: "pot", need: {}, vip: true },
  { id: "centerStageRug", slot: "rug", need: {}, vip: true },
  { id: "cheerBubble", slot: "bubble", need: {}, vip: true },
] as const satisfies readonly {
  id: string;
  slot: Slot;
  need: MaterialCounts;
  free?: true;
  vip?: true;
  /** Made from a season's material, shown once it has come (I-074). */
  season?: "winter";
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
/** For VIP accounts only, never made: the idol stage set and its bubble. */
export const isVip = (look: LookId) =>
  isFurnitureId(look) && "vip" in furnitureById(look);
/** Made, or free to everyone. */
export const owns = (made: readonly FurnitureId[], id: FurnitureId) =>
  made.includes(id) || isFree(id);
/** Can be used now: owned, or a VIP piece on a VIP account. */
export const canUse = (
  made: readonly FurnitureId[],
  id: FurnitureId,
  vip: boolean,
) => owns(made, id) || (vip && isVip(id));
/**
 * May be kept in the room record: what is owned, and VIP pieces. Whether
 * the account is VIP is known only on screen (usePetVip), which hides VIP
 * pieces from everyone else and puts the starting looks back.
 */
export const mayPlace = (made: readonly FurnitureId[], id: FurnitureId) =>
  owns(made, id) || isVip(id);
/** What can be made, in catalog order. */
export const RECIPES = FURNITURE.filter(
  (piece) => !("free" in piece) && !("vip" in piece),
);
/** What can be made now: the Christmas pieces once a snowflake has come. */
export const recipesFor = (slot: Slot, winter: boolean) =>
  RECIPES.filter(
    (piece) => piece.slot === slot && (winter || !("season" in piece)),
  );

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
/** Snowflakes used on what was made. */
export const snowSpent = (furniture: readonly FurnitureId[]) =>
  spentOn("snow", furniture);
/** Made from a season's limited material (the Christmas pieces). */
export const isSeasonal = (id: FurnitureId) => "season" in furnitureById(id);

export function isFurnitureId(value: unknown): value is FurnitureId {
  return FURNITURE.some((piece) => piece.id === value);
}

export function isSlot(value: unknown): value is Slot {
  return SLOTS.includes(value as Slot);
}

/** The looks a slot can show, starting look first, in catalog order. */
export function looksFor(
  slot: Slot,
  owned: readonly FurnitureId[],
  vip = false,
): LookId[] {
  return [
    DEFAULT_LOOK[slot],
    ...FURNITURE.filter(
      (piece) => piece.slot === slot && canUse(owned, piece.id, vip),
    ).map((piece) => piece.id),
  ];
}

export const lookOf = (slot: Slot, placed: Placed): LookId =>
  placed[slot] ?? DEFAULT_LOOK[slot];

/**
 * What is there without making it: the slot's starting look, free pieces,
 * and VIP pieces on a VIP account.
 */
export const startersFor = (slot: Slot, vip = false): LookId[] =>
  looksFor(slot, [], vip);

/** The slots holding a VIP piece. */
export const vipSlots = (placed: Placed) =>
  SLOTS.filter((slot) => placed[slot] !== undefined && isVip(placed[slot]));
/** Some slot holds a VIP piece. */
export const hasVip = (placed: Placed) => vipSlots(placed).length > 0;
/** The room as anyone but a VIP account sees it: VIP pieces back to the start. */
export function withoutVip(placed: Placed): Placed {
  const shown = { ...placed };
  for (const slot of vipSlots(placed)) delete shown[slot];
  return shown;
}

/** The slot a look belongs to. */
export const slotOfLook = (look: LookId): Slot =>
  SLOTS.find((slot) => DEFAULT_LOOK[slot] === look) ??
  furnitureById(look as FurnitureId).slot;

/** The room slots a set fills; Kkami's outfit and bubble stay as they are. */
export const SET_SLOTS = ["room", "window", "pot", "rug"] as const;
type SetSlot = (typeof SET_SLOTS)[number];

/**
 * Room sets: a wall, window, pot and rug that belong together, put in the
 * room in one go from the item box (I-069). Each piece is in one set at most.
 * Placed all together, a set changes the device: only its colour (tint), or
 * its whole look with a notice (edition).
 */
export const SETS = [
  {
    id: "cabin",
    tint: true,
    pieces: {
      room: "cabinRoom",
      window: "twigWindow",
      pot: "pinePot",
      rug: "braidRug",
    },
  },
  {
    id: "floral",
    tint: true,
    pieces: {
      room: "floralRoom",
      window: "flowerWindow",
      pot: "flowerPot",
      rug: "pinkRug",
    },
  },
  {
    id: "stripe",
    tint: true,
    pieces: {
      room: "stripeRoom",
      window: "stoneWindow",
      pot: "succulentPot",
      rug: "fringeRug",
    },
  },
  // Placed all together, Kkami notices (src/features/pet/speech.ts) and the
  // device turns into the palace edition (I-067).
  {
    id: "palace",
    edition: true,
    pieces: {
      room: "palaceRoom",
      window: "palaceWindow",
      pot: "palacePot",
      rug: "palaceRug",
    },
  },
  // 눈송이로 만드는 크리스마스 세트 (I-074). 눈송이를 받은 뒤에 보임.
  // 다 놓으면 크리스마스 에디션: 게임기가 루돌프가 끄는 선물 썰매가 됨 (I-075)
  {
    id: "christmas",
    season: "winter",
    edition: true,
    pieces: {
      room: "christmasRoom",
      window: "christmasWindow",
      pot: "christmasTree",
      rug: "santaRug",
    },
  },
  // VIP 계정에만 보임 (조각을 만들지 않고 처음부터 가짐). 다 놓으면 VIP 에디션
  {
    id: "stage",
    vip: true,
    edition: true,
    pieces: {
      room: "stageRoom",
      window: "lightstickWindow",
      pot: "standMicPot",
      rug: "centerStageRug",
    },
  },
] as const satisfies readonly {
  id: string;
  vip?: true;
  /** Placed all together, the device takes this set's look (useDeviceEdition). */
  edition?: true;
  /** Placed all together, only the device's colour changes, without a word. */
  tint?: true;
  /** Its pieces take a season's material; shown once it has come. */
  season?: "winter";
  pieces: Record<SetSlot, FurnitureId>;
}[];
export type RoomSet = (typeof SETS)[number];
export type SetId = RoomSet["id"];
/**
 * Sets that change the device: the palace edition (I-067), the Christmas
 * sleigh (I-075) and the VIP edition.
 */
export type EditionId = Extract<RoomSet, { edition: true }>["id"];
/** Sets that only colour the device: cabin, floral and stripe. */
export type TintId = Extract<RoomSet, { tint: true }>["id"];

/**
 * The sets an account sees: the VIP set only on a VIP account, the
 * Christmas set once a snowflake has come.
 */
export const setsFor = (vip: boolean, winter = false) =>
  SETS.filter(
    (set) => (vip || !("vip" in set)) && (winter || !("season" in set)),
  );

export const setById = (id: SetId) => SETS.find((set) => set.id === id)!;

/** A set's pieces, in slot order. */
export const setPieces = (set: RoomSet): FurnitureId[] =>
  SET_SLOTS.map((slot) => set.pieces[slot]);
/** Every piece of the set is in its place. */
export const isSetPlaced = (set: RoomSet, placed: Placed) =>
  SET_SLOTS.every((slot) => placed[slot] === set.pieces[slot]);

export const isPalace = (placed: Placed) =>
  isSetPlaced(setById("palace"), placed);

/** The whole set of this kind in the room, if there is one. */
const placedSet = (placed: Placed, kind: "edition" | "tint") =>
  SETS.find((set) => kind in set && isSetPlaced(set, placed));

/** The device edition the room makes, if a whole edition set is placed. */
export function editionOf(placed: Placed): EditionId | null {
  return (placedSet(placed, "edition")?.id as EditionId | undefined) ?? null;
}

/** The device colour the room makes, if a whole tint set is placed. */
export function tintOf(placed: Placed): TintId | null {
  return (placedSet(placed, "tint")?.id as TintId | undefined) ?? null;
}

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
