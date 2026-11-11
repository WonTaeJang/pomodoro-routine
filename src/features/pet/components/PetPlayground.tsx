"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { useTranslations } from "use-intl";
import { usePetRive, usePetRivePose } from "../usePetRive";
import { Button, Card, VisuallyHidden } from "@/components/ui";
import {
  PixelHeartIcon,
  PixelSnackIcon,
  ChevronLeftIcon,
} from "@/components/icons";
import { usePetCare } from "../usePetCare";
import { petStore, usePetStore } from "../store";
import { useStoresReady } from "@/lib/useHydrateStores";
import styles from "./PetPlayground.module.scss";
import { PetAffinity } from "./PetAffinity";
import type { PetPose } from "../pet";

const POSE_COPY = {
  sleeping: {
    status: "sleeping",
    bubble: "sleepBubble",
    action: "wake",
    label: "wakeLabel",
  },
  startled: {
    status: "startled",
    bubble: "startleBubble",
    action: "startled",
    label: "startled",
  },
  idle: { status: "idle", bubble: "bubble", action: "pet", label: "petLabel" },
  happy: {
    status: "happy",
    bubble: "happyBubble",
    action: "pet",
    label: "petLabel",
  },
  snacking: {
    status: "snackHappy",
    bubble: "snackBubble",
    action: "pet",
    label: "petLabel",
  },
} as const satisfies Record<
  PetPose,
  { status: string; bubble: string; action: string; label: string }
>;

function stopCareKey(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " " || event.key === "Enter") event.stopPropagation();
}

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
    pose,
    snackSequence,
    pats,
    pet,
    feed,
    reset,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  } = usePetCare(ready);
  const sleeping = pose === "sleeping";
  const startled = pose === "startled";
  const snacking = pose === "snacking";
  const happy = pose === "happy" || snacking;
  const copy = POSE_COPY[pose];

  usePetRivePose(animation, {
    pose,
    snackSequence,
  });

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
            {t(copy.status)}
          </span>
        </div>
        <PetAffinity />
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
            {t(copy.bubble)}
            {snacking ? <PixelSnackIcon /> : <PixelHeartIcon />}
          </div>
          <div className={styles.dog} aria-hidden="true">
            <RiveComponent />
          </div>
          <button
            className={styles.petTarget}
            aria-describedby="pet-keyboard-help"
            data-sleeping={sleeping || startled}
            aria-label={t(copy.label)}
            disabled={!ready || startled || happy}
            onPointerDown={startStroke}
            onPointerMove={moveStroke}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onLostPointerCapture={endStroke}
            onClick={clickPet}
            onKeyDown={stopCareKey}
          />
          {/*
            강아지가 준비될 때까지 방을 가려 두고, 준비되면 서서히 걷음 (B-003).
            Rive 시작 화면은 이 덮개 위에 보이므로, 파일을 다 받은 뒤에는 안내 글을 지움
          */}
          <div
            className={styles.loading}
            data-hidden={ready}
            role={failed ? "alert" : "status"}
          >
            {!loaded && (
              <>
                <p>{failed ? t("error") : t("loading")}</p>
                {failed && (
                  <Button variant="secondary" size="sm" onClick={retry}>
                    {t("retry")}
                  </Button>
                )}
              </>
            )}
          </div>
          <span className={styles.roomLabel} aria-hidden="true">
            {t("roomLabel")}
          </span>
        </div>
        <div className={styles.controls}>
          <div className={styles.actions}>
            <Button
              icon={<PixelHeartIcon />}
              className={styles.petButton}
              aria-describedby="pet-keyboard-help"
              onClick={pet}
              disabled={!ready || startled || happy}
              onKeyDown={stopCareKey}
            >
              {t(copy.action)}
            </Button>
            <Button
              variant="secondary"
              icon={<PixelSnackIcon />}
              className={styles.petButton}
              onClick={feed}
              disabled={!ready || sleeping || startled || happy}
              aria-describedby="pet-keyboard-help"
              onKeyDown={stopCareKey}
            >
              {t("feed")}
            </Button>
          </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={!ready || happy}
          >
            {t("reset")}
          </Button>
        </div>
      </Card>
    </main>
  );
}
