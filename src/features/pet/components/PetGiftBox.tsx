"use client";

import { useTranslations } from "use-intl";
import { Button, Dialog } from "@/components/ui";
import { cx } from "@/lib/cx";
import { ITEMS } from "../items";
import { GIFT_EACH } from "../profile";
import { setById, setPieces } from "../furniture";
import { GiftBoxIcon, ItemIcon } from "./PetIcons";
import { LookPicture } from "./PetRoomArt";
import { VipBadge } from "./PetItemBox";
import box from "./PetItemBox.module.scss";
import styles from "./PetGiftBox.module.scss";

/**
 * The day's VIP gift box, opened (I-070): the box springs open over one of
 * every walk item. The very first one also says the VIP set is there.
 * Mounted only while open, so the box opens anew each time.
 */
export function PetGiftBox({
  first,
  onClose,
  onReceive,
}: {
  /** The first gift box: also tell about the idol stage set. */
  first: boolean;
  onClose: () => void;
  /** Take the items; `toSets` also opens the item box at its sets. */
  onReceive: (toSets: boolean) => void;
}) {
  const t = useTranslations("pet.gift");
  const item = useTranslations("pet.items");
  return (
    <Dialog open onClose={onClose} title={t("title")}>
      <div className={styles.gift}>
        {first && (
          <section className={styles.welcome}>
            <strong>
              {t("welcome.title")}
              <VipBadge />
            </strong>
            <ul className={styles.pieces}>
              {setPieces(setById("stage")).map((id) => (
                <li key={id}>
                  <LookPicture look={id} cell={2} fit={44} />
                </li>
              ))}
            </ul>
            <p>{t("welcome.text")}</p>
          </section>
        )}
        {/* Shakes closed, then opens (at once with reduced motion). */}
        <div className={styles.box} aria-hidden="true">
          <span className={styles.closed}>
            <GiftBoxIcon size={60} />
          </span>
          <span className={styles.opened}>
            <GiftBoxIcon open size={80} />
          </span>
        </div>
        <p className={styles.lead}>{t("lead", { count: ITEMS.length })}</p>
        {/* Item box cells, each with what it adds */}
        <ul className={box.grid}>
          {ITEMS.map(({ id }) => (
            <li key={id} className={cx(box.slot, styles.got)} data-found>
              <b>+{GIFT_EACH}</b>
              <span className={box.icon}>
                <ItemIcon item={id} size={30} />
              </span>
              <strong>{item(`${id}.name`)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          {first && (
            <Button variant="secondary" onClick={() => onReceive(true)}>
              {t("toSets")}
            </Button>
          )}
          <Button onClick={() => onReceive(false)}>{t("take")}</Button>
        </div>
      </div>
    </Dialog>
  );
}
