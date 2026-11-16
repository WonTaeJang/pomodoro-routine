import { describe, expect, it } from "vitest";
import {
  RECIPES,
  SLOTS,
  availableItems,
  canMake,
  looksFor,
  type FurnitureId,
} from "./furniture";
import {
  addWalks,
  createPetProfile,
  makeFurniture,
  materialsLeft,
  placeFurniture,
  type PetProfile,
} from "./profile";
import { appendCare, applyPending, careEntry } from "./pendingCare";
import { decodePet, PetStorageError } from "./repository";
import type { ItemId } from "./items";

const withItems = (counts: Partial<Record<ItemId, number>>) =>
  Object.entries(counts).reduce(
    (pet, [item, count]) => addWalks(pet, item as ItemId, count!, 2),
    createPetProfile("a", 1),
  );
const encode = (version: number, pet: object) =>
  JSON.stringify({ version, state: { pet } });

describe("가구 만들기", () => {
  it("재료가 있으면 만들고, 쓴 만큼 남은 아이템이 줄어듦", () => {
    const pet = withItems({ twig: 3, leaf: 1 });
    expect(canMake("twigWindow", availableItems(pet.items, pet.spent))).toBe(
      true,
    );
    const made = makeFurniture(pet, "twigWindow", 9);
    expect(made).toMatchObject({
      items: { twig: 3, leaf: 1 }, // every find still counts
      spent: { twig: 2, leaf: 1 },
      furniture: ["twigWindow"],
      updatedAt: 9,
    });
    expect(availableItems(made.items, made.spent)).toEqual({ twig: 1 });
  });

  it("재료가 모자라거나 이미 만든 것은 그대로 둠", () => {
    const short = withItems({ twig: 1, leaf: 1 });
    expect(makeFurniture(short, "twigWindow", 9)).toBe(short);
    const made = makeFurniture(
      withItems({ twig: 8, leaf: 4 }),
      "twigWindow",
      9,
    );
    expect(makeFurniture(made, "twigWindow", 10)).toBe(made);
  });

  it("벽·바닥과 카펫도 만들어 자리에 놓음", () => {
    const made = makeFurniture(
      makeFurniture(
        withItems({ twig: 2, pinecone: 3, ball: 1 }),
        "cabinRoom",
        3,
      ),
      "fringeRug",
      4,
    );
    expect(made.furniture).toEqual(["cabinRoom", "fringeRug"]);
    const placed = placeFurniture(
      placeFurniture(made, "room", "cabinRoom", 5),
      "rug",
      "fringeRug",
      6,
    );
    expect(placed.placed).toEqual({ room: "cabinRoom", rug: "fringeRug" });
    expect(placeFurniture(placed, "rug", "cabinRoom", 7)).toBe(placed); // wrong slot
    expect(looksFor("room", placed.furniture)).toEqual([
      "plainRoom",
      "cabinRoom",
    ]);
    expect(looksFor("rug", [])).toEqual(["plainRug"]);
  });

  it("자리마다 만들 것이 3개씩(옷은 4개), 재료 조합은 서로 다름", () => {
    for (const slot of SLOTS)
      expect(RECIPES.filter((piece) => piece.slot === slot)).toHaveLength(
        slot === "outfit" ? 4 : 3,
      );
    for (const { need } of RECIPES)
      expect(Object.values(need).reduce((a, b) => a + b, 0)).toBe(3);
    const recipes = RECIPES.map(({ need }) =>
      Object.entries(need)
        .map(([item, count]) => `${item}${count}`)
        .sort()
        .join(),
    );
    expect(new Set(recipes).size).toBe(RECIPES.length);
  });

  it("고를 수 있는 모양은 기본 모양과 만든 것만", () => {
    expect(looksFor("window", [])).toEqual(["plainWindow"]);
    expect(
      looksFor("window", ["stoneWindow", "pinePot", "twigWindow"]),
    ).toEqual(["plainWindow", "twigWindow", "stoneWindow"]);
  });
});

describe("가구 놓기", () => {
  const owner = makeFurniture(
    withItems({ flower: 2, twig: 1 }),
    "flowerWindow",
    5,
  );

  it("만든 가구를 자기 자리에 놓고, null이면 기본 모양으로", () => {
    const placed = placeFurniture(owner, "window", "flowerWindow", 6);
    expect(placed.placed).toEqual({ window: "flowerWindow" });
    expect(placeFurniture(placed, "window", null, 7).placed).toEqual({});
  });

  it("안 만든 가구나 다른 자리 가구는 놓지 않음", () => {
    expect(placeFurniture(owner, "window", "stoneWindow", 6)).toBe(owner);
    expect(placeFurniture(owner, "pot", "flowerWindow" as FurnitureId, 6)).toBe(
      owner,
    );
  });

  it("저장 대기 중에는 자리마다 마지막 선택만 남김", () => {
    let pending = appendCare(
      [],
      careEntry({ kind: "craft", furniture: "flowerWindow" }, 1),
    );
    pending = appendCare(
      pending,
      careEntry({ kind: "craft", furniture: "flowerWindow" }, 2),
    );
    pending = appendCare(
      pending,
      careEntry(
        { kind: "place", slot: "window", furniture: "flowerWindow" },
        3,
      ),
    );
    pending = appendCare(
      pending,
      careEntry({ kind: "place", slot: "window", furniture: null }, 4),
    );
    expect(pending.map((p) => p.kind)).toEqual(["craft", "place"]);
    const pet = applyPending(withItems({ flower: 2, twig: 1 }), pending);
    expect(pet).toMatchObject({ furniture: ["flowerWindow"], placed: {} });
  });
});

