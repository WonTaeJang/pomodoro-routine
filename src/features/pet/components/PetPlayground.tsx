"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { usePetRive, usePetRivePose } from "../usePetRive";
import { Button, Card, VisuallyHidden } from "@/components/ui";
import { PixelHeartIcon, ChevronLeftIcon } from "@/components/icons";
import { usePetCare } from "../usePetCare";
import { petStore, usePetStore } from "../store";
import { useStoresReady } from "@/lib/useHydrateStores";
import styles from "./PetPlayground.module.scss";

export function PetPlayground() {
  const [attempt, setAttempt] = useState(0);
  return (
    <PetRoom key={attempt} retry={() => setAttempt((value) => value + 1)} />
  );
}

function PetRoom({ retry }: { retry: () => void }) {
  const t = useTranslations("pet");
  const storesReady = useStoresReady();
  const hydrated = usePetStore((s) => s.hydrated);
  const storageIssue = usePetStore((s) => s.issue);
  useEffect(() => {
    if (storesReady) void petStore.getState().meet();
  }, [storesReady]);
  const animation = usePetRive(storesReady && hydrated);
  const { RiveComponent, loaded, ready, failed } = animation;
  const {
    phase,
    happy,
    pats,
    pet,
    reset,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  } = usePetCare(ready);
  const sleeping = phase === "sleeping";
  const startled = phase === "startled";

  usePetRivePose(animation, { sleeping, startled, happy });

  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <Link href="/" className={styles.back}>
          <ChevronLeftIcon size={16} /> {t("back")}
        </Link>
      </div>
      <VisuallyHidden id="pet-keyboard-help">{t("keyboard")}</VisuallyHidden>

      <Card
        as="section"
        padding="none"
        className={styles.card}
        aria-label={t("label")}
        data-happy={happy}
      >
        <div className={styles.cardHeader}>
          <div>
            <h1>{t("name")}</h1>
          </div>
          <span className={styles.status} role="status">
            <i />
            {startled
              ? t("startled")
              : sleeping
                ? t("sleeping")
                : happy
                  ? t("happy")
                  : t("idle")}
          </span>
        </div>
        <div className={styles.room}>
          <div className={styles.window} aria-hidden="true">
            <span />
            <i />
          </div>
          <div className={styles.plant} aria-hidden="true">
            <i />
            <span />
          </div>
          <div className={styles.rug} aria-hidden="true" />
          <div className={styles.bubble} aria-hidden="true">
            {startled
              ? t("startleBubble")
              : sleeping
                ? t("sleepBubble")
                : happy
                  ? t("happyBubble")
                  : t("bubble")}
            <PixelHeartIcon />
          </div>
          <div className={styles.dog} aria-hidden="true">
            <RiveComponent />
          </div>
          <button
            className={styles.petTarget}
            aria-describedby="pet-keyboard-help"
            data-sleeping={sleeping || startled}
            aria-label={
              startled
                ? t("startled")
                : sleeping
                  ? t("wakeLabel")
                  : t("petLabel")
            }
            disabled={!ready || startled}
            onPointerDown={startStroke}
            onPointerMove={moveStroke}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onLostPointerCapture={endStroke}
            onClick={clickPet}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter")
                event.stopPropagation();
            }}
          />
          {!loaded && (
            <div className={styles.loading} role={failed ? "alert" : "status"}>
              <p>{failed ? t("error") : t("loading")}</p>
              {failed && (
                <Button variant="secondary" size="sm" onClick={retry}>
                  {t("retry")}
                </Button>
              )}
            </div>
          )}
          <span className={styles.roomLabel} aria-hidden="true">
            {t("roomLabel")}
          </span>
        </div>
        <div className={styles.controls}>
          <Button
            icon={<PixelHeartIcon />}
            className={styles.petButton}
            aria-describedby="pet-keyboard-help"
            onClick={pet}
            disabled={!ready || startled}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter")
                event.stopPropagation();
            }}
          >
            {startled ? t("startled") : sleeping ? t("wake") : t("pet")}
          </Button>
          {storageIssue && (
            <div className={styles.storageIssue} role="alert">
              <span>{t(`storageIssue.${storageIssue}`)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void petStore.getState().retry();
                }}
              >
                {t("retrySave")}
              </Button>
            </div>
          )}
        </div>
        <div className={styles.metrics}>
          <div>
            <span>{t("count")}</span>
            <strong>
              {storesReady && hydrated ? t("patCount", { count: pats }) : "—"}
            </strong>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} disabled={!ready}>
            {t("reset")}
          </Button>
        </div>
      </Card>
    </main>
  );
}
