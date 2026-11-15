"use client";

import { useEffect, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModelInstanceTrigger,
} from "@rive-app/react-webgl2";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePageVisible } from "@/lib/usePageVisible";
import { cx } from "@/lib/cx";
import room from "./PetPlayground.module.scss";
import styles from "./PetWalk.module.scss";
import { PetRoomArt } from "./PetRoomArt";
import { stopCareKey } from "./stopCareKey";
import { WALK_SRC, preloadedWalk } from "../walkFile";

// The canvas is sized in CSS to the artboard at the home scale, so Contain is 1:1.
const LAYOUT = new Layout({ fit: Fit.Contain, alignment: Alignment.Center });
const LOAD_TIMEOUT_MS = 15000;

type WalkEvents = {
  /** Kkami's first step: the page starts its trip clock. */
  onStep: () => void;
  /** Give up after a failed load and go back without an item. */
  onHome: () => void;
};

/** Mounted only while away; the home scene and care state remain alive. */
export function PetWalk(events: WalkEvents) {
  const [attempt, setAttempt] = useState(0);
  return (
    <WalkScene
      key={attempt}
      retry={() => setAttempt((value) => value + 1)}
      {...events}
    />
  );
}

function WalkScene({
  retry,
  onStep,
  onHome,
}: WalkEvents & { retry: () => void }) {
  const t = useTranslations("pet");
  const visible = usePageVisible();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = useState(false);
  const [walking, setWalking] = useState(false);
  const [failed, setFailed] = useState(false);
  // The page downloads the scene while Kkami is home; without it, load here.
  const [file] = useState(() => {
    const buffer = preloadedWalk();
    return buffer ? { buffer } : { src: WALK_SRC };
  });
  const { rive, RiveComponent } = useRive({
    ...file,
    artboard: "Walk",
    stateMachine: "Walk",
    autoplay: false,
    autoBind: true,
    layout: LAYOUT,
    onLoadError: () => setFailed(true),
  });
  useViewModelInstanceTrigger("sceneReady", rive?.viewModelInstance, {
    onTrigger: () => setReady(true),
  });
  useViewModelInstanceTrigger("walkStarted", rive?.viewModelInstance, {
    onTrigger: () => {
      setWalking(true);
      onStep();
    },
  });

  useEffect(() => {
    if (!rive) return;
    // The start (turning from the home pose in the room) plays even with
    // reduced motion; it then holds the first walking pose while the page's
    // trip clock, map and find card carry on.
    if (failed || !visible || (walking && reducedMotion)) rive.pause();
    else rive.play();
  }, [rive, failed, visible, walking, reducedMotion]);

  useEffect(() => {
    if (ready || failed || !visible) return;
    const timeout = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [ready, failed, visible]);

  return (
    <div className={room.room}>
      <PetRoomArt />
      <span className={room.roomLabel} aria-hidden="true">
        {t("roomLabel")}
      </span>
      <div className={styles.canvas} role="img" aria-label={t("walk.scene")}>
        <RiveComponent aria-hidden="true" />
      </div>
      {/* Same cover as home: the Rive startup screen still shows above it. */}
      <div
        className={cx(room.loading, styles.cover)}
        data-hidden={ready && !failed}
        data-failed={failed}
        role={failed ? "alert" : "status"}
      >
        {(!rive || failed) && <p>{failed ? t("walk.error") : t("loading")}</p>}
        {failed && (
          <div className={styles.failActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={retry}
              onKeyDown={stopCareKey}
            >
              {t("retry")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onHome}
              onKeyDown={stopCareKey}
            >
              {t("walk.home")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