describe("까미 옷", () => {
  // Twenty treats reach Lv.3 (60 points), which earns two hearts.
  const atLevel3 = (pet: PetProfile): PetProfile => ({
    ...pet,
    totalSnacks: 20,
    affinity: { ...pet.affinity, points: 60 },
  });

  it("갈색 모자는 만들지 않아도 바로 입음", () => {
    const pet = withItems({ leaf: 1 });
    expect(looksFor("outfit", [])).toEqual(["plainOutfit", "brownHat"]);
    expect(makeFurniture(pet, "brownHat", 3)).toBe(pet);
    expect(placeFurniture(pet, "outfit", "brownHat", 4).placed).toEqual({
      outfit: "brownHat",
    });
  });

  it("옷은 하트 1개와 아이템 2개로 만들고, 하트는 받은 만큼만", () => {
    const pet = atLevel3(withItems({ flower: 2, leaf: 2, stone: 2 }));
    expect(materialsLeft(pet)).toMatchObject({ heart: 2 });
    const two = makeFurniture(
      makeFurniture(pet, "ginghamBib", 3),
      "creamScarf",
      4,
    );
    expect(two.furniture).toEqual(["ginghamBib", "creamScarf"]);
    expect(two.spent).toEqual({ flower: 2, leaf: 2 }); // hearts are not items
    expect(materialsLeft(two).heart).toBeUndefined();
    expect(makeFurniture(two, "checkShirt", 5)).toBe(two); // out of hearts
    expect(
      makeFurniture(withItems({ flower: 2 }), "ginghamBib", 3).furniture,
    ).toEqual([]); // Lv.1 has no heart
  });

  it("v8 기록을 복원하고, 받은 것보다 하트를 많이 쓴 기록은 거부", () => {
    const made = placeFurniture(
      makeFurniture(atLevel3(withItems({ ball: 2 })), "coneCollar", 3),
      "outfit",
      "coneCollar",
      4,
    );
    expect(decodePet(encode(8, made))).toEqual(made);
    const overspent = {
      ...made,
      totalSnacks: 0,
      affinity: { ...made.affinity, points: 0 },
    };
    expect(() => decodePet(encode(8, overspent))).toThrow(PetStorageError);
    const hat = { ...withItems({ leaf: 1 }), furniture: ["brownHat"] };
    expect(() => decodePet(encode(8, hat))).toThrow(PetStorageError); // free, never made
  });
});

describe("가구 저장 형식", () => {
  it("v4 기록은 가구 없이 이전", () => {
    const { spent, furniture, placed, ...v4 } = withItems({ leaf: 2 });
    void [spent, furniture, placed];
    expect(decodePet(encode(4, v4))).toEqual({
      ...withItems({ leaf: 2 }),
      walkDay: null,
      walksOnDay: 0,
    });
  });

  it("v6 기록을 그대로 복원(v7과 같은 모양)", () => {
    const pet = placeFurniture(
      makeFurniture(withItems({ stone: 3, leaf: 1 }), "succulentPot", 3),
      "pot",
      "succulentPot",
      4,
    );
    expect(decodePet(encode(6, pet))).toEqual(pet);
    expect(decodePet(encode(7, pet))).toEqual(pet);
  });

  it("v9 이상은 새 버전이라 건드리지 않음", () => {
    expect(() => decodePet(encode(9, withItems({ leaf: 1 })))).toThrow(
      PetStorageError,
    );
  });

  it.each<Partial<PetProfile>>([
    { spent: { leaf: 3 } }, // spent more than found
    { furniture: ["chair" as FurnitureId] },
    { furniture: ["twigWindow", "twigWindow"] },
    { placed: { window: "twigWindow" } }, // not made
    { furniture: ["pinePot"], placed: { window: "pinePot" as never } },
    { placed: [] as never },
  ])("손상된 가구 기록을 거부: %j", (broken) => {
    const pet = { ...withItems({ leaf: 2 }), ...broken };
    expect(() => decodePet(encode(7, pet))).toThrow(PetStorageError);
  });
});
