"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { usePetRive, usePetRiveOutfit, usePetRivePose } from "../usePetRive";
import { Button, VisuallyHidden } from "@/components/ui";
import { usePetCare } from "../usePetCare";
import { petStore, usePetStore } from "../store";
import { petScreenOpened } from "../visits";
import { useTimerStore } from "@/features/timer/store";
import { isOnBreak } from "@/features/timer/timer";
import { PATHS } from "@/lib/paths";
import { useStoresReady } from "@/lib/useHydrateStores";
import { PetBreakTimer } from "./PetBreakTimer";
import styles from "./PetPlayground.module.scss";
import { PetWalk } from "./PetWalk";
import { PetRoomArt } from "./PetRoomArt";
import { PetAffinityDetail, PetHearts, usePetAffinity } from "./PetAffinity";
import { StatusIcon } from "./PetIcons";
import { PetPad } from "./PetPad";
import { PetSpeechBubble } from "./PetSpeechBubble";
import { DecoratePads, DecoratePick, decorateTag } from "./PetDecorate";
import { usePetDecorate } from "../usePetDecorate";
import { useFocusAfter, useMoment, useUntil } from "../useMoment";
import { useKkamiSpeech } from "../useKkamiSpeech";
import { useTimeOfDay } from "../useTimeOfDay";
import {
  HOME_LINE_MS,
  REST_LINE_MS,
  WAKE_LINE_MS,
  speechSituation,
  type SpeechLevel,
} from "../speech";
import { PET_HAPPY_MS } from "../pet";
import { lookOf, type FurnitureId, type Slot } from "../furniture";
import { PetFoundCard, PetWalkMap } from "./PetTrip";
import { PetItemBox } from "./PetItemBox";
import { PetLog } from "./PetLog";
import { usePetLog } from "../usePetLog";
import { usePetWalkFlow } from "../usePetWalkFlow";
import { useDailyLimitReached } from "../useDailyLimit";
import { DAILY_SNACKS, snacksOn } from "../profile";
import { totalItems } from "../items";
import { stopCareKey } from "./stopCareKey";
import { preloadWalk } from "../walkFile";
import type { PetPose } from "../pet";

const POSE_COPY = {
  sleeping: {
    status: "sleeping",
    action: "wake",
    label: "wakeLabel",
  },
  startled: {
    status: "startled",
    action: "startled",
    label: "startled",
  },
  idle: { status: "idle", action: "pet", label: "petLabel" },
  happy: {
    status: "happy",
    action: "pet",
    label: "petLabel",
  },
  snacking: {
    status: "snackHappy",
    action: "pet",
    label: "petLabel",
  },
} as const satisfies Record<
  PetPose,
  { status: string; action: string; label: string }
>;

