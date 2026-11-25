"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Button, Dialog } from "@/components/ui";
import { cx } from "@/lib/cx";
import { ITEMS } from "../items";
import { GIFT_EACH, type DailyBox } from "../profile";
import { setById, setPieces, type FurnitureId } from "../furniture";
import { BoxIcon, ItemIcon } from "./PetIcons";
import { LookPicture } from "./PetRoomArt";
import { VipBadge } from "./PetItemBox";
import box from "./PetItemBox.module.scss";
import styles from "./PetGiftBox.module.scss";

/**
 * The popup of a daily box in the room (VIP gift I-070, snow I-074): the box
 * shakes and springs open over what it brings. Mounted only while open, so
 * it opens anew each time. With more boxes waiting it says which one it is.
 */
export function DailyBoxDialog({
  title,
  step,
  welcome,
  kind,
  lead,
  cells,
  onClose,
  children,
}: {
  title: string;
  /** "1/2" when boxes are opened one after another. */
  step?: string;
  /** Shown above the box the first time. */
  welcome?: ReactNode;
  kind: DailyBox;
  lead: string;
  cells: { id: string; icon: ReactNode; name: string; add: number }[];
  onClose: () => void;
  /** The buttons. */
  children: ReactNode;
}) {
  return (
    <Dialog open onClose={onClose} title={title}>
      <div className={styles.gift}>
        {step && <span className={styles.step}>{step}</span>}
        {welcome}
        {/* Shakes closed, then opens (at once with reduced motion). */}
        <div className={styles.box} aria-hidden="true">
          <span className={styles.closed}>
            <BoxIcon box={kind} size={60} />
          </span>
          <span className={styles.opened}>
            <BoxIcon box={kind} open size={80} />
          </span>
        </div>
        <p className={styles.lead}>{lead}</p>
        {/* Item box cells, each with what it adds */}
        <ul className={box.grid} data-count={cells.length}>
          {cells.map((cell) => (
            <li key={cell.id} className={cx(box.slot, styles.got)} data-found>
              <b>+{cell.add}</b>
              <span className={box.icon}>{cell.icon}</span>
              <strong>{cell.name}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>{children}</div>
      </div>
    </Dialog>
  );
}

/** The first box's note: a title, the pieces it opens up and a line. */
export function BoxWelcome({
  theme,
  title,
  pieces,
  text,
}: {
  theme: "vip" | "christmas";
  title: ReactNode;
  pieces: readonly FurnitureId[];
  text: string;
}) {
  return (
    <section className={styles.welcome} data-theme={theme}>
      <strong>{title}</strong>
      <ul className={styles.pieces} data-count={pieces.length}>
        {pieces.map((id) => (
          <li key={id}>
            <LookPicture look={id} cell={2} fit={pieces.length > 4 ? 32 : 44} />
          </li>
        ))}
      </ul>
      <p>{text}</p>
    </section>
  );
}

/**
 * The day's VIP gift box (I-070): one of every walk item. The very first one
 * also says the idol stage set is there.
 */
export function PetGiftBox({
  first,
  step,
  onClose,
  onReceive,
}: {
  /** The first gift box: also tell about the idol stage set. */
  first: boolean;
  step?: string;
  onClose: () => void;
  /** Take the items; `toSets` also opens the item box at its sets. */
  onReceive: (toSets: boolean) => void;
}) {
  const t = useTranslations("pet.gift");
  const item = useTranslations("pet.items");
  return (
    <DailyBoxDialog
      title={t("title")}
      step={step}
      welcome={
        first && (
          <BoxWelcome
            theme="vip"
            title={
              <>
                {t("welcome.title")}
                <VipBadge />
              </>
            }
            pieces={setPieces(setById("stage"))}
            text={t("welcome.text")}
          />
        )
      }
      kind="gift"
      lead={t("lead", { count: ITEMS.length })}
      cells={ITEMS.map(({ id }) => ({
        id,
        icon: <ItemIcon item={id} size={30} />,
        name: item(`${id}.name`),
        add: GIFT_EACH,
      }))}
      onClose={onClose}
    >
      {first && (
        <Button variant="secondary" onClick={() => onReceive(true)}>
          {t("toSets")}
        </Button>
      )}
      <Button onClick={() => onReceive(false)}>{t("take")}</Button>
    </DailyBoxDialog>
  );
}
