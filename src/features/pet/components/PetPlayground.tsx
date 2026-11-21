"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import {
  usePetSprite,
  usePetSpriteOutfit,
  usePetSpritePose,
} from "../usePetSprite";
import { Button, VisuallyHidden } from "@/components/ui";
import { usePetCare } from "../usePetCare";
import { petStore, usePetStore } from "../store";
import { petScreenOpened } from "../visits";
import { useStamps } from "../stamps";
import { useTimerStore } from "@/features/timer/store";
import { isOnBreak } from "@/features/timer/timer";
import { PATHS } from "@/lib/paths";
import { useStoresReady } from "@/lib/useHydrateStores";
import { PetBreakTimer } from "./PetBreakTimer";
import styles from "./PetPlayground.module.scss";
import { PetWalk } from "./PetWalk";
import { PetRoomArt, type RoomDecorating } from "./PetRoomArt";
import { PetAffinityDetail, PetHearts, usePetAffinity } from "./PetAffinity";
import {
  EditionMark,
  GiftBoxIcon,
  StatusIcon,
  type PetStatusIcon,
} from "./PetIcons";
import { PetGiftBox } from "./PetGiftBox";
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
import { useDeviceEdition } from "../useDeviceEdition";
import { useVipGift } from "../useVipGift";
import { GIFT_TOTAL } from "../profile";
import { shownPlaced, usePetVip, useVipRoomCleanup } from "../usePetVip";
import { PetFoundCard, PetWalkMap } from "./PetTrip";
import { PetItemBox } from "./PetItemBox";
import { PetLog } from "./PetLog";
import { usePetLog } from "../usePetLog";
import { usePetWalkFlow } from "../usePetWalkFlow";
import { useDailyLimitReached } from "../useDailyLimit";
import { DAILY_SNACKS, snacksOn } from "../profile";
import { totalItems } from "../items";
import { stopCareKey } from "./stopCareKey";
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
  // log starts over and his scene starts afresh.
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
  const kkami = usePetSprite(storesReady && hydrated);
  // 휴식 중에 오면 까미가 깨어서 쉬자고 반김
  const resting = useTimerStore((s) => isOnBreak(s.timer));
  const { ready, failed, bindCanvas } = kkami;
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

  usePetSpritePose(kkami, {
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
  // VIP pieces show only on VIP accounts; others get the starting looks back.
  const vip = usePetVip();
  useVipRoomCleanup(vip);
  const placed = shownPlaced(record?.placed ?? {}, vip);
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

  // VIP: one gift box a day in the room (I-070).
  const gift = useVipGift(vip, record ?? null);
  const [giftOpen, setGiftOpen] = useState(false);
  function takeGift(toSets: boolean) {
    void petStore.getState().recordGift();
    addLog({ kind: "gift", count: GIFT_TOTAL });
    cheer();
    setGiftOpen(false);
    if (toSets) openBox(true);
  }

  // A whole edition set placed (palace, idol stage): the device changes.
  const edition = useDeviceEdition(vip);
  useEffect(() => {
    if (edition.notice) addLog({ kind: "edition", edition: edition.notice });
  }, [edition.notice, addLog]);
  // A cycle finished while here (this tab or another): a paw stamp in the log.
  const stamps = useStamps(() => addLog({ kind: "stamp" }));

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

  // Home stays on screen until the walk has drawn its first frame. A walk is
  // told apart by when Kkami last came home (homeAt changes after each one).
  const [shownWalk, setShownWalk] = useState<number | null>();

  const [boxOpen, setBoxOpen] = useState(false);
  // Opening at the sets tab (from the first gift box) starts a fresh box.
  const [boxStart, setBoxStart] = useState({ sets: false, n: 0 });
  const newItems =
    affinity.newHeart ||
    stamps.unseen ||
    (record ? record.itemsSeen < totalItems(record.items) : false);
  const boxButton = useRef<HTMLButtonElement>(null);
  function openBox(atSets = false) {
    if (atSets) setBoxStart(({ n }) => ({ sets: true, n: n + 1 }));
    setBoxOpen(true);
    affinity.seeHeart();
    stamps.see();
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
    placed,
    vip: vip === true,
    addLog,
    onPlaced: () => {
      cheer();
      decorated.show(true);
    },
  });
  const decorating = decor.mode !== null;
  useFocusAfter(decorating, boxButton);
  // What Kkami wears, or tries on while decorating.
  usePetSpriteOutfit(kkami, decor.preview?.outfit ?? lookOf("outfit", placed));

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
    edition.current === "palace",
  );

  // Picking a slot in the room (the bubble is one too) while decorating.
  const roomDecorating: RoomDecorating | undefined = decor.mode
    ? {
        selected: decor.mode.slot,
        tag: decorateTag(t, decor.mode, decor.looks),
        label: (slot: Slot) =>
          t("decorate.pick", { name: t(`items.slots.${slot}.name`) }),
        onSelect: decor.select,
      }
    : undefined;

  // One status at a time in the header: a passing notice in gold (a level
  // up, then a new device edition), then the mode, then a waiting VIP gift
  // box (gold too), then the pose.
  function headerStatus(): {
    icon: PetStatusIcon;
    label: string;
    notice?: true;
  } {
    if (levelUp !== null)
      return {
        icon: "levelUp",
        label: t("affinity.levelUpHeart", { level: levelUp }),
        notice: true,
      };
    if (edition.notice)
      return {
        icon: edition.notice,
        label: t(`edition.${edition.notice}`),
        notice: true,
      };
    if (walking) return { icon: "walk", label: t("walk.status") };
    if (decorating) return { icon: "decorate", label: t("decorate.status") };
    if (gift.waiting)
      return { icon: "gift", label: t("gift.arrived"), notice: true };
    return { icon: pose, label: t(copy.status) };
  }
  const hud = headerStatus();

  // The first walk is walked to the end, so skip stays off.
  const skipLocked = walking && !trip?.canSkip;

  return (
    <main className={styles.page}>
      <VisuallyHidden id="pet-keyboard-help">{t("keyboard")}</VisuallyHidden>

      <PetBreakTimer />
      <section
        className={styles.device}
        aria-label={t("label")}
        data-edition={edition.current ?? undefined}
      >
        {edition.current && (
          <span
            key={edition.current}
            className={styles.editionMark}
            data-edition={edition.current}
            aria-hidden="true"
          >
            <EditionMark edition={edition.current} />
          </span>
        )}
        <h1 className={styles.name}>{t("name")}</h1>
        <div className={styles.bezel}>
          <div className={styles.lcd}>
            <div className={styles.hud} data-notice={hud.notice === true}>
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
            {walking && (
              <PetWalk
                onStep={outing.step}
                onHome={outing.leave}
                onShown={() => setShownWalk(homeAt)}
              />
            )}
            <div
              className={styles.room}
              hidden={walking && shownWalk === homeAt}
            >
              <PetRoomArt preview={decor.preview} decorating={roomDecorating} />
              <PetSpeechBubble
                text={speech}
                look={decor.preview?.bubble ?? lookOf("bubble", placed)}
                pick={
                  roomDecorating && {
                    selected: roomDecorating.selected === "bubble",
                    label: roomDecorating.label("bubble"),
                    tag: roomDecorating.tag,
                    onSelect: () => roomDecorating.onSelect("bubble"),
                  }
                }
              />
              <div className={styles.dog} aria-hidden="true">
                <canvas ref={bindCanvas} />
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
              {/* 오늘의 VIP 선물 상자: 까미 옆 바닥에 놓여 있다가 누르면 열림 */}
              {gift.waiting && !decorating && (
                <button
                  type="button"
                  className={styles.giftBox}
                  aria-label={t("gift.open")}
                  onClick={() => setGiftOpen(true)}
                  onKeyDown={stopCareKey}
                >
                  <GiftBoxIcon size={48} />
                </button>
              )}
              {/*
              까미를 처음 그릴 때까지 방을 가려 두고, 그리면 서서히 걷음 (B-003).
              캔버스를 쓸 수 없는 브라우저에서만 안내와 다시 불러오기를 보여 줌
            */}
              <div
                className={styles.loading}
                data-hidden={ready}
                role={failed ? "alert" : "status"}
              >
                {failed && (
                  <>
                    <p>{t("error")}</p>
                    <Button variant="secondary" size="sm" onClick={retry}>
                      {t("retry")}
                    </Button>
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
                onClick={() => openBox()}
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
      {giftOpen && gift.waiting && (
        <PetGiftBox
          first={gift.first}
          onClose={() => setGiftOpen(false)}
          onReceive={takeGift}
        />
      )}
      {record && (
        <PetItemBox
          key={boxStart.n}
          startTab={boxStart.sets ? "sets" : "materials"}
          open={boxOpen}
          onClose={() => setBoxOpen(false)}
          pet={record}
          vip={vip === true}
          stamps={stamps.earned}
          onCraft={craft}
          onApply={decor.apply}
          onApplySet={(set) => {
            decor.applySet(set);
            // The whole room changes: close the box so it shows.
            setBoxOpen(false);
          }}
          onDecorate={() => {
            setBoxOpen(false);
            decor.start();
          }}
        />
      )}
    </main>
  );
}
