"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import styles from "./PetPanel.module.scss";

/**
 * An LCD-coloured card under the device with a title bar that folds it.
 * Used by the affinity details and the log.
 */
export function PetPanel({
  title,
  open,
  onToggle,
  bodyId,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  /** The body's id, when another control (the header hearts) also folds it. */
  bodyId?: string;
  children: ReactNode;
}) {
  const t = useTranslations("pet.panel");
  const ownId = useId();
  const id = bodyId ?? ownId;
  return (
    <section className={styles.panel} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <h2 id={`${id}-title`}>{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          {t(open ? "collapse" : "expand")}
          <span
            className={styles.chevron}
            data-open={open}
            aria-hidden="true"
          />
        </button>
      </header>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
