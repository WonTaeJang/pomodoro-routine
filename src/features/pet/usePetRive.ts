"use client";

import { useEffect, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
} from "@rive-app/react-webgl2";
import { useMediaQuery } from "@/lib/useMediaQuery";

const LOAD_TIMEOUT_MS = 15000;
const POSE_SETTLE_MS = 80;
const LAYOUT = new Layout({ fit: Fit.Contain, alignment: Alignment.Center });

// Ship the WASM that matches the installed runtime, with no CDN dependency.
RuntimeLoader.setWasmUrl("/rive/rive.wasm");
RuntimeLoader.setWasmFallbackUrl(null);

/** Loading and subscriptions precede playback, so the first sceneReady is not lost. */
export function usePetRive(enabled: boolean) {
  const [failed, setFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const { rive, RiveComponent } = useRive({
    src: "/rive/kkami-pet.riv",
    artboard: "Kkami",
    stateMachine: "Pet",
    autoplay: false,
    autoBind: true,
    layout: LAYOUT,
    onLoadError: () => setFailed(true),
  });
  const { setValue: setHappy } = useViewModelInstanceBoolean(
    "isHappy",
    rive?.viewModelInstance,
  );
  const { setValue: setSleeping } = useViewModelInstanceBoolean(
    "isSleeping",
    rive?.viewModelInstance,
  );
  const { setValue: setStartled } = useViewModelInstanceBoolean(
    "isStartled",
    rive?.viewModelInstance,
  );
  useViewModelInstanceTrigger("sceneReady", rive?.viewModelInstance, {
    onTrigger: () => setSceneReady(true),
  });
  const loaded = Boolean(rive?.viewModelInstance) && !failed;
  const ready = loaded && sceneReady && enabled;

  useEffect(() => {
    if (ready || failed) return;
    const timeout = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [ready, failed]);

  return {
    rive,
    RiveComponent,
    loaded,
    ready,
    failed,
    sceneReady,
    setHappy,
    setSleeping,
    setStartled,
  };
}

/** Called after care derives its pose from readiness; no persistence depends on Rive. */
export function usePetRivePose(
  animation: ReturnType<typeof usePetRive>,
  {
    sleeping,
    startled,
    happy,
  }: { sleeping: boolean; startled: boolean; happy: boolean },
) {
  const { rive, sceneReady, setHappy, setSleeping, setStartled } = animation;
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    setHappy(happy);
    setStartled(startled);
    setSleeping(sleeping);
    if (!rive) return;
    rive.play();
    // Apply the new pose before freezing; the startup splash still plays.
    if (reducedMotion && sceneReady) {
      const freeze = setTimeout(() => rive.pause(), POSE_SETTLE_MS);
      return () => clearTimeout(freeze);
    }
  }, [
    happy,
    sleeping,
    startled,
    sceneReady,
    reducedMotion,
    rive,
    setHappy,
    setSleeping,
    setStartled,
  ]);
}
