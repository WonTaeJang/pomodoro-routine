"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "use-intl";
import { DAILY_WALKS } from "../profile";
import { gameState, WALK_GAMES } from "../walkGames";
import { LockIcon, WalkGameArt } from "./PetIcons";
import { PickDots } from "./PetDecorate";
import { PetPad } from "./PetPad";
import { stopCareKey } from "./stopCareKey";
import styles from "./PetPlayground.module.scss";

// 산책 놀이 고르기 (I-076): 산책하기를 누르면 방 위에 놀이 목록이 뜸.
// 고른 놀이는 포인트 색 테두리와 화살표, 잠긴 놀이는 흑백 그림에 자물쇠와 "Lv.N에 열려요"

/** The games in a list over the room; tapping one picks it, again starts it. */
export function WalkMenu({
  index,
  level,
  walksLeft,
  onPick,
}: {
  index: number;
  level: number;
  walksLeft: number;
  onPick: (index: number) => void;
}) {
  const t = useTranslations("pet.walkMenu");
  return (
    <div className={styles.walkMenu}>
      <h2 className={styles.walkMenuTitle}>{t("title")}</h2>
      <ul className={styles.walkGames}>
        {WALK_GAMES.map((game, i) => {
          const state = gameState(game, level);
          return (
            <li key={game.id}>
              <button
                type="button"
                className={styles.walkGame}
                data-selected={i === index}
                data-state={state}
                aria-current={i === index || undefined}
                onClick={() => onPick(i)}
                onKeyDown={stopCareKey}
              >
                <span className={styles.walkGameArt} aria-hidden="true">
                  <span className={styles.walkGameNumber}>{i + 1}</span>
                  <WalkGameArt game={game.id} />
                  {state === "locked" && (
                    <span className={styles.walkGameLock}>
                      <LockIcon />
                    </span>
                  )}
                </span>
                <span className={styles.walkGameText}>
                  <span className={styles.walkGameName}>
                    {t(`games.${game.id}.name`)}
                  </span>
                  <span className={styles.walkGameDescription}>
                    {t(`games.${game.id}.description`)}
                  </span>
                  <span className={styles.walkGameLevel}>
                    {state === "locked"
                      ? t("unlockAt", { level: game.level })
                      : state === "soon"
                        ? t("soon")
                        : t("level", { level: game.level })}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className={styles.walkMenuFoot}>
        {t("left", { count: walksLeft, total: DAILY_WALKS })}
      </p>
    </div>
  );
}

/** In the header: the game in focus and a dot per game. */
export function WalkMenuPick({ index }: { index: number }) {
  const t = useTranslations("pet.walkMenu");
  const total = WALK_GAMES.length;
  return (
    <span className={styles.pick}>
      <PickDots
        total={total}
        index={index}
        position={t("position", { index: index + 1, total })}
      />
    </span>
  );
}

/** The four keys while picking: ◀ ▶ move, ✓ start, ✕ back home. */
export function WalkMenuPads({
  index,
  level,
  onPrev,
  onNext,
  onConfirm,
  onBack,
}: {
  index: number;
  level: number;
  onPrev: () => void;
  onNext: () => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("pet.walkMenu");
  const state = gameState(WALK_GAMES[index], level);
  // Start on ✓, as decorating does.
  const ok = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ok.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <>
      <PetPad kind="prev" label={t("prev")} onClick={onPrev} disabled={false} />
      <PetPad kind="next" label={t("next")} onClick={onNext} disabled={false} />
      <PetPad
        ref={ok}
        kind="ok"
        label={t(
          state === "locked" ? "locked" : state === "soon" ? "soon" : "start",
        )}
        // A locked game, or one not made yet, only says so in the header.
        resting={state !== "ready"}
        onClick={onConfirm}
        disabled={false}
      />
      <PetPad
        kind="cancel"
        label={t("back")}
        onClick={onBack}
        disabled={false}
      />
    </>
  );
}
