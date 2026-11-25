"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Dialog } from "@/components/ui";
import { ITEMS, itemPercent, itemRarity } from "../items";
import { GIFT_EACH, SNOW_EACH } from "../profile";
import {
  BoxIcon,
  HeartItemIcon,
  ItemIcon,
  PawItemIcon,
  SnowflakeIcon,
} from "./PetIcons";
import styles from "./PetItemBox.module.scss";

/**
 * How to get each item in the box (opened from its ? button). Pictures show
 * in color even before an item is found, so it is clear what to look for.
 */
export function PetItemGuide({
  open,
  onClose,
  vip,
}: {
  open: boolean;
  onClose: () => void;
  /** VIP accounts also see the daily gift box (I-070). */
  vip: boolean;
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
        {/* 11~2월에만 오는 눈송이 상자 (I-074) */}
        <GuideRow
          icon={<SnowflakeIcon size={22} />}
          name={t("snow.name")}
          how={t("guide.snow", { count: SNOW_EACH })}
        />
        {vip && (
          <GuideRow
            icon={<BoxIcon box="gift" size={22} />}
            name={t("giftName")}
            how={t("guide.gift", { count: GIFT_EACH, kinds: ITEMS.length })}
          />
        )}
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