export function PetPlayground() {
  const [attempt, setAttempt] = useState(0);
  // The router keeps a page it leaves (hidden, with its state) for a quick
  // way back. Coming back is a new visit: Kkami starts asleep again, the
  // log starts over and Rive loads afresh.
  const pathname = usePathname();
  const [shownAt, setShownAt] = useState(pathname);
  const [visit, setVisit] = useState(0);
  if (pathname !== shownAt) {
    setShownAt(pathname);
    if (pathname === PATHS.pet) setVisit((value) => value + 1);
  }
  useEffect(() => petScreenOpened(), [visit]);
  return (
    <PetRoom
      key={`${visit}-${attempt}`}
      retry={() => setAttempt((value) => value + 1)}
    />
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
  // 휴식 중에 오면 까미가 깨어서 쉬자고 반김
  const resting = useTimerStore((s) => isOnBreak(s.timer));
  const { RiveComponent, loaded, ready, failed } = animation;
  const {
    pose,
    walking,
    walk,
    returnHome,
    cheer,
    awakeAt,
    homeAt,
    snackSequence,
    pet,
    feed,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  } = usePetCare(ready, resting);
  const sleeping = pose === "sleeping";
  const startled = pose === "startled";
  const snacking = pose === "snacking";
  const happy = pose === "happy" || snacking;
  const copy = POSE_COPY[pose];
  // Care input waits for the scene and for any reaction to finish.
  const canCare = ready && !startled && !happy;

  const walkButton = useRef<HTMLButtonElement>(null);
  useFocusAfter(walking, walkButton);

  // Once home is showing, fetch the walk scene so walks start without a download.
  useEffect(() => {
    if (ready) preloadWalk();
  }, [ready]);

  usePetRivePose(animation, {
    active: !walking,
    pose,
    snackSequence,
  });

  const affinity = usePetAffinity();
  // Shown from the start; the hearts and the card's bar both fold it.
  const [infoOpen, setInfoOpen] = useState(true);
  const infoId = useId();
  const levelUp = affinity.leveledUp;
  const record = usePetStore((s) => s.pet);
  const log = usePetLog();
  const addLog = log.add;

  // Log waking up and level ups as they happen.
  const wasAsleep = useRef(true);
  useEffect(() => {
    const asleep = pose === "sleeping" || pose === "startled";
    if (wasAsleep.current && !asleep) addLog({ kind: "wake" });
    wasAsleep.current = asleep;
  }, [pose, addLog]);
  useEffect(() => {
    if (levelUp !== null) addLog({ kind: "level", level: levelUp });
  }, [levelUp, addLog]);

  // Five treats a day: after that the key rests and only says so in the log.
  const outOfSnacks = useDailyLimitReached(
    record ?? null,
    snacksOn,
    DAILY_SNACKS,
  );
  const giveSnack = () =>
    outOfSnacks ? addLog({ kind: "snackLimit", count: DAILY_SNACKS }) : feed();
  const outing = usePetWalkFlow({
    pet: record ?? null,
    walk,
    returnHome,
    addLog,
  });
  const trip = outing.trip;

  const [boxOpen, setBoxOpen] = useState(false);
  const newItems =
    affinity.newHeart ||
    (record ? record.itemsSeen < totalItems(record.items) : false);
  const boxButton = useRef<HTMLButtonElement>(null);
  function openBox() {
    setBoxOpen(true);
    affinity.seeHeart();
    void petStore.getState().markItemsSeen();
  }
  function craft(furniture: FurnitureId) {
    void petStore.getState().recordCraft(furniture);
    addLog({ kind: "craft", furniture });
  }

  // Decorating: pick a slot, then a look; Kkami is pleased with the change.
  const decorated = useMoment<true>(PET_HAPPY_MS);
  const decor = usePetDecorate({
    furniture: record?.furniture ?? [],
    placed: record?.placed ?? {},
    addLog,
    onPlaced: () => {
      cheer();
      decorated.show(true);
    },
  });
  const decorating = decor.mode !== null;
  useFocusAfter(decorating, boxButton);
  // What Kkami wears, or tries on while decorating.
  usePetRiveOutfit(
    animation,
    decor.preview?.outfit ?? lookOf("outfit", record?.placed ?? {}),
  );

  // What Kkami says (I-058).
  const time = useTimeOfDay();
  const greeting = useUntil(awakeAt, resting ? REST_LINE_MS : WAKE_LINE_MS);
  const backHome = useUntil(homeAt, HOME_LINE_MS);
  const situation = speechSituation({
    pose,
    levelUp: levelUp !== null,
    decorated: decorated.value === true,
    greeting,
    backHome,
    resting,
  });
  const speech = useKkamiSpeech(
    situation,
    (levelUp ?? affinity.progress.level) as SpeechLevel,
    time,
  );

  // One status at a time in the header: a level up, then the mode, then the pose.
  const hud =
    levelUp !== null
      ? {
          icon: "levelUp" as const,
          label: t("affinity.levelUpHeart", { level: levelUp }),
        }
      : walking
        ? { icon: "walk" as const, label: t("walk.status") }
        : decorating
          ? { icon: "decorate" as const, label: t("decorate.status") }
          : { icon: pose, label: t(copy.status) };

  // The first walk is walked to the end, so skip stays off.
  const skipLocked = walking && !trip?.canSkip;

  return (
    <main className={styles.page}>
      <VisuallyHidden id="pet-keyboard-help">{t("keyboard")}</VisuallyHidden>

      <PetBreakTimer />
      <section className={styles.device} aria-label={t("label")}>
        <h1 className={styles.name}>{t("name")}</h1>
        <div className={styles.bezel}>
          <div className={styles.lcd}>
            <div className={styles.hud} data-level-up={levelUp !== null}>
              <span className={styles.state} role="status">
                <StatusIcon status={hud.icon} />
                {hud.label}
              </span>
              {walking && trip ? (
                <PetWalkMap progress={trip.progress} item={trip.item} />
              ) : decor.mode ? (
                <DecoratePick mode={decor.mode} looks={decor.looks} />
              ) : (
                <PetHearts
                  {...affinity}
                  open={infoOpen}
                  onToggle={() => setInfoOpen((open) => !open)}
                  controls={infoId}
                />
              )}
            </div>
            {outing.card.value && (
              <PetFoundCard key={outing.card.key} item={outing.card.value} />
            )}
            {walking && <PetWalk onStep={outing.step} onHome={outing.leave} />}
            <div className={styles.room} hidden={walking}>
              <PetRoomArt
                preview={decor.preview}
                decorating={
                  decor.mode
                    ? {
                        selected: decor.mode.slot,
                        tag: decorateTag(t, decor.mode, decor.looks),
                        label: (slot: Slot) =>
                          t("decorate.pick", {
                            name: t(`items.slots.${slot}.name`),
                          }),
                        onSelect: decor.select,
                      }
                    : undefined
                }
              />
              <PetSpeechBubble text={speech} />
              <div className={styles.dog} aria-hidden="true">
                <RiveComponent />
              </div>
              <button
                className={styles.petTarget}
                aria-describedby="pet-keyboard-help"
                data-sleeping={sleeping || startled}
                aria-label={t(copy.label)}
                disabled={!canCare || decorating}
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
            </div>
          </div>
        </div>
        <div className={styles.pads}>
          {decor.mode ? (
            <DecoratePads
              mode={decor.mode}
              onPrev={decor.prev}
              onNext={decor.next}
              onConfirm={decor.confirm}
              onBack={decor.back}
            />
          ) : (
            <>
              {/* While away, the other keys rest and walk becomes skip. */}
              <PetPad
                kind="pet"
                label={t(copy.action)}
                onClick={pet}
                disabled={!canCare || walking}
              />
              <PetPad
                kind="feed"
                label={t("feed")}
                onClick={giveSnack}
                resting={outOfSnacks}
                disabled={!canCare || sleeping || walking}
              />
              <PetPad
                ref={walkButton}
                kind={walking ? "skip" : "walk"}
                label={t(walking ? "walk.skip" : "walk.start")}
                onClick={walking ? outing.skip : outing.start}
                resting={!walking && outing.outOfWalks}
                disabled={walking ? !trip?.canSkip : !ready || pose !== "idle"}
                aria-describedby={skipLocked ? `${infoId}-skip` : undefined}
              />
              <PetPad
                ref={boxButton}
                kind="box"
                label={t("items.button")}
                onClick={openBox}
                disabled={!record || walking}
                dot={newItems ? t("items.newItems") : undefined}
              />
            </>
          )}
        </div>
        {skipLocked && (
          <p id={`${infoId}-skip`} className={styles.padHint}>
            {t("walk.skipFirst")}
          </p>
        )}
      </section>

      <div className={styles.below}>
        <PetAffinityDetail
          id={infoId}
          {...affinity}
          open={infoOpen}
          onToggle={() => setInfoOpen((open) => !open)}
        />
        <PetLog entries={log.entries} />
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
      {record && (
        <PetItemBox
          open={boxOpen}
          onClose={() => setBoxOpen(false)}
          pet={record}
          onCraft={craft}
          onDecorate={() => {
            setBoxOpen(false);
            decor.start();
          }}
        />
      )}
    </main>
  );
}
