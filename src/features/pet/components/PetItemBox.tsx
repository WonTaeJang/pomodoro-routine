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
  SETS,
  SLOTS,
  canMake,
  isSetPlaced,
  setPieces,
  type FurnitureId,
  type Material,
  type MaterialCounts,
  type RoomSet,
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
  StatusIcon,
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
  onApply,
  onApplySet,
  onDecorate,
  stamps,
}: {
  open: boolean;
  onClose: () => void;
  pet: PetProfile;
  /** Paw stamps from finished cycles (I-066). */
  stamps: number;
  onCraft: (furniture: FurnitureId) => void;
  /** Put something made in its place in the room; the box stays open. */
  onApply: (furniture: FurnitureId) => void;
  /** Put a whole set in the room (I-069); the box stays open. */
  onApplySet: (set: RoomSet) => void;
  /** Close the box and start decorating the room. */
  onDecorate: () => void;
}) {
  const t = useTranslations("pet.items");
  const [tab, setTab] = useState<"list" | "craft" | "set">("list");
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
          { value: "set", label: t("set") },
        ]}
      />
      {tab === "list" && (
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
      )}
      {tab === "craft" && (
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
          <ul className={styles.cards}>
            {RECIPES.filter((piece) => piece.slot === slot).map((piece) => (
              <Recipe
                key={piece.id}
                piece={piece}
                left={left}
                made={pet.furniture.includes(piece.id)}
                applied={pet.placed[piece.slot] === piece.id}
                onCraft={onCraft}
                onApply={onApply}
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
      {tab === "set" && (
        <ul className={styles.cards}>
          {SETS.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              made={pet.furniture}
              applied={isSetPlaced(set, pet.placed)}
              onApply={onApplySet}
            />
          ))}
        </ul>
      )}
    </Dialog>
  );
}

/**
 * One thing to make: picture, name, items left / needed and a make button.
 * Once made, only its name and a button to put it in the room.
 */
function Recipe({
  piece: { id, need },
  left,
  made,
  applied,
  onCraft,
  onApply,
}: {
  piece: (typeof RECIPES)[number];
  left: MaterialCounts;
  made: boolean;
  /** In its place in the room now. */
  applied: boolean;
  onCraft: (furniture: FurnitureId) => void;
  onApply: (furniture: FurnitureId) => void;
}) {
  const t = useTranslations("pet.items");
  const ready = canMake(id, left);
  // Made: put it in the room (unless it is there). Not yet: make it.
  const action = made
    ? {
        label: applied ? t("applied") : t("apply"),
        enabled: !applied,
        run: () => onApply(id),
      }
    : {
        label: ready ? t("make") : t("short"),
        enabled: ready,
        run: () => onCraft(id),
      };
  return (
    <li className={styles.recipe}>
      <span className={styles.art}>
        <LookPicture look={id} cell={2} fit={44} />
      </span>
      <span className={styles.recipeText}>
        <strong>{t(`furniture.${id}.name`)}</strong>
        {!made && <Needs need={need} left={left} />}
      </span>
      <Button
        size="sm"
        variant={action.enabled ? "primary" : "secondary"}
        disabled={!action.enabled}
        onClick={action.run}
      >
        {action.label}
      </Button>
    </li>
  );
}

/**
 * One room set: its four pieces, how many are made and, once all are, a
 * button that puts the whole set in the room. Missing pieces show faded.
 */
function SetCard({
  set,
  made,
  applied,
  onApply,
}: {
  set: RoomSet;
  made: readonly FurnitureId[];
  /** The whole set is in the room now. */
  applied: boolean;
  onApply: (set: RoomSet) => void;
}) {
  const t = useTranslations("pet.items");
  const pieces = setPieces(set);
  const missing = pieces.filter((id) => !made.includes(id));
  const have = pieces.length - missing.length;
  return (
    <li className={styles.set}>
      <div className={styles.setHead}>
        <strong>{t(`sets.${set.id}.name`)}</strong>
        <span className={styles.setCount} data-full={missing.length === 0}>
          <span aria-hidden="true">
            {have}/{pieces.length}
          </span>
          <VisuallyHidden>
            {t("setMade", { count: have, total: pieces.length })}
          </VisuallyHidden>
        </span>
      </div>
      <ul className={styles.setPieces}>
        {pieces.map((id) => {
          const absent = missing.includes(id);
          const name = t(`furniture.${id}.name`);
          return (
            <li key={id} className={styles.art} data-missing={absent}>
              <LookPicture look={id} cell={2} fit={44} />
              <VisuallyHidden>
                {absent ? t("setMissing", { name }) : name}
              </VisuallyHidden>
            </li>
          );
        })}
      </ul>
      {/* 궁전 세트만 게임기가 바뀜 (I-067) */}
      {set.id === "palace" && (
        <p className={styles.setEdition}>
          <StatusIcon status="palace" />
          {t("setEdition")}
        </p>
      )}
      {/* 하나라도 없으면 버튼 없이 남은 개수만 */}
      <div className={styles.setFoot}>
        {missing.length > 0 ? (
          <span>{t("setLeft", { count: missing.length })}</span>
        ) : (
          <Button
            size="sm"
            variant={applied ? "secondary" : "primary"}
            disabled={applied}
            onClick={() => onApply(set)}
          >
            {applied ? t("applied") : t("apply")}
          </Button>
        )}
      </div>
    </li>
  );
}

/** Each material: how many are left of how many are needed. */
function Needs({ need, left }: { need: MaterialCounts; left: MaterialCounts }) {
  const t = useTranslations("pet.items");
  return (
    <span className={styles.need}>
      {Object.entries(need).map(([key, count]) => {
        const item = key as Material;
        const have = left[item] ?? 0;
        return (
          <span key={item} data-short={have < count!}>
            <MaterialIcon material={item} />
            <span aria-hidden="true">
              {have}/{count}
            </span>
            <VisuallyHidden>
              {t("needLabel", { name: t(`${item}.name`), have, need: count! })}
            </VisuallyHidden>
          </span>
        );
      })}
    </span>
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
