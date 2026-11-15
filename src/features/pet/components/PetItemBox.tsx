"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import {
  Button,
  Dialog,
  SegmentedControl,
  VisuallyHidden,
} from "@/components/ui";
import { ITEMS, type ItemId } from "../items";
import {
  FURNITURE,
  SLOTS,
  availableItems,
  canMake,
  type FurnitureId,
} from "../furniture";
import type { PetProfile } from "../profile";
import { ItemIcon } from "./PetIcons";
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
  const left = availableItems(pet.items, pet.spent);
  const kinds = ITEMS.filter(({ id }) => pet.items[id]).length;
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
        <>
          <ul className={styles.grid}>
            {ITEMS.map(({ id }) => {
              const found = (pet.items[id] ?? 0) > 0;
              const count = left[id] ?? 0;
              return (
                <li key={id} className={styles.slot} data-found={found}>
                  <ItemIcon item={id} size={30} unknown={!found} />
                  <strong>{found ? t(`${id}.name`) : t("unknown")}</strong>
                  <span>{found ? t("count", { count }) : t("notFound")}</span>
                </li>
              );
            })}
          </ul>
          <p className={styles.summary}>
            {t("summary", { walks: pet.walks, kinds })}
          </p>
        </>
      ) : (
        <>
          {SLOTS.map((slot) => (
            <section key={slot} aria-labelledby={`craft-${slot}`}>
              <h3 id={`craft-${slot}`} className={styles.group}>
                {t(`slots.${slot}.name`)}
              </h3>
              <ul className={styles.recipes}>
                {FURNITURE.filter((piece) => piece.slot === slot).map(
                  ({ id, need }) => {
                    const made = pet.furniture.includes(id);
                    const ready = canMake(id, left);
                    return (
                      <li key={id} className={styles.recipe}>
                        <span className={styles.art}>
                          <LookPicture look={id} cell={2} />
                        </span>
                        <span className={styles.recipeText}>
                          <strong>{t(`furniture.${id}.name`)}</strong>
                          <span className={styles.need}>
                            {Object.entries(need).map(([item, count]) => {
                              const have = left[item as ItemId] ?? 0;
                              const name = t(`${item as ItemId}.name`);
                              return (
                                <span
                                  key={item}
                                  data-short={!made && have < count}
                                >
                                  <ItemIcon item={item as ItemId} size={12} />
                                  <span aria-hidden="true">
                                    {have}/{count}
                                  </span>
                                  <VisuallyHidden>
                                    {t("needLabel", {
                                      name,
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
                  },
                )}
              </ul>
            </section>
          ))}
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
