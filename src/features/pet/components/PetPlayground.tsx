"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type Ref } from "react";
import { useTranslations } from "use-intl";
import { usePetRive, usePetRivePose } from "../usePetRive";
import { Button, VisuallyHidden } from "@/components/ui";
import {
  PixelHeartIcon,
  PixelSnackIcon,
  ChevronLeftIcon,
} from "@/components/icons";
import { usePetCare } from "../usePetCare";
import { petStore, usePetStore } from "../store";
import { useStoresReady } from "@/lib/useHydrateStores";
import styles from "./PetPlayground.module.scss";
import { PetWalk } from "./PetWalk";
import { PetRoomArt } from "./PetRoomArt";
import { PetAffinityDetail, PetHearts, usePetAffinity } from "./PetAffinity";
import { PadIcon, StatusIcon } from "./PetIcons";
import { stopCareKey } from "./stopCareKey";
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
    walking,
    walk,
    returnHome,
    snackSequence,
    pats,
    pet,
    feed,
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
  // Care input waits for the scene and for any reaction to finish.
  const canCare = ready && !startled && !happy;

  const walkButton = useRef<HTMLButtonElement>(null);
  const wasWalking = useRef(false);
  useEffect(() => {
    if (wasWalking.current && !walking) walkButton.current?.focus();
    wasWalking.current = walking;
  }, [walking]);

  usePetRivePose(animation, {
    active: !walking,
    pose,
    snackSequence,
  });

  const affinity = usePetAffinity();
  const [infoOpen, setInfoOpen] = useState(false);
  const infoId = useId();
  const levelUp = affinity.leveledUp;
  const hudIcon = levelUp !== null ? "levelUp" : walking ? "walk" : pose;
  const hudLabel =
    levelUp !== null
      ? t("affinity.levelUpShort", { level: levelUp })
      : t(walking ? "walk.status" : copy.status);

  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <Link href="/" className={styles.back}>
          <ChevronLeftIcon size={16} /> {t("back")}
        </Link>
      </div>
      <VisuallyHidden id="pet-keyboard-help">{t("keyboard")}</VisuallyHidden>

      <section className={styles.device} aria-label={t("label")}>
        <h1 className={styles.name}>{t("name")}</h1>
        <div className={styles.bezel}>
          <div className={styles.lcd}>
            <div className={styles.hud} data-level-up={levelUp !== null}>
              <span className={styles.state} role="status">
                <StatusIcon status={hudIcon} />
                {hudLabel}
              </span>
              <PetHearts
                {...affinity}
                open={infoOpen}
                onToggle={() => setInfoOpen((open) => !open)}
                controls={infoId}
              />
            </div>
            {walking && <PetWalk />}
            <div className={styles.room} hidden={walking}>
              <PetRoomArt />
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
                disabled={!canCare}
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
          </div>
        </div>
        <div className={styles.pads}>
          {walking ? (
            <Button
              autoFocus
              variant="secondary"
              onClick={returnHome}
              onKeyDown={stopCareKey}
            >
              {t("walk.return")}
            </Button>
          ) : (
            <>
              <PetPad
                kind="pet"
                label={t(copy.action)}
                onClick={pet}
                disabled={!canCare}
              />
              <PetPad
                kind="feed"
                label={t("feed")}
                onClick={feed}
                disabled={!canCare || sleeping}
              />
              <PetPad
                ref={walkButton}
                kind="walk"
                label={t("walk.start")}
                onClick={walk}
                disabled={!ready || pose !== "idle"}
              />
            </>
          )}
        </div>
      </section>

      <div className={styles.below}>
        <p className={styles.count}>
          {t("count")}
          <strong>
            {storesReady && hydrated ? t("patCount", { count: pats }) : "—"}
          </strong>
        </p>
        {infoOpen && <PetAffinityDetail id={infoId} {...affinity} />}
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
    </main>
  );
}

/** A round handheld button with a pixel icon and a short name under it. */
function PetPad({
  kind,
  label,
  ...props
}: {
  kind: "pet" | "feed" | "walk";
  label: string;
  onClick: () => void;
  disabled: boolean;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className={styles.pad}
      data-kind={kind}
      aria-describedby="pet-keyboard-help"
      onKeyDown={stopCareKey}
      {...props}
    >
      <span className={styles.key} aria-hidden="true">
        <PadIcon kind={kind} />
      </span>
      {label}
    </button>
  );
}
