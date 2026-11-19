"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Dialog } from "@/components/ui";
import { ITEMS, itemPercent, itemRarity } from "../items";
import { HeartItemIcon, ItemIcon, PawItemIcon } from "./PetIcons";
import styles from "./PetItemBox.module.scss";

/**
 * How to get each item in the box (opened from its ? button). Pictures show
 * in color even before an item is found, so it is clear what to look for.
 */
export function PetItemGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("pet.items");
  return (
    <Dialog open={open} onClose={onClose} title={t("guide.title")}>
      <p className={styles.guideIntro}>{t("guide.intro")}</p>
      <ul className={styles.guide}>
        {ITEMS.map(({ id }) => (
          <GuideRow
            key={id}
            icon={<ItemIcon item={id} size={26} />}
            name={t(`${id}.name`)}
            how={t("guide.walk", {
              chance: itemRarity(id),
              percent: itemPercent(id),
            })}
          />
        ))}
        <GuideRow
          icon={<HeartItemIcon size={20} />}
          name={t("heart.name")}
          how={t("guide.heart")}
        />
        <GuideRow
          icon={<PawItemIcon size={22} />}
          name={t("stamp.name")}
          how={t("guide.stamp")}
        />
      </ul>
    </Dialog>
  );
}

function GuideRow({
  icon,
  name,
  how,
}: {
  icon: ReactNode;
  name: string;
  how: string;
}) {
  return (
    <li className={styles.guideRow}>
      <span className={styles.guideIcon}>{icon}</span>
      <span>
        <strong>{name}</strong>
        <span>{how}</span>
      </span>
    </li>
  );
}
