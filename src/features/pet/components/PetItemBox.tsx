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
  canUse,
  isSetPlaced,
  isVip,
  lookOf,
  setPieces,
  setsFor,
  startersFor,
  type FurnitureId,
  type LookId,
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

const TABS = ["materials", "decor", "sets"] as const;
type Tab = (typeof TABS)[number];

/**
 * The item box: materials found and earned, things to decorate with (given
 * from the start or made from materials), and whole room sets.
 */
export function PetItemBox({
  open,
  onClose,
  pet,
  onCraft,
  onApply,
  onApplySet,
  onDecorate,
  stamps,
  vip,
}: {
  open: boolean;
  onClose: () => void;
  pet: PetProfile;
  /** A VIP account: the idol stage set and bubble show, marked VIP. */
  vip: boolean;
  /** Paw stamps from finished cycles (I-066). */
  stamps: number;
  onCraft: (furniture: FurnitureId) => void;
  /** Put something made or given in its place in the room; the box stays open. */
  onApply: (look: LookId) => void;
  /** Put a whole set in the room (I-069); the box stays open. */
  onApplySet: (set: RoomSet) => void;
  /** Close the box and start decorating the room. */
  onDecorate: () => void;
}) {
  const t = useTranslations("pet.items");
  const [tab, setTab] = useState<Tab>("materials");
  // Kept here so the chosen place stays while looking at another tab.
  const [slot, setSlot] = useState<Slot>(SLOTS[0]);
  const [guideOpen, setGuideOpen] = useState(false);
  const left = materialsLeft(pet, stamps);
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
        options={TABS.map((value) => ({ value, label: t(`tab.${value}`) }))}
      />
      {tab === "materials" && (
        <MaterialsTab pet={pet} left={left} stamps={stamps} />
      )}
      {tab === "decor" && (
        <>
          <DecorTab
            pet={pet}
            vip={vip}
            left={left}
            slot={slot}
            onSlot={setSlot}
            onCraft={onCraft}
            onApply={onApply}
          />
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
      {tab === "sets" && (
        <ul className={styles.cards}>
          {setsFor(vip).map((set) => (
            <SetCard
              key={set.id}
              set={set}
              made={pet.furniture}
              vip={vip}
              applied={isSetPlaced(set, pet.placed)}
              onApply={onApplySet}
            />
          ))}
        </ul>
      )}
    </Dialog>
  );
}

/** What is left of each material: walk items, level hearts and paw stamps. */
function MaterialsTab({
  pet,
  left,
  stamps,
}: {
  pet: PetProfile;
  left: MaterialCounts;
  stamps: number;
}) {
  const t = useTranslations("pet.items");
  const heartsEarned = levelHearts(pet.affinity.points) > 0;
  return (
    <ul className={styles.grid}>
      {ITEMS.map(({ id }) => {
        const found = (pet.items[id] ?? 0) > 0;
        return (
          <BoxSlot
            key={id}
            icon={<ItemIcon item={id} size={30} unknown={!found} />}
            name={found ? t(`${id}.name`) : null}
            count={found ? t("count", { count: left[id] ?? 0 }) : t("notFound")}
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
          stamps > 0 ? t("count", { count: left.stamp ?? 0 }) : t("stampLocked")
        }
        found={stamps > 0}
      />
    </ul>
  );
}

/**
 * One place's looks: what everyone has from the start, then what can be
 * made, each with a button to make it or put it in the room.
 */
function DecorTab({
  pet,
  vip,
  left,
  slot,
  onSlot,
  onCraft,
  onApply,
}: {
  pet: PetProfile;
  vip: boolean;
  left: MaterialCounts;
  slot: Slot;
  onSlot: (slot: Slot) => void;
  onCraft: (furniture: FurnitureId) => void;
  onApply: (look: LookId) => void;
}) {
  const t = useTranslations("pet.items");
  const shown = lookOf(slot, pet.placed);
  return (
    <>
      <SegmentedControl
        className={cx(styles.tabs, styles.slotTabs)}
        label={t("slotTabs")}
        value={slot}
        onChange={onSlot}
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
        {/* 만들 필요 없이 적용만: 처음부터 있는 것(기본 모양·갈색 모자), VIP 계정의 VIP 조각 */}
        {startersFor(slot, vip).map((look) => (
          <LookCard
            key={look}
            look={look}
            action={applyAction(shown === look, () => onApply(look))}
          >
            {isVip(look) ? (
              <VipBadge />
            ) : (
              <span className={styles.starter}>{t("starter")}</span>
            )}
          </LookCard>
        ))}
        {RECIPES.filter((piece) => piece.slot === slot).map((piece) => (
          <Recipe
            key={piece.id}
            piece={piece}
            left={left}
            made={pet.furniture.includes(piece.id)}
            applied={shown === piece.id}
            onCraft={onCraft}
            onApply={onApply}
          />
        ))}
      </ul>
    </>
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
  onApply: (look: LookId) => void;
}) {
  const ready = canMake(id, left);
  // Made: put it in the room (unless it is there). Not yet: make it.
  const action: CardAction = made
    ? applyAction(applied, () => onApply(id))
    : {
        label: ready ? "make" : "short",
        enabled: ready,
        run: () => onCraft(id),
      };
  return (
    <LookCard look={id} action={action}>
      {!made && <Needs need={need} left={left} />}
    </LookCard>
  );
}

type CardAction = {
  label: "apply" | "applied" | "make" | "short";
  enabled: boolean;
  run: () => void;
};
/** Put it in the room, or say it is there already. */
const applyAction = (applied: boolean, run: () => void): CardAction => ({
  label: applied ? "applied" : "apply",
  enabled: !applied,
  run,
});

/** A card in the decor list: picture, name with a line under it, one button. */
function LookCard({
  look,
  action,
  children,
}: {
  look: LookId;
  action: CardAction;
  children?: ReactNode;
}) {
  const t = useTranslations("pet.items");
  return (
    <li className={styles.lookCard}>
      <span className={styles.art}>
        <LookPicture look={look} cell={2} fit={44} />
      </span>
      <span className={styles.lookText}>
        <strong>{t(`furniture.${look}.name`)}</strong>
        {children}
      </span>
      <ActionButton action={action} />
    </li>
  );
}

/** A card's one button: filled when it can be pressed. */
function ActionButton({ action }: { action: CardAction }) {
  const t = useTranslations("pet.items");
  return (
    <Button
      size="sm"
      variant={action.enabled ? "primary" : "secondary"}
      disabled={!action.enabled}
      onClick={action.run}
    >
      {t(action.label)}
    </Button>
  );
}

/**
 * One room set: its four pieces, how many are made and, once all are, a
 * button that puts the whole set in the room. Missing pieces show faded.
 */
function SetCard({
  set,
  made,
  vip,
  applied,
  onApply,
}: {
  set: RoomSet;
  made: readonly FurnitureId[];
  vip: boolean;
  /** The whole set is in the room now. */
  applied: boolean;
  onApply: (set: RoomSet) => void;
}) {
  const t = useTranslations("pet.items");
  const pieces = setPieces(set);
  const missing = pieces.filter((id) => !canUse(made, id, vip));
  const have = pieces.length - missing.length;
  return (
    <li className={styles.set}>
      <div className={styles.setHead}>
        <strong>
          {t(`sets.${set.id}.name`)}
          {"vip" in set && <VipBadge />}
        </strong>
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
      {/* 에디션 세트(궁전 I-067, 아이돌 무대)는 다 놓으면 게임기가 바뀜 */}
      {"edition" in set && (
        <p className={styles.setEdition}>
          <StatusIcon status={set.id} />
          {t(`setEdition.${set.id}`)}
        </p>
      )}
      {/* 하나라도 없으면 버튼 없이 남은 개수만 */}
      <div className={styles.setFoot}>
        {missing.length > 0 ? (
          <span>{t("setLeft", { count: missing.length })}</span>
        ) : (
          <ActionButton action={applyAction(applied, () => onApply(set))} />
        )}
      </div>
    </li>
  );
}

/** Gold "VIP" mark, like the profile's VIP badge. */
function VipBadge() {
  const t = useTranslations("pet.items");
  return <span className={styles.vip}>{t("vip")}</span>;
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
