import { describe, expect, it } from "vitest";
import { careEntry, type CareInput } from "@/features/pet/pendingCare";
import { createPetProfile } from "@/features/pet/profile";
import { PetStorageError } from "@/features/pet/repository";
import { fromHistoryRow, fromPetGameRow, toHistoryRow } from "./petRows";

const ID = "6f1c2b9e-1d2a-4c3b-8e4f-5a6b7c8d9e0f";
const at = Date.parse("2026-11-18T09:00:00.123Z");

describe("pet history rows", () => {
  it.each<CareInput>([
    { kind: "pats" },
    { kind: "snacks" },
    { kind: "seen", count: 3 },
    { kind: "walks", item: "leaf" },
    { kind: "craft", furniture: "twigWindow" },
    { kind: "place", slot: "window", furniture: "twigWindow" },
    { kind: "place", slot: "rug", furniture: null },
  ])("goes up and comes back the same: %o", (input) => {
    const care = careEntry(input, at);
    const row = toHistoryRow({ ...care, id: ID, petId: "pet-1" }, "user-1");
    expect(row).toMatchObject({ user_id: "user-1", id: ID, pet_id: "pet-1" });
    expect(
      fromHistoryRow({
        ...row!,
        created_at: "2026-11-18T09:00:01.000001+00:00",
      }),
    ).toEqual(care);
  });

  it("only fills the columns its kind uses", () => {
    const care = careEntry({ kind: "walks", item: "leaf" }, at);
    expect(
      toHistoryRow({ ...care, id: ID, petId: "pet-1" }, "user-1"),
    ).toMatchObject({ item: "leaf", furniture: null, slot: null });
  });

  it("does not send an id the table cannot hold", () => {
    const care = careEntry({ kind: "pats" }, at);
    expect(toHistoryRow({ ...care, id: "x", petId: "p" }, "u")).toBeNull();
  });

  it("skips a kind this app does not know", () => {
    const row = toHistoryRow(
      { ...careEntry({ kind: "pats" }, at), id: ID, petId: "pet-1" },
      "user-1",
    )!;
    expect(
      fromHistoryRow({ ...row, kind: "dance", created_at: row.at }),
    ).toBeNull();
  });
});

describe("pet game row", () => {
  it("reads the account Kkami and refuses a newer format", () => {
    const pet = createPetProfile("pet-1", at);
    expect(fromPetGameRow({ pet, version: 9, history_until: null })).toEqual(
      pet,
    );
    expect(() =>
      fromPetGameRow({ pet, version: 99, history_until: null }),
    ).toThrow(PetStorageError);
  });
});
