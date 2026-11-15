import { describe, expect, it } from "vitest";
import { TRIP, TRIP_MS, tripAt } from "./walkTrip";

describe("산책 진행", () => {
  it.each([
    [0, "toSpot", 0],
    [1500, "toSpot", 0.25],
    [TRIP.toSpot, "pick", 0.5],
    [TRIP.toSpot + TRIP.pick - 1, "pick", 0.5],
    [TRIP.toSpot + TRIP.pick + 1000, "toHome", 0.75],
    [TRIP_MS - TRIP.arrive, "arrive", 1],
    [TRIP_MS, "done", 1],
  ])("%ims → %s, 지도 %s", (elapsed, stage, progress) => {
    expect(tripAt(elapsed)).toEqual({ stage, progress });
  });

  it("A→B 3초, 줍기 1.5초, B→C 2초", () => {
    expect(TRIP).toMatchObject({ toSpot: 3000, pick: 1500, toHome: 2000 });
  });
});
