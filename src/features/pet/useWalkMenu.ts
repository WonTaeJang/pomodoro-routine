"use client";

import { useState } from "react";
import { useMoment } from "./useMoment";
import { gameState, WALK_GAMES, type WalkGameId } from "./walkGames";

/** How long the header says a game is locked or not made yet. */
const NOTICE_MS = 2500;

/** Why ✓ did not start: the game opens at `level`, or is not made yet. */
export type WalkMenuNotice = { kind: "locked" | "soon"; level: number };

/**
 * Picking a walk game inside the device (I-076): ◀ ▶ move, ✓ starts, ✕ goes
 * back; tapping a card picks it, tapping it again starts it. A locked game or
 * one not made yet only says so in the header.
 */
export function useWalkMenu({
  level,
  onStart,
}: {
  level: number;
  onStart: (game: WalkGameId) => void;
}) {
  // Closing keeps the card, so the list can stay drawn until the game shows.
  const [menu, setMenu] = useState({ open: false, at: 0 });
  const index = menu.open ? menu.at : null;
  const notice = useMoment<WalkMenuNotice>(NOTICE_MS);
  const count = WALK_GAMES.length;
  const move = (step: number) =>
    setMenu(({ open, at }) => ({ open, at: (at + step + count) % count }));
  const close = () => setMenu(({ at }) => ({ open: false, at }));

  function confirm(at = index) {
    if (at === null) return;
    const game = WALK_GAMES[at];
    const state = gameState(game, level);
    if (state !== "ready") notice.show({ kind: state, level: game.level });
    else {
      close();
      onStart(game.id);
    }
  }

  return {
    /** The card in focus, or null when the menu is closed. */
    index,
    /** The last card in focus, open or not. */
    lastIndex: menu.at,
    notice: notice.value,
    open: () => setMenu({ open: true, at: 0 }),
    close,
    prev: () => move(-1),
    next: () => move(1),
    confirm: () => confirm(),
    pick: (at: number) =>
      at === index ? confirm(at) : setMenu({ open: true, at }),
  };
}
