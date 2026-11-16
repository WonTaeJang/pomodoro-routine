import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PET_SNACK_MS } from "./pet";
import { OUTFIT_FLAGS } from "./outfits";

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

describe("Rive 까미 옷 계약", () => {
  it("옷마다 ViewModel 불리언과 서 있는·누운 노드가 있음", () => {
    const rml = readFileSync(
      new URL("../../assets/kkami-pet/scene.rml", import.meta.url),
      "utf8",
    );
    for (const [look, flag] of Object.entries(OUTFIT_FLAGS)) {
      expect(rml).toContain(`<ViewModelPropertyBoolean name="${flag}"`);
      expect(rml).toContain(`<Node name="${look} upright"`);
      expect(rml).toContain(`<Node name="${look} resting"`);
    }
  });
});
