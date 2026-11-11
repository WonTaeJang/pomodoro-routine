"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { PixelHeartIcon } from "@/components/icons";
import { useToday } from "@/lib/useNow";
import { useStoresReady } from "@/lib/useHydrateStores";
import {
  affinityDay,
  affinityProgress,
  AFFINITY_PER_PAT,
  AFFINITY_PER_SNACK,
  DAILY_AFFINITY_PATS,
} from "../affinity";
import { petStore, usePetStore } from "../store";
import styles from "./PetAffinity.module.scss";

const LEVEL_NOTICE_MS = 3500;

export function PetAffinity() {
  const t = useTranslations("pet.affinity");
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
  const progress = affinityProgress(affinity?.points ?? 0);
  const earned =
    affinity && today !== null
      ? (affinity.rewardedPats[affinityDay(today)] ?? 0) * AFFINITY_PER_PAT
      : 0;

  return (
    <div className={styles.affinity}>
      <details>
        <summary className={styles.summary}>
          <span>
            <PixelHeartIcon size={14} />
            {affinity ? t("level", { level: progress.level }) : "—"}
          </span>
          <progress
            className={styles.bar}
            value={progress.value}
            max={progress.max}
            aria-label={t("label")}
            aria-valuetext={
              affinity
                ? t("progress", {
                    level: progress.level,
                    points: affinity.points,
                  })
                : t("loading")
            }
          />
        </summary>
        {affinity && (
          <div className={styles.detail}>
            <strong>{t(`stages.${progress.level}`)}</strong>
            <span>
              {progress.next === null
                ? t("max", { points: affinity.points })
                : t("points", { points: affinity.points, next: progress.next })}
            </span>
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
          </div>
        )}
      </details>
      <div role="status" aria-live="polite" className={styles.notice}>
        {leveledUp !== null && t("levelUp", { level: leveledUp })}
      </div>
    </div>
  );
}
