"use client";

import type { Ref } from "react";
import { VisuallyHidden } from "@/components/ui";
import { PadIcon, type PadKind } from "./PetIcons";
import { stopCareKey } from "./stopCareKey";
import styles from "./PetPlayground.module.scss";

/** A round handheld button with a pixel icon and a short name under it. */
export function PetPad({
  kind,
  label,
  dot,
  "aria-describedby": describedBy = "pet-keyboard-help",
  ...props
}: {
  kind: PadKind;
  label: string;
  onClick: () => void;
  disabled: boolean;
  /** A small red dot with this screen-reader text (e.g. new items). */
  dot?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Replaces the keyboard help as the description (e.g. why it is off). */
  "aria-describedby"?: string;
}) {
  return (
    <button
      type="button"
      className={styles.pad}
      data-kind={kind}
      aria-describedby={describedBy}
      onKeyDown={stopCareKey}
      {...props}
    >
      <span className={styles.key} aria-hidden="true">
        <PadIcon kind={kind} />
        {dot && <i className={styles.dot} />}
      </span>
      {label}
      {dot && <VisuallyHidden>{dot}</VisuallyHidden>}
    </button>
  );
}
