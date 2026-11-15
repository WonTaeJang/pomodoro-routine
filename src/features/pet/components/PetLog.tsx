"use client";

import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import type { PetLogEntry } from "../usePetLog";
import { ItemIcon, MapIcon, StatusIcon } from "./PetIcons";
import styles from "./PetLog.module.scss";

const SHOWN = 5;
const pad = (n: number) => String(n).padStart(2, "0");
const clock = (at: number) => {
  const date = new Date(at);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function EntryIcon({ entry }: { entry: PetLogEntry }) {
  switch (entry.kind) {
    case "enter":
    case "wake":
      return <StatusIcon status="idle" />;
    case "pat":
      return <StatusIcon status="happy" />;
    case "snack":
      return <StatusIcon status="snacking" />;
    case "walkOut":
      return <StatusIcon status="walk" />;
    case "home":
      return <MapIcon stop="home" />;
    case "found":
    case "skipped":
      return <ItemIcon item={entry.item} size={12} />;
    case "level":
      return <StatusIcon status="levelUp" />;
  }
}

function EntryText({ entry }: { entry: PetLogEntry }) {
  const t = useTranslations("pet");
  switch (entry.kind) {
    case "pat":
      return (
        <>
          {t("log.pat")}
          {entry.points > 0 && <em>+{entry.points}</em>}
          <small>{t("log.patTotal", { count: entry.total })}</small>
        </>
      );
    case "snack":
      return (
        <>
          {t("log.snack")}
          <em>+{entry.points}</em>
        </>
      );
    case "found":
    case "skipped":
      return t(`log.${entry.kind}`, {
        object: t(`items.${entry.item}.object`),
      });
    case "level":
      return t("affinity.levelUpShort", { level: entry.level });
    default:
      return t(`log.${entry.kind}`);
  }
}

/** What happened since the page opened, newest first. */
export function PetLog({ entries }: { entries: PetLogEntry[] }) {
  const t = useTranslations("pet.log");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const shown = open ? entries : entries.slice(0, SHOWN);
  return (
    <section className={styles.log} aria-labelledby={`${listId}-title`}>
      <header className={styles.header}>
        <h2 id={`${listId}-title`}>{t("title")}</h2>
        {entries.length > SHOWN && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((value) => !value)}
          >
            {t(open ? "less" : "more")}
          </button>
        )}
      </header>
      <ol id={listId} className={styles.list}>
        {shown.map((entry) => (
          <li key={entry.id}>
            <time dateTime={new Date(entry.at).toISOString()}>
              {clock(entry.at)}
            </time>
            <span className={styles.icon} aria-hidden="true">
              <EntryIcon entry={entry} />
            </span>
            <span>
              <EntryText entry={entry} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
