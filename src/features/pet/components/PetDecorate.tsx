"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "use-intl";
import { VisuallyHidden } from "@/components/ui";
import { SLOTS } from "../furniture";
import type { DecorateStep } from "../usePetDecorate";
import type { LookId } from "../furniture";
import { PetPad } from "./PetPad";
import styles from "./PetPlayground.module.scss";

/** A dot per option, the current one dark; `position` is read out instead. */
export function PickDots({
  total,
  index,
  position,
}: {
  total: number;
  index: number;
  position: string;
}) {
  return (
    <>
      <span className={styles.pickDots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-on={i === index} />
        ))}
      </span>
      <VisuallyHidden>{position}</VisuallyHidden>
    </>
  );
}

/** Where the choice stands: the slot's name and a dot per option. */
export function DecoratePick({
  mode,
  looks,
}: {
  mode: DecorateStep;
  looks: readonly LookId[];
}) {
  const t = useTranslations("pet");
  const total = mode.step === "slot" ? SLOTS.length : looks.length;
  const index = mode.step === "slot" ? SLOTS.indexOf(mode.slot) : mode.index;
  return (
    <span className={styles.pick}>
      {t(`items.slots.${mode.slot}.name`)}
      <PickDots
        total={total}
        index={index}
        position={t("decorate.position", { index: index + 1, total })}
      />
    </span>
  );
}

/** The tag under the chosen slot: its name, or the look being tried. */
export function decorateTag(
  t: ReturnType<typeof useTranslations<"pet">>,
  mode: DecorateStep,
  looks: readonly LookId[],
) {
  if (mode.step === "slot") return t(`items.slots.${mode.slot}.name`);
  return `${t(`items.furniture.${looks[mode.index]}.name`)} · ${mode.index + 1}/${looks.length}`;
}

/** The four keys while decorating: ◀ ▶ move, ✓ choose or place, ✕ back. */
export function DecoratePads({
  mode,
  onPrev,
  onNext,
  onConfirm,
  onBack,
}: {
  mode: DecorateStep;
  onPrev: () => void;
  onNext: () => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("pet.decorate");
  const choosingSlot = mode.step === "slot";
  // Start on ✓. Wait a frame: the closing item box hands focus back first.
  const ok = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ok.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <>
      <PetPad kind="prev" label={t("prev")} onClick={onPrev} disabled={false} />
      <PetPad kind="next" label={t("next")} onClick={onNext} disabled={false} />
      <PetPad
        ref={ok}
        kind="ok"
        label={t(choosingSlot ? "choose" : "place")}
        onClick={onConfirm}
        disabled={false}
      />
      <PetPad
        kind="cancel"
        label={t(choosingSlot ? "done" : "back")}
        onClick={onBack}
        disabled={false}
      />
    </>
  );
}
