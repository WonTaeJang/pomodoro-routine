import { describe, expect, it } from "vitest";
import {
  affinityDay,
  affinityProgress,
  createAffinity,
  isAffinity,
  rewardPats,
} from "./affinity";
import { createPetProfile } from "./profile";
import { decodePet, PetStorageError } from "./repository";

describe("친밀도 규칙", () => {
  it.each([
    [0, 1],
    [19, 1],
    [20, 2],
    [59, 2],
    [60, 3],
    [139, 3],
    [140, 4],
    [299, 4],
    [300, 5],
    [1000, 5],
  ])("%i점의 단계는 %i", (points, level) => {
    const progress = affinityProgress(points);
    expect(progress.level).toBe(level);
    expect(progress.value).toBeGreaterThanOrEqual(0);
    expect(progress.value).toBeLessThanOrEqual(progress.max);
  });

  it("첫 5회만 적립하며 다음 날에도 이전 점수는 유지", () => {
    const first = rewardPats(createAffinity(), 7, "2026-11-11");
    expect(first.points).toBe(10);
    expect(rewardPats(first, 100, "2026-11-11")).toBe(first);
    const later = rewardPats(first, 1, "2026-12-01");
    expect(later.points).toBe(12);
    expect(later.rewardedPats["2026-11-11"]).toBe(5);
  });

  it("기기 로컬 자정 기준으로 날짜가 바뀜", () => {
    expect(affinityDay(new Date(2026, 10, 11, 23, 59, 59).getTime())).toBe(
      "2026-11-11",
    );
    expect(affinityDay(new Date(2026, 10, 12, 0, 0, 0).getTime())).toBe(
      "2026-11-12",
    );
  });

  it("뒤늦게 저장된 과거 날짜도 기존 한도 안에서만 적립", () => {
    let affinity = rewardPats(createAffinity(), 4, "2026-11-11");
    affinity = rewardPats(affinity, 5, "2026-11-12");
    affinity = rewardPats(affinity, 10, "2026-11-11");
    expect(affinity.points).toBe(20);
    expect(isAffinity(affinity)).toBe(true);
  });

  it("v1 기록의 ID·누적 쓰담을 유지하고 친밀도는 소급하지 않음", () => {
    const legacy = {
      id: "legacy",
      createdAt: 1,
      updatedAt: 2,
      totalPats: 100,
      lastPettedAt: 2,
    };
    expect(
      decodePet(JSON.stringify({ version: 1, state: { pet: legacy } })),
    ).toEqual({ ...legacy, totalSnacks: 0, affinity: createAffinity() });
  });

  it.each([
    { points: -2, rewardedPats: {} },
    { points: 12, rewardedPats: { "2026-11-11": 6 } },
    { points: 2, rewardedPats: { "2026-02-30": 1 } },
    { points: 20, rewardedPats: { "2026-11-11": 1 } },
    { points: 0, rewardedPats: [] },
  ])("손상된 v2 친밀도를 거부: %j", (affinity) => {
    const pet = { ...createPetProfile("a", 1), affinity };
    expect(() =>
      decodePet(JSON.stringify({ version: 2, state: { pet } })),
    ).toThrow(PetStorageError);
  });

  it("v2 친밀도를 유지하고 간식 0회로 이전", () => {
    const oldPet = {
      id: "old",
      createdAt: 1,
      updatedAt: 2,
      lastPettedAt: 2,
      totalPats: 3,
      affinity: rewardPats(createAffinity(), 3, "2026-11-11"),
    };
    expect(
      decodePet(JSON.stringify({ version: 2, state: { pet: oldPet } })),
    ).toEqual({ ...oldPet, totalSnacks: 0 });
  });

  it.each([-1, 1.5, 3])(
    "v3 간식 수량과 총점 불일치를 거부: %s",
    (totalSnacks) => {
      const pet = {
        ...createPetProfile("a", 1),
        totalSnacks,
        affinity: { points: 6, rewardedPats: {} },
      };
      expect(() =>
        decodePet(JSON.stringify({ version: 3, state: { pet } })),
      ).toThrow(PetStorageError);
    },
  );
});
