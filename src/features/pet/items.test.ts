import { describe, expect, it } from "vitest";
import { isItemCounts, ITEMS, pickItem, totalItems } from "./items";
import { addWalks, createPetProfile, seeItems } from "./profile";
import { decodePet, PetStorageError } from "./repository";

describe("산책 아이템", () => {
  it.each([
    [0, "leaf"],
    [0.2499, "leaf"],
    [0.25, "twig"],
    [0.5, "stone"],
    [0.7, "pinecone"],
    [0.82, "flower"],
    [0.94, "ball"],
    [0.9999, "ball"],
  ])("확률 %s → %s", (roll, item) => {
    expect(pickItem(() => roll)).toBe(item);
  });

  it("6종의 가중치 합은 100이고 공이 가장 드묾", () => {
    expect(ITEMS).toHaveLength(6);
    expect(ITEMS.reduce((sum, item) => sum + item.weight, 0)).toBe(100);
    expect(Math.min(...ITEMS.map((item) => item.weight))).toBe(6);
  });

  it("보유 수량은 알려진 아이템의 양의 정수만 허용", () => {
    expect(isItemCounts({ leaf: 2, ball: 1 })).toBe(true);
    expect(isItemCounts({})).toBe(true);
    for (const bad of [{ shoe: 1 }, { leaf: 0 }, { leaf: 1.5 }, [], null])
      expect(isItemCounts(bad)).toBe(false);
    expect(totalItems({ leaf: 2, ball: 1 })).toBe(3);
  });

  it("산책마다 아이템 하나, 확인 표시는 찾은 수를 넘지 않고 되돌아가지 않음", () => {
    let pet = createPetProfile("a", 1);
    pet = addWalks(pet, "leaf", 2, 5);
    pet = addWalks(pet, "ball", 1, 6);
    expect(pet).toMatchObject({
      walks: 3,
      items: { leaf: 2, ball: 1 },
      updatedAt: 6,
    });
    expect(seeItems(pet, 99).itemsSeen).toBe(3);
    const seen = seeItems(pet, 2);
    expect(seeItems(seen, 1)).toBe(seen);
  });
});

describe("아이템 저장 형식", () => {
  const encode = (version: number, pet: object) =>
    JSON.stringify({ version, state: { pet } });

  it("v3 기록은 산책 0번·빈 상자로 이전", () => {
    const { walks, items, itemsSeen, ...v3 } = createPetProfile("old", 1);
    void walks;
    void items;
    void itemsSeen;
    expect(decodePet(encode(3, v3))).toEqual(createPetProfile("old", 1));
  });

  it("v4 기록을 그대로 복원", () => {
    const pet = {
      ...addWalks(createPetProfile("a", 1), "pinecone", 2, 3),
      itemsSeen: 1,
    };
    expect(decodePet(encode(4, pet))).toEqual(pet);
  });

  it.each([
    { walks: 1, items: {}, itemsSeen: 0 }, // walk without its item
    { walks: 1, items: { shoe: 1 }, itemsSeen: 0 },
    { walks: 1, items: { leaf: 1 }, itemsSeen: 2 },
    { walks: -1, items: {}, itemsSeen: 0 },
  ])("손상된 v4 산책 기록을 거부: %j", (broken) => {
    const pet = { ...createPetProfile("a", 1), ...broken };
    expect(() => decodePet(encode(4, pet))).toThrow(PetStorageError);
  });
});
