import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import recordings from "./recordings.json";
import { FOCUS_SOUND_GROUPS, FOCUS_SOUND_IDS, FOCUS_SOUNDS } from "./sounds";

describe("집중 소리 목록", () => {
  it("모든 소리가 창의 묶음에 한 번씩", () => {
    const grouped = FOCUS_SOUND_GROUPS.flatMap((g) => g.ids);
    expect([...grouped].sort()).toEqual([...FOCUS_SOUND_IDS].sort());
  });

  it("녹음 설정(recordings.json)과 앱의 녹음 소리가 같고, 파일이 public/에 있다", () => {
    const recorded = FOCUS_SOUND_IDS.filter(
      (id) => FOCUS_SOUNDS[id].kind === "recording",
    );
    expect(recordings.map((r) => r.id).sort()).toEqual([...recorded].sort());
    for (const id of recorded) {
      const sound = FOCUS_SOUNDS[id];
      if (sound.kind !== "recording") continue;
      expect(existsSync(join("public", sound.src)), sound.src).toBe(true);
    }
  });
});
