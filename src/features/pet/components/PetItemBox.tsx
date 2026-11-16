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
import { ITEMS, type ItemCounts, type ItemId } from "../items";
import {
  FURNITURE,
  SLOTS,
  availableItems,
  canMake,
  type FurnitureId,
  type Slot,
} from "../furniture";
import { levelHearts } from "../affinity";
import type { PetProfile } from "../profile";
import { HeartItemIcon, ItemIcon } from "./PetIcons";
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
  const left = availableItems(pet.items, pet.spent);
  const hearts = levelHearts(pet.affinity.points);
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
            icon={<HeartItemIcon size={23} unknown={hearts === 0} />}
            name={hearts > 0 ? t("heart.name") : null}
            count={
              hearts > 0 ? t("count", { count: hearts }) : t("heartLocked")
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
              label: t(`slots.${value}.name`),
            }))}
          />
          <ul className={styles.recipes}>
            {FURNITURE.filter((piece) => piece.slot === slot).map((piece) => (
              <Recipe
                key={piece.id}
                piece={piece}
                left={left}
                made={pet.furniture.includes(piece.id)}
                onCraft={onCraft}
              />
            ))}
          </ul>
          <Button
            className={styles.decorate}
            variant="secondary"
            disabled={pet.furniture.length === 0}
            aria-describedby={
              pet.furniture.length === 0 ? "decorate-hint" : undefined
            }
            onClick={onDecorate}
          >
            {t("decorate")}
          </Button>
          {pet.furniture.length === 0 && (
            <p id="decorate-hint" className={styles.summary}>
              {t("decorateHint")}
            </p>
          )}
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
  piece: (typeof FURNITURE)[number];
  left: ItemCounts;
  made: boolean;
  onCraft: (furniture: FurnitureId) => void;
}) {
  const t = useTranslations("pet.items");
  const ready = canMake(id, left);
  return (
    <li className={styles.recipe}>
      <span className={styles.art}>
        <LookPicture look={id} cell={2} />
      </span>
      <span className={styles.recipeText}>
        <strong>{t(`furniture.${id}.name`)}</strong>
        <span className={styles.need}>
          {Object.entries(need).map(([key, count]) => {
            const item = key as ItemId;
            const have = left[item] ?? 0;
            return (
              <span key={item} data-short={!made && have < count}>
                <ItemIcon item={item} size={12} />
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
        <span className={styles.made}>{t("made")} ✓</span>
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
