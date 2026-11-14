"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { useToday } from "@/lib/useNow";
import { useStoresReady } from "@/lib/useHydrateStores";
import {
  affinityDay,
  affinityHalves,
  affinityProgress,
  AFFINITY_HEARTS,
  AFFINITY_PER_PAT,
  AFFINITY_PER_SNACK,
  DAILY_AFFINITY_PATS,
} from "../affinity";
import { petStore, usePetStore } from "../store";
import { MeterHeart } from "./PetIcons";
import styles from "./PetAffinity.module.scss";

const LEVEL_NOTICE_MS = 3500;

/** Affinity of the current pet, plus the level reached in the last few seconds. */
export function usePetAffinity() {
  const ready = useStoresReady();
  const pet = usePetStore((s) => s.pet);
  const today = useToday();
  const [leveledUp, setLeveledUp] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = petStore.subscribe((next, previous) => {
      if (!next.pet || next.pet.id !== previous.pet?.id) {
        clearTimeout(timer);
        setLeveledUp(null);
        return;
      }
      const before = affinityProgress(previous.pet.affinity.points).level;
      const after = affinityProgress(next.pet.affinity.points).level;
      if (after <= before) return;
      clearTimeout(timer);
      setLeveledUp(after);
      timer = setTimeout(() => setLeveledUp(null), LEVEL_NOTICE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const affinity = ready ? pet?.affinity : undefined;
  const earned =
    affinity && today !== null
      ? (affinity.rewardedPats[affinityDay(today)] ?? 0) * AFFINITY_PER_PAT
      : 0;
  return {
    affinity,
    progress: affinityProgress(affinity?.points ?? 0),
    earned,
    leveledUp,
  };
}

type Affinity = ReturnType<typeof usePetAffinity>;

/** Level and heart meter in the screen header; opens the explanation. */
export function PetHearts({
  affinity,
  progress,
  open,
  onToggle,
  controls,
}: Affinity & { open: boolean; onToggle: () => void; controls: string }) {
  const t = useTranslations("pet.affinity");
  const halves = affinity ? affinityHalves(affinity.points) : 0;
  return (
    <button
      type="button"
      className={styles.hearts}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={
        affinity
          ? t("progress", { level: progress.level, points: affinity.points })
          : t("loading")
      }
      onClick={onToggle}
    >
      <b>{affinity ? t("level", { level: progress.level }) : "—"}</b>
      {Array.from({ length: AFFINITY_HEARTS }, (_, index) => (
        <MeterHeart
          key={index}
          fill={halves >= (index + 1) * 2 ? 1 : halves > index * 2 ? 0.5 : 0}
        />
      ))}
      {affinity && progress.next === null && (
        <span className={styles.max}>{t("maxBadge")}</span>
      )}
    </button>
  );
}

/** How affinity grows; shown under the device when the hearts are pressed. */
export function PetAffinityDetail({
  id,
  affinity,
  progress,
  earned,
}: Affinity & { id: string }) {
  const t = useTranslations("pet.affinity");
  return (
    <div id={id} className={styles.detail}>
      {affinity && (
        <>
          <strong>
            {t(`stages.${progress.level}`)} ·{" "}
            {progress.next === null
              ? t("max", { points: affinity.points })
              : t("points", { points: affinity.points, next: progress.next })}
          </strong>
          <span>
            {t("today", {
              earned,
              max: DAILY_AFFINITY_PATS * AFFINITY_PER_PAT,
            })}
          </span>
          <span>
            {t("hint", {
              count: DAILY_AFFINITY_PATS,
              points: AFFINITY_PER_PAT,
            })}
          </span>
          <span>{t("snackHint", { points: AFFINITY_PER_SNACK })}</span>
        </>
      )}
    </div>
  );
}
