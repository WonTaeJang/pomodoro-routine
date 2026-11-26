import { describe, expect, it } from "vitest";
import {
  gameState,
  isGameOpen,
  WALK_GAME_COLORS,
  WALK_GAMES,
  walkGameArt,
} from "./walkGames";

describe("산책 놀이 (I-076)", () => {
  const [walk, run] = WALK_GAMES;

  it("n번째 놀이는 친밀도 Lv.n에 열림", () => {
    WALK_GAMES.forEach((game, i) => expect(game.level).toBe(i + 1));
    expect(isGameOpen(run, 1)).toBe(false);
    expect(isGameOpen(run, 2)).toBe(true);
  });

  it("잠김 · 준비 중 · 시작 가능", () => {
    expect(gameState(walk, 1)).toBe("ready");
    expect(gameState(run, 1)).toBe("locked");
    // 장애물 달리기(I-077)는 열려도 아직 만드는 중
    expect(gameState(run, 5)).toBe("soon");
  });

  it("카드 그림은 42×26칸이고 정한 색만 씀", () => {
    for (const game of WALK_GAMES) {
      const rows = walkGameArt(game.id);
      expect(rows).toHaveLength(26);
      for (const row of rows) {
        expect(row).toHaveLength(42);
        for (const cell of row) expect(WALK_GAME_COLORS).toHaveProperty(cell);
      }
    }
  });
});
