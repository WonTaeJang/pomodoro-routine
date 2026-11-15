"use client";

import { useTranslations } from "use-intl";
import type { ItemId } from "../items";
import { ItemIcon, MapIcon, WalkerIcon } from "./PetIcons";
import styles from "./PetTrip.module.scss";

/** Home (A) → the find (B) → home (C), with Kkami's place along the way. */
export function PetWalkMap({
  progress,
  item,
}: {
  progress: number;
  item: ItemId | null;
}) {
  return (
    <span className={styles.map} aria-hidden="true">
      <MapIcon stop="home" />
      <span className={styles.leg} data-done={progress >= 0.5} />
      <span className={styles.find}>
        {item ? <ItemIcon item={item} size={12} /> : <MapIcon stop="find" />}
      </span>
      <span className={styles.leg} data-done={progress >= 1} />
      <MapIcon stop="home" />
      <span
        className={styles.walker}
        style={{ left: `calc(${progress * 100}% - ${progress * 11}px)` }}
      >
        <WalkerIcon />
      </span>
    </span>
  );
}

/** "Found a pinecone!" over the screen while Kkami carries it home. */
export function PetFoundCard({ item }: { item: ItemId }) {
  const t = useTranslations("pet");
  return (
    <div className={styles.card} role="status">
      <ItemIcon item={item} size={28} />
      <div>
        <strong>
          {t("walk.found", { object: t(`items.${item}.object`) })}
        </strong>
        <span>{t("walk.foundBox")}</span>
      </div>
    </div>
  );
}
