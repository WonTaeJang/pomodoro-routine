"use client";

import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import { setById } from "../furniture";
import type { PetLogEntry } from "../usePetLog";
import {
  HeartItemIcon,
  ItemIcon,
  MapIcon,
  PawItemIcon,
  StatusIcon,
} from "./PetIcons";
import { LookPicture } from "./PetRoomArt";
import { PetPanel } from "./PetPanel";
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
    case "snackLimit":
      return <StatusIcon status="snacking" />;
    case "walkOut":
    case "walkLimit":
      return <StatusIcon status="walk" />;
    case "home":
      return <MapIcon stop="home" />;
    case "found":
    case "skipped":
      return <ItemIcon item={entry.item} size={12} />;
    case "level":
      return <HeartItemIcon size={11} />;
    case "stamp":
      return <PawItemIcon size={12} />;
    case "palace":
      return <StatusIcon status="palace" />;
    case "craft":
      return <LookPicture look={entry.furniture} height={12} />;
    case "place":
      return <LookPicture look={entry.look} height={12} />;
    case "set":
      // The set's wall and floor stand for the whole set.
      return <LookPicture look={setById(entry.set).pieces.room} height={12} />;
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
      return t("log.levelHeart", { level: entry.level });
    case "walkLimit":
      return t("log.walkLimit", { count: entry.count });
    case "snackLimit":
      return t("log.snackLimit", { count: entry.count });
    case "craft":
      return t("log.craft", {
        object: t(`items.furniture.${entry.furniture}.object`),
      });
    case "place":
      return t("log.place", {
        slot: t(`items.slots.${entry.slot}.object`),
        to: t(`items.furniture.${entry.look}.to`),
      });
    case "set":
      return t("log.set", { to: t(`items.sets.${entry.set}.to`) });
    default:
      return t(`log.${entry.kind}`);
  }
}

/** What happened since the page opened, newest first. */
export function PetLog({ entries }: { entries: PetLogEntry[] }) {
  const t = useTranslations("pet.log");
  const [folded, setFolded] = useState(false);
  const [all, setAll] = useState(false);
  const listId = useId();
  const shown = all ? entries : entries.slice(0, SHOWN);
  return (
    <PetPanel
      title={t("title")}
      open={!folded}
      onToggle={() => setFolded((value) => !value)}
    >
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
      {entries.length > SHOWN && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={all}
          aria-controls={listId}
          onClick={() => setAll((value) => !value)}
        >
          {all ? t("less") : t("more", { count: entries.length - SHOWN })}
        </button>
      )}
    </PetPanel>
  );
}
