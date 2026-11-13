"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
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
import styles from "./PetWalk.module.scss";

const LAYOUT = new Layout({ fit: Fit.Cover, alignment: Alignment.Center });
const LOAD_TIMEOUT_MS = 15000;

function stopCareKey(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " " || event.key === "Enter") event.stopPropagation();
}

/** Mounted only while away; the home scene and care state remain alive. */
export function PetWalk({ onReturn }: { onReturn: () => void }) {
  const t = useTranslations("pet");
  const [attempt, setAttempt] = useState(0);
  return (
    <div>
      <WalkScene key={attempt} retry={() => setAttempt((value) => value + 1)} />
      <div className={styles.controls}>
        <Button
          autoFocus
          variant="secondary"
          onClick={onReturn}
          onKeyDown={stopCareKey}
        >
          {t("walk.return")}
        </Button>
      </div>
    </div>
  );
}

function WalkScene({ retry }: { retry: () => void }) {
  const t = useTranslations("pet");
  const visible = usePageVisible();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { rive, RiveComponent } = useRive({
    src: "/rive/kkami-walk.riv",
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

  useEffect(() => {
    if (!rive) return;
    // Startup must play even with reduced motion to deliver sceneReady.
    if (failed || !visible || (ready && reducedMotion)) rive.pause();
    else rive.play();
  }, [rive, failed, visible, ready, reducedMotion]);

  useEffect(() => {
    if (ready || failed || !visible) return;
    const timeout = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [ready, failed, visible]);

  return (
    <div className={styles.scene}>
      <div className={styles.canvas} role="img" aria-label={t("walk.scene")}>
        <RiveComponent aria-hidden="true" />
      </div>
      {(!ready || failed) && (
        <div
          className={styles.cover}
          data-failed={failed}
          role={failed ? "alert" : "status"}
        >
          {(!rive || failed) && (
            <p>{failed ? t("walk.error") : t("loading")}</p>
          )}
          {failed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={retry}
              onKeyDown={stopCareKey}
            >
              {t("retry")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
