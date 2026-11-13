import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  WALK_FPS,
  WALK_SECONDS,
  PATH_SPEED,
  LEG_ROOT,
  LEGS,
  footAt,
  deformBand,
} from "../../../scripts/walk-cycle.mjs";

describe("산책 발 디딤과 반복 연결", () => {
  it("디딘 발과 바닥의 이동량이 같고 발바닥 높이는 유지됨", () => {
    const leg = LEGS[3];
    const sole = {
      x: leg.foot,
      y: -2.56,
      width: 12,
      height: 2.56,
      color: "292A30",
    };
    for (let frame = 0; frame < 8; frame++) {
      const first = deformBand(sole, leg, frame / WALK_FPS);
      const next = deformBand(sole, leg, (frame + 1) / WALK_FPS);
      expect(next.x - first.x).toBeCloseTo(-PATH_SPEED / WALK_FPS);
      expect(first.y + first.height).toBeCloseTo(0);
      expect(next.y + next.height).toBeCloseTo(0);
    }
  });

  it("반복 경계와 착지 전후 위치·속도가 이어짐", () => {
    for (const leg of LEGS) {
      expect(footAt(0, leg.phase)).toEqual(footAt(WALK_SECONDS, leg.phase));
    }
    const epsilon = 0.00001;
    for (const boundary of [0.6, 1]) {
      const before = footAt(boundary - epsilon);
      const after = footAt(boundary + epsilon);
      expect((after.x - before.x) / (2 * epsilon)).toBeCloseTo(-PATH_SPEED, 1);
      expect(Math.abs(after.y - before.y)).toBeLessThan(0.001);
    }
  });

  it("매 순간 두 발 이상 지지하고 든 발도 지면 아래로 내려가지 않음", () => {
    for (let step = 0; step < 1000; step++) {
      const feet = LEGS.map((leg) => footAt(step / 1000, leg.phase));
      expect(feet.filter((foot) => foot.planted).length).toBeGreaterThanOrEqual(
        2,
      );
      feet.forEach((foot) => expect(foot.y).toBeLessThanOrEqual(0));
    }
    const root = { x: 0, y: LEG_ROOT, width: 12, height: 2.56 };
    for (const leg of LEGS) {
      expect(deformBand(root, leg, 0.8).y).toBe(LEG_ROOT);
    }
  });

  it("실제 Rive의 발·바닥 프레임 간격과 이동 속도가 일치", () => {
    const rml = readFileSync(
      new URL("../../assets/kkami-walk/scene.rml", import.meta.url),
      "utf8",
    );
    const walk = rml.match(/<LinearAnimation\b[^>]*name="Walking"[^>]*>/)?.[0];
    const landscape = rml.match(
      /<LinearAnimation\b[^>]*name="Landscape"[^>]*>[\s\S]*?<\/LinearAnimation>/,
    )?.[0];
    expect(Number(walk?.match(/fps="(\d+)"/)?.[1])).toBe(WALK_FPS);
    expect(Number(landscape?.match(/fps="(\d+)"/)?.[1])).toBe(WALK_FPS);
    const path = landscape?.match(
      /<KeyedObject objectId="0:31">([\s\S]*?)<\/KeyedObject>/,
    )?.[1];
    const keys = [
      ...(path ?? "").matchAll(
        /<KeyFrameDouble frame="(\d+)" value="(-?\d+)"/g,
      ),
    ];
    const last = keys.at(-1);
    expect(last).toBeDefined();
    expect(-Number(last?.[2]) / (Number(last?.[1]) / WALK_FPS)).toBe(
      PATH_SPEED,
    );
    // Both layers wait through the same preparation state before their first step.
    for (const id of [12, 15]) {
      expect(rml).toContain(`animationId="0:52" id="0:${id}"><StateTransition`);
    }
    expect(rml.match(/enableExitTime="true" exitTime="100"/g)).toHaveLength(2);
    expect(rml).not.toContain('<KeyedObject objectId="0:25">');
  });
});
