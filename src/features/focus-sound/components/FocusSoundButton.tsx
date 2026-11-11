"use client";

import { useId } from "react";
import { useTranslations } from "use-intl";
import { HeadphonesIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useFocusSoundChoice } from "../useFocusSoundChoice";
import { useFocusSoundPlaying } from "../useFocusSoundPlaying";
import styles from "./FocusSoundButton.module.scss";
import { FocusSoundPanel } from "./FocusSoundPanel";
import { PlayingBars } from "./PlayingBars";

type FocusSoundButtonProps = {
  /** 저장된 값을 불러오기 전이면 false (누를 수 없음) */
  ready: boolean;
};

/**
 * 헤더의 집중 소리 버튼. 누르면 아래에 소리 고르기 창이 펼쳐집니다.
 * 소리를 골라 두면 버튼에 점이 붙고, 실제로 소리가 나오는 동안에는 점 대신 오르내리는 막대가 보입니다.
 */
export function FocusSoundButton({ ready }: FocusSoundButtonProps) {
  const panelId = useId();
  const { setting, sound } = useFocusSoundChoice();
  const on = ready && sound !== null;
  const playing = useFocusSoundPlaying() && on;
  const t = useTranslations("focusSound");
  const soundName = sound ? t(`sounds.${sound}.label`) : "";
  const label = !on
    ? t("title")
    : t(setting === "random" ? "buttonRandom" : "buttonPlaying", {
        sound: soundName,
      });

  return (
    <>
      <IconButton
        label={playing ? `${label} ${t("playing")}` : label}
        icon={
          <>
            <HeadphonesIcon />
            {playing ? <PlayingBars className={styles.bars} /> : null}
          </>
        }
        disabled={!ready}
        popoverTarget={panelId}
        className={cx(
          styles.button,
          on && !playing && styles.on,
          playing && styles.playing,
        )}
      />
      {/* 브라우저 기본 펼침 창(popover): 바깥을 누르거나 ESC로 닫힘 */}
      <div id={panelId} popover="auto" className={styles.panel}>
        {ready ? <FocusSoundPanel /> : null}
      </div>
    </>
  );
}
