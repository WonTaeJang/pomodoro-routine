"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import {
  Button,
  Dialog,
  SegmentedControl,
  VisuallyHidden,
} from "@/components/ui";
import { cx } from "@/lib/cx";
import { ITEMS } from "../items";
import {
  RECIPES,
  SLOTS,
  canMake,
  type FurnitureId,
  type Material,
  type MaterialCounts,
  type Slot,
} from "../furniture";
import { levelHearts } from "../affinity";
import { materialsLeft, type PetProfile } from "../profile";
import { HeartItemIcon, ItemIcon, SlotIcon } from "./PetIcons";
import { LookPicture } from "./PetRoomArt";
import styles from "./PetItemBox.module.scss";

/** Items found on walks, and furniture to make from them. */
export function PetItemBox({
  open,
  onClose,
  pet,
  onCraft,
  onDecorate,
}: {
  open: boolean;
  onClose: () => void;
  pet: PetProfile;
  onCraft: (furniture: FurnitureId) => void;
  /** Close the box and start decorating the room. */
  onDecorate: () => void;
}) {
  const t = useTranslations("pet.items");
  const [tab, setTab] = useState<"list" | "craft">("list");
  const [slot, setSlot] = useState<Slot>(SLOTS[0]);
  const left = materialsLeft(pet);
  const heartsEarned = levelHearts(pet.affinity.points) > 0;
  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      <SegmentedControl
        className={styles.tabs}
        label={t("tabs")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "list", label: t("list") },
          { value: "craft", label: t("craft") },
        ]}
      />
      {tab === "list" ? (
        <ul className={styles.grid}>
          {ITEMS.map(({ id }) => {
            const found = (pet.items[id] ?? 0) > 0;
            const count = left[id] ?? 0;
            return (
              <BoxSlot
                key={id}
                icon={<ItemIcon item={id} size={30} unknown={!found} />}
                name={found ? t(`${id}.name`) : null}
                count={found ? t("count", { count }) : t("notFound")}
              />
            );
          })}
          <BoxSlot
            icon={<HeartItemIcon size={23} unknown={!heartsEarned} />}
            name={heartsEarned ? t("heart.name") : null}
            count={
              heartsEarned
                ? t("count", { count: left.heart ?? 0 })
                : t("heartLocked")
            }
          />
        </ul>
      ) : (
        <>
          <SegmentedControl
            className={cx(styles.tabs, styles.slotTabs)}
            label={t("slotTabs")}
            value={slot}
            onChange={setSlot}
            options={SLOTS.map((value) => ({
              value,
              label: (
                <>
                  <SlotIcon slot={value} />
                  <VisuallyHidden>{t(`slots.${value}.name`)}</VisuallyHidden>
                </>
              ),
            }))}
          />
          <ul className={styles.recipes}>
            {RECIPES.filter((piece) => piece.slot === slot).map((piece) => (
              <Recipe
                key={piece.id}
                piece={piece}
                left={left}
                made={pet.furniture.includes(piece.id)}
                onCraft={onCraft}
              />
            ))}
          </ul>
          {/* Always open: everyone has the brown hat to try on. */}
          <Button
            className={styles.decorate}
            variant="secondary"
            onClick={onDecorate}
          >
            {t("decorate")}
          </Button>
        </>
      )}
    </Dialog>
  );
}

/** One thing to make: picture, name, items left / needed, and its button. */
function Recipe({
  piece: { id, need },
  left,
  made,
  onCraft,
}: {
  piece: (typeof RECIPES)[number];
  left: MaterialCounts;
  made: boolean;
  onCraft: (furniture: FurnitureId) => void;
}) {
  const t = useTranslations("pet.items");
  const ready = canMake(id, left);
  return (
    <li className={styles.recipe}>
      <span className={styles.art}>
        <LookPicture look={id} cell={2} fit={44} />
      </span>
      <span className={styles.recipeText}>
        <strong>{t(`furniture.${id}.name`)}</strong>
        <span className={styles.need}>
          {Object.entries(need).map(([key, count]) => {
            const item = key as Material;
            const have = left[item] ?? 0;
            return (
              <span key={item} data-short={!made && have < count}>
                {item === "heart" ? (
                  <HeartItemIcon size={10} />
                ) : (
                  <ItemIcon item={item} size={12} />
                )}
                <span aria-hidden="true">
                  {have}/{count}
                </span>
                <VisuallyHidden>
                  {t("needLabel", {
                    name: t(`${item}.name`),
                    have,
                    need: count,
                  })}
                </VisuallyHidden>
              </span>
            );
          })}
        </span>
      </span>
      {made ? (
        <span className={styles.made}>
          <span aria-hidden="true">✓</span>
          <VisuallyHidden>{t("made")}</VisuallyHidden>
        </span>
      ) : (
        <Button
          size="sm"
          variant={ready ? "primary" : "secondary"}
          disabled={!ready}
          onClick={() => onCraft(id)}
        >
          {ready ? t("make") : t("short")}
        </Button>
      )}
    </li>
  );
}

/** One cell of the item list: an item not found yet shows as "???". */
function BoxSlot({
  icon,
  name,
  count,
}: {
  icon: ReactNode;
  /** null until found. */
  name: string | null;
  count: string;
}) {
  const t = useTranslations("pet.items");
  return (
    <li className={styles.slot} data-found={name !== null}>
      <span className={styles.icon}>{icon}</span>
      <strong>{name ?? t("unknown")}</strong>
      <span>{count}</span>
    </li>
  );
}
