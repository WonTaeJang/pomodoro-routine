"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui";
import { cx } from "@/lib/cx";
import room from "./PetPlayground.module.scss";
import styles from "./PetWalk.module.scss";
import { PetRoomArt } from "./PetRoomArt";
import { stopCareKey } from "./stopCareKey";
import { useWalkSprite } from "../useWalkSprite";

type WalkEvents = {
  /** Kkami's first step: the page starts its trip clock. */
  onStep: () => void;
  /** Give up when the scene cannot be drawn and go back without an item. */
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
  const { bindCanvas, drawn, failed } = useWalkSprite(onStep);

  return (
    <div className={room.room}>
      <PetRoomArt />
      <div className={styles.canvas} role="img" aria-label={t("walk.scene")}>
        <canvas ref={bindCanvas} aria-hidden="true" />
      </div>
      {/* Same cover as home, until the first frame is drawn. */}
      <div
        className={cx(room.loading, styles.cover)}
        data-hidden={drawn && !failed}
        data-failed={failed}
        role={failed ? "alert" : "status"}
      >
        {failed && <p>{t("walk.error")}</p>}
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
