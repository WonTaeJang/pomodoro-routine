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
import { MeterHeart, RuleIcon } from "./PetIcons";
import { PetPanel } from "./PetPanel";
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

const BAR_CELLS = 20;

/** How affinity grows: a card under the device, folded by its bar or the hearts. */
export function PetAffinityDetail({
  id,
  affinity,
  progress,
  earned,
  open,
  onToggle,
}: Affinity & { id: string; open: boolean; onToggle: () => void }) {
  const t = useTranslations("pet.affinity");
  const { level, next, value, max } = progress;
  const filled = Math.floor((value / max) * BAR_CELLS);
  const dailyMax = DAILY_AFFINITY_PATS * AFFINITY_PER_PAT;
  return (
    <PetPanel title={t("title")} open={open} onToggle={onToggle} bodyId={id}>
      {affinity && (
        <div className={styles.detailBody}>
          <p className={styles.stage}>
            <strong>
              {t("level", { level })} {t(`stages.${level}`)}
            </strong>
            <small>
              {next === null
                ? t("maxStage")
                : t("nextStage", {
                    name: t(`stages.${(level + 1) as 2 | 3 | 4 | 5}`),
                  })}
            </small>
          </p>
          <span className={styles.bar} aria-hidden="true">
            {Array.from({ length: BAR_CELLS }, (_, cell) => (
              <i key={cell} data-on={cell < filled} />
            ))}
          </span>
          <p className={styles.row}>
            <span>
              {next === null
                ? t("max", { points: affinity.points })
                : t("points", { points: affinity.points, next })}
            </span>
            {next !== null && (
              <span>{t("left", { count: next - affinity.points })}</span>
            )}
          </p>
          <hr className={styles.dots} />
          <p className={styles.today}>
            <strong>{t("todayTitle")}</strong>
            <span aria-hidden="true">
              {Array.from({ length: DAILY_AFFINITY_PATS }, (_, pat) => (
                <MeterHeart
                  key={pat}
                  fill={pat < earned / AFFINITY_PER_PAT ? 1 : 0}
                />
              ))}
            </span>
          </p>
          <p className={styles.row}>
            <span>
              {t("todayRule", {
                count: DAILY_AFFINITY_PATS,
                points: AFFINITY_PER_PAT,
              })}
            </span>
            {earned >= dailyMax ? (
              <span className={styles.done}>{t("todayDone")} ✓</span>
            ) : (
              <span>{t("todayLeft", { earned, max: dailyMax })}</span>
            )}
          </p>
          <ul className={styles.rules}>
            <li>
              <RuleIcon kind="snack" />
              {t("snackHint", { points: AFFINITY_PER_SNACK })}
            </li>
            <li>
              <RuleIcon kind="lock" />
              {t("noDecay")}
            </li>
          </ul>
        </div>
      )}
    </PetPanel>
  );
}
