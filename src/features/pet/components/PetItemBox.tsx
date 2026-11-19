"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { HelpIcon } from "@/components/icons";
import {
  Button,
  Dialog,
  IconButton,
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
import {
  HeartItemIcon,
  ItemIcon,
  MaterialIcon,
  PawItemIcon,
  SlotIcon,
} from "./PetIcons";
import { LookPicture } from "./PetRoomArt";
import { PetItemGuide } from "./PetItemGuide";
import styles from "./PetItemBox.module.scss";

/** Items found on walks, and furniture to make from them. */
export function PetItemBox({
  open,
  onClose,
  pet,
  onCraft,
  onDecorate,
  stamps,
}: {
  open: boolean;
  onClose: () => void;
  pet: PetProfile;
  /** Paw stamps from finished cycles (I-066). */
  stamps: number;
  onCraft: (furniture: FurnitureId) => void;
  /** Close the box and start decorating the room. */
  onDecorate: () => void;
}) {
  const t = useTranslations("pet.items");
  const [tab, setTab] = useState<"list" | "craft">("list");
  const [slot, setSlot] = useState<Slot>(SLOTS[0]);
  const [guideOpen, setGuideOpen] = useState(false);
  const left = materialsLeft(pet, stamps);
  const heartsEarned = levelHearts(pet.affinity.points) > 0;
  return (
    <Dialog
      open={open}
      onClose={() => {
        setGuideOpen(false);
        onClose();
      }}
      title={t("title")}
      titleAction={
        <IconButton
          label={t("guide.button")}
          icon={<HelpIcon />}
          size="sm"
          onClick={() => setGuideOpen(true)}
        />
      }
    >
      {/* 상자가 닫히면 함께 닫힘 */}
      <PetItemGuide
        open={open && guideOpen}
        onClose={() => setGuideOpen(false)}
      />
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
          {/* 한 사이클을 마치면 받음 (I-066). 받는 방법을 알 수 있게 이름은 처음부터 보임 */}
          <BoxSlot
            icon={<PawItemIcon size={24} unknown={stamps === 0} />}
            name={t("stamp.name")}
            count={
              stamps > 0
                ? t("count", { count: left.stamp ?? 0 })
                : t("stampLocked")
            }
            found={stamps > 0}
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
                <MaterialIcon material={item} />
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
  found = name !== null,
}: {
  icon: ReactNode;
  /** null until found. */
  name: string | null;
  count: string;
  /** Not got yet, even though its name shows. */
  found?: boolean;
}) {
  const t = useTranslations("pet.items");
  return (
    <li className={styles.slot} data-found={found}>
      <span className={styles.icon}>{icon}</span>
      <strong>{name ?? t("unknown")}</strong>
      <span>{count}</span>
    </li>
  );
}
