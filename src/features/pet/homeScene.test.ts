import { describe, expect, it } from "vitest";
import { PET_SNACK_MS } from "./pet";
import { FURNITURE } from "./furniture";
import { nodeIds } from "./pixel/scene";
import { rasterize } from "./pixel/render";
import { clipMs, override } from "./pixel/timeline";
import { machinePose, startMachine, stepMachine } from "./pixel/machine";
import {
  HOME_CLIPS,
  HOME_INPUTS,
  HOME_MACHINE,
  HOME_SCENE,
  outfitNodeId,
  outfitPose,
  type HomeInput,
} from "./sprites/homeScene";
import { WORN_LOOKS } from "./sprites/outfitCells";

const ids = nodeIds(HOME_SCENE);
const feel = (set: Partial<Record<HomeInput, boolean>>) => ({
  ...HOME_INPUTS,
  isSleeping: false,
  ...set,
});

describe("집 까미 장면", () => {
  it("동작이 움직이는 노드는 모두 장면에 있음", () => {
    for (const clip of Object.values(HOME_CLIPS))
      for (const track of clip.tracks) expect(ids).toContain(track.node);
  });

  it("간식 먹기 동작은 화면의 간식 반응 시간과 같고 한 번만 재생", () => {
    expect(clipMs(HOME_CLIPS.snacking)).toBe(PET_SNACK_MS);
    expect(HOME_CLIPS.snacking.loop).toBe(false);
  });

  it("옷마다 서 있는·누운 노드가 있고, 입은 옷만 보임", () => {
    const worn = FURNITURE.filter((f) => f.slot === "outfit").map((f) => f.id);
    expect([...WORN_LOOKS].sort()).toEqual([...worn].sort());
    for (const look of WORN_LOOKS) {
      expect(ids).toContain(outfitNodeId(look, "upright"));
      expect(ids).toContain(outfitNodeId(look, "resting"));
    }
    const pose = new Map(outfitPose("creamScarf"));
    expect(pose.get(outfitNodeId("creamScarf", "upright"))).toEqual({
      opacity: 1,
    });
    expect(pose.get(outfitNodeId("brownHat", "resting"))).toEqual({
      opacity: 0,
    });
    expect([...new Map(outfitPose("plainOutfit")).values()]).toEqual(
      Array(WORN_LOOKS.length * 2).fill({ opacity: 0 }),
    );
  });

  it("잠든 까미에 옷을 입히면 누운 모습에 보임", () => {
    const asleep = machinePose(HOME_MACHINE, startMachine(HOME_MACHINE));
    const plain = rasterize(HOME_SCENE, asleep);
    const hat = rasterize(HOME_SCENE, override(asleep, outfitPose("brownHat")));
    expect(hat).not.toEqual(plain);
  });
});

describe("집 까미 상태", () => {
  const step = (
    run = startMachine(HOME_MACHINE),
    set = {},
    triggers?: Set<"snackAgain">,
  ) => stepMachine(HOME_MACHINE, run, 16, feel(set), triggers);

  it("자다가 깨우면 놀람, 놀람이 끝나면 대기", () => {
    const asleep = stepMachine(
      HOME_MACHINE,
      startMachine(HOME_MACHINE),
      16,
      HOME_INPUTS,
    );
    expect(asleep.state).toBe("sleeping");
    const startled = step(asleep, { isStartled: true });
    expect(startled.state).toBe("startled");
    expect(step(startled).state).toBe("idle");
  });

  it("쓰다듬으면 기쁨, 간식은 기쁨보다 먼저, 다시 자면 잠", () => {
    const idle = step();
    expect(idle.state).toBe("idle");
    expect(step(idle, { isHappy: true }).state).toBe("happy");
    expect(step(idle, { isHappy: true, isSnacking: true }).state).toBe(
      "snacking",
    );
    expect(step(idle, { isSleeping: true }).state).toBe("sleeping");
  });

  it("간식을 또 주면 처음부터 다시 먹음", () => {
    const eating = stepMachine(
      HOME_MACHINE,
      step(step(), { isHappy: true, isSnacking: true }),
      900,
      feel({ isHappy: true, isSnacking: true }),
    );
    expect(eating).toMatchObject({ state: "snacking", elapsed: 900 });
    const again = step(
      eating,
      { isHappy: true, isSnacking: true },
      new Set(["snackAgain"]),
    );
    expect(again).toMatchObject({ state: "snackingAgain", elapsed: 0 });
    const third = step(
      again,
      { isHappy: true, isSnacking: true },
      new Set(["snackAgain"]),
    );
    expect(third.state).toBe("snacking");
  });
});
