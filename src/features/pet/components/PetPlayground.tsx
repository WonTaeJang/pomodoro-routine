"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
  useViewModelInstanceBoolean,
} from "@rive-app/react-webgl2";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Badge, Button, Card } from "@/components/ui";
import { PixelHeartIcon, PawIcon, ChevronLeftIcon } from "@/components/icons";
import { usePetCare } from "../usePetCare";
import styles from "./PetPlayground.module.scss";

// Ship the WASM that matches the installed runtime, with no CDN dependency.
RuntimeLoader.setWasmUrl("/rive/rive.wasm");
RuntimeLoader.setWasmFallbackUrl(null);

export function PetPlayground() {
  const [attempt, setAttempt] = useState(0);
  return (
    <PetRoom key={attempt} retry={() => setAttempt((value) => value + 1)} />
  );
}

function PetRoom({ retry }: { retry: () => void }) {
  const t = useTranslations("pet");
  const [failed, setFailed] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { rive, RiveComponent } = useRive({
    src: "/rive/kkami-pet.riv",
    artboard: "Kkami",
    stateMachine: "Pet",
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });
  const { setValue: setRiveHappy } = useViewModelInstanceBoolean(
    "isHappy",
    rive?.viewModelInstance,
  );
  const ready = Boolean(rive?.viewModelInstance) && !failed;
  const {
    happy,
    pats,
    pet,
    reset,
    startStroke,
    moveStroke,
    endStroke,
    clickPet,
  } = usePetCare(ready);

  useEffect(() => {
    setRiveHappy(happy);
    if (!rive) return;
    rive.play();
    // Let the state machine apply the new pose, then hold it for reduced motion.
    if (reducedMotion) {
      const freeze = setTimeout(() => rive.pause(), 80);
      return () => clearTimeout(freeze);
    }
  }, [happy, reducedMotion, rive, setRiveHappy]);

  useEffect(() => {
    if (ready || failed) return;
    const timeout = setTimeout(() => setFailed(true), 15000);
    return () => clearTimeout(timeout);
  }, [ready, failed]);

  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <Link href="/" className={styles.back}>
          <ChevronLeftIcon size={16} /> {t("back")}
        </Link>
        <Badge size="sm" variant="outline">
          {t("prototype")}
        </Badge>
      </div>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>
          <PawIcon size={16} /> {t("label")}
        </p>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
      </header>

      <Card
        as="section"
        padding="none"
        className={styles.card}
        aria-label={t("label")}
        data-happy={happy}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>
              {t("name")}
              <span>01</span>
            </h2>
            <p>{t("subtitle")}</p>
          </div>
          <span className={styles.status}>
            <i />
            {happy ? t("happy") : t("idle")}
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
            {happy ? t("happyBubble") : t("bubble")}
            <PixelHeartIcon />
          </div>
          <div className={styles.dog} aria-hidden="true">
            <RiveComponent />
          </div>
          <button
            className={styles.petTarget}
            aria-label={t("petLabel")}
            disabled={!ready}
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
          {!ready && (
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
          <p className={styles.hint}>{t("hint")}</p>
          <Button
            icon={<PixelHeartIcon />}
            className={styles.petButton}
            onClick={pet}
            disabled={!ready}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter")
                event.stopPropagation();
            }}
          >
            {t("pet")}
          </Button>
          <p className={styles.keyboard}>{t("keyboard")}</p>
        </div>
        <div className={styles.metrics}>
          <div>
            <span>{t("count")}</span>
            <strong>{t("patCount", { count: pats })}</strong>
          </div>
          <div>
            <span>{t("mood")}</span>
            <strong className={styles.mood} role="status">
              {happy ? t("moodHappy") : t("moodIdle")}
              <PixelHeartIcon />
            </strong>
          </div>
        </div>
      </Card>
      <footer className={styles.footnote}>
        <p>{t("note")}</p>
        <span>{t("detail")}</span>
        <Button variant="ghost" size="sm" onClick={reset} disabled={pats === 0}>
          {t("reset")}
        </Button>
        <small>{t("session")}</small>
      </footer>
    </main>
  );
}
