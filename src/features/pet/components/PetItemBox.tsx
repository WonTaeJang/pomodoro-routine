"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Dialog, SegmentedControl } from "@/components/ui";
import { ITEMS, type ItemCounts } from "../items";
import { ItemIcon } from "./PetIcons";
import styles from "./PetItemBox.module.scss";

/** Everything found on walks. Crafting comes later, so its tab is disabled. */
export function PetItemBox({
  open,
  onClose,
  items,
  walks,
}: {
  open: boolean;
  onClose: () => void;
  items: ItemCounts;
  walks: number;
}) {
  const t = useTranslations("pet.items");
  const [tab, setTab] = useState<"list" | "craft">("list");
  const kinds = ITEMS.filter(({ id }) => items[id]).length;
  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      <SegmentedControl
        className={styles.tabs}
        label={t("tabs")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "list", label: t("list") },
          {
            value: "craft",
            label: (
              <>
                {t("craft")}
                <small className={styles.soon}>{t("soon")}</small>
              </>
            ),
            disabled: true,
          },
        ]}
      />
      <ul className={styles.grid}>
        {ITEMS.map(({ id }) => {
          const count = items[id] ?? 0;
          return (
            <li key={id} className={styles.slot} data-found={count > 0}>
              <ItemIcon item={id} size={30} unknown={count === 0} />
              <strong>{count > 0 ? t(`${id}.name`) : t("unknown")}</strong>
              <span>{count > 0 ? t("count", { count }) : t("notFound")}</span>
            </li>
          );
        })}
      </ul>
      <p className={styles.summary}>{t("summary", { walks, kinds })}</p>
    </Dialog>
  );
}
