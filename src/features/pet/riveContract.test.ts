import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PET_SNACK_MS } from "./pet";

describe("Rive 먹기 시간 계약", () => {
  it("실제 RML 타임라인이 React 종료 시각과 일치", () => {
    const rml = readFileSync(
      new URL("../../assets/kkami-pet/scene.rml", import.meta.url),
      "utf8",
    );
    const timeline = rml.match(
      /<LinearAnimation\b[^>]*\bname="Snacking"[^>]*>/,
    )?.[0];
    expect(timeline).toBeDefined();
    const fps = Number(timeline?.match(/\bfps="(\d+)"/)?.[1]);
    const frames = Number(timeline?.match(/\bduration="(\d+)"/)?.[1]);
    expect(fps).toBeGreaterThan(0);
    expect((frames / fps) * 1000).toBe(PET_SNACK_MS);
    expect(timeline).toContain('loopValue="oneShot"');
  });
});
