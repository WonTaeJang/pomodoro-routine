import { describe, expect, it } from "vitest";
import {
  FURNITURE,
  availableItems,
  canMake,
  looksFor,
  type FurnitureId,
} from "./furniture";
import {
  addWalks,
  createPetProfile,
  makeFurniture,
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
    const pet = withItems({ twig: 5, leaf: 2 });
    expect(canMake("twigWindow", availableItems(pet.items, pet.spent))).toBe(
      true,
    );
    const made = makeFurniture(pet, "twigWindow", 9);
    expect(made).toMatchObject({
      items: { twig: 5, leaf: 2 }, // every find still counts
      spent: { twig: 4, leaf: 2 },
      furniture: ["twigWindow"],
      updatedAt: 9,
    });
    expect(availableItems(made.items, made.spent)).toEqual({ twig: 1 });
  });

  it("재료가 모자라거나 이미 만든 것은 그대로 둠", () => {
    const short = withItems({ twig: 3, leaf: 2 });
    expect(makeFurniture(short, "twigWindow", 9)).toBe(short);
    const made = makeFurniture(
      withItems({ twig: 8, leaf: 4 }),
      "twigWindow",
      9,
    );
    expect(makeFurniture(made, "twigWindow", 10)).toBe(made);
  });

  it("고를 수 있는 모양은 기본 모양과 만든 것만", () => {
    expect(looksFor("window", [])).toEqual(["plainWindow"]);
    expect(
      looksFor("window", ["stoneWindow", "pinePot", "twigWindow"]),
    ).toEqual(["plainWindow", "twigWindow", "stoneWindow"]);
  });

  it("레시피는 자리마다 3개", () => {
    for (const slot of ["window", "pot"])
      expect(FURNITURE.filter((piece) => piece.slot === slot)).toHaveLength(3);
  });
});

describe("가구 놓기", () => {
  const owner = makeFurniture(
    withItems({ flower: 3, twig: 2 }),
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
    const pet = applyPending(withItems({ flower: 3, twig: 2 }), pending);
    expect(pet).toMatchObject({ furniture: ["flowerWindow"], placed: {} });
  });
});

describe("가구 저장 형식", () => {
  it("v4 기록은 가구 없이 이전", () => {
    const { spent, furniture, placed, ...v4 } = withItems({ leaf: 2 });
    void [spent, furniture, placed];
    expect(decodePet(encode(4, v4))).toEqual(withItems({ leaf: 2 }));
  });

  it("v5 기록을 그대로 복원", () => {
    const pet = placeFurniture(
      makeFurniture(withItems({ stone: 5, leaf: 1 }), "succulentPot", 3),
      "pot",
      "succulentPot",
      4,
    );
    expect(decodePet(encode(5, pet))).toEqual(pet);
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
    expect(() => decodePet(encode(5, pet))).toThrow(PetStorageError);
  });
});
