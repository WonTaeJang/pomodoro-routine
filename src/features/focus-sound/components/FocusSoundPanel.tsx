"use client";

import { useRef } from "react";
import { useTranslations } from "use-intl";
import {
  HeadphonesIcon,
  ShuffleIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  type IconComponent,
} from "@/components/icons";
import { Slider, VisuallyHidden } from "@/components/ui";
import { useFocusRunning } from "@/features/timer/hooks";
import { useTimerStore } from "@/features/timer/store";
import { cx } from "@/lib/cx";
import { useScrollEdges } from "@/lib/useScrollEdges";
import { previewFocusSound, setPreviewVolume, stopPreview } from "../player";
import {
  FOCUS_SOUND_GROUPS,
  FOCUS_SOUNDS,
  type FocusSoundId,
  type FocusSoundSetting,
} from "../sounds";
import { useFocusSoundChoice } from "../useFocusSoundChoice";
import styles from "./FocusSoundPanel.module.scss";
import { PlayingBars } from "./PlayingBars";

/** 맨 위 넓은 두 칸 (이름과 설명은 focusSound.<값>.label / description) */
const WIDE_OPTIONS = [
  { value: "off", icon: VolumeOffIcon },
  { value: "random", icon: ShuffleIcon },
] as const;

/**
 * 집중 소리 고르기, 크기. 집중 중이 아닐 때 고르면 잠깐 미리 들려줍니다.
 * 랜덤을 고르면 이번(또는 다음) 집중의 소리를 알려주고, 집중 중이면 그 소리 칸에 재생 중 막대.
 * 화면이 낮으면 제목과 소리 크기는 그대로 두고 가운데 소리 목록만 스크롤됩니다.
 */
export function FocusSoundPanel() {
  const { setting, sound, randomSound } = useFocusSoundChoice();
  const volume = useTimerStore((s) => s.settings.focusSoundVolume);
  const focusing = useFocusRunning();
  const update = useTimerStore.getState().updateSettings;
  const t = useTranslations("focusSound");
  const common = useTranslations("common");
  const bodyRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(bodyRef);

  function choose(value: FocusSoundSetting) {
    update({ focusSound: value });
    if (value === "off") stopPreview();
    else if (!focusing) {
      previewFocusSound(value === "random" ? randomSound : value, volume);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={cx(styles.head, edges.above && styles.edge)}>
        <h2 className={styles.title}>
          <HeadphonesIcon size={20} className={styles.titleIcon} />
          {t("title")}
        </h2>
        <p className={styles.hint}>
          {t(focusing ? "hint" : "hintWithPreview")}
        </p>
      </div>

      <div ref={bodyRef} className={styles.body}>
        <SoundChoices
          setting={setting}
          sound={sound}
          focusing={focusing}
          onChoose={choose}
        />
      </div>

      <div className={cx(styles.foot, edges.below && styles.edge)}>
        <Slider
          label={common("volume")}
          value={Math.round(volume * 100)}
          onChange={(value) => {
            update({ focusSoundVolume: value / 100 });
            setPreviewVolume(value / 100);
          }}
          format={(value) => `${value}%`}
          disabled={setting === "off"}
          startIcon={<VolumeLowIcon size={18} />}
          endIcon={<VolumeHighIcon size={18} />}
        />
      </div>
    </div>
  );
}

type SoundChoicesProps = {
  setting: FocusSoundSetting;
  /** 실제로 틀 소리 (랜덤이면 이번·다음 집중의 소리). 끄기면 null */
  sound: FocusSoundId | null;
  focusing: boolean;
  onChoose: (value: FocusSoundSetting) => void;
};

/** 소리 고르기 목록: 맨 위 끄기·랜덤(+ 랜덤 안내), 묶음마다 소리 칸 */
function SoundChoices({
  setting,
  sound,
  focusing,
  onChoose,
}: SoundChoicesProps) {
  const t = useTranslations("focusSound");
  return (
    <fieldset className={styles.options}>
      <legend className={styles.legend}>{t("kind")}</legend>
      <div className={styles.wideRow}>
        {WIDE_OPTIONS.map(({ value, icon }) => (
          <SoundOption
            key={value}
            value={value}
            label={t(`${value}.label`)}
            description={t(`${value}.description`)}
            icon={icon}
            checked={setting === value}
            playing={false}
            onChoose={onChoose}
            className={styles.wide}
          />
        ))}
      </div>
      {setting === "random" && sound ? (
        <p className={styles.randomNote} aria-live="polite">
          {t(focusing ? "random.now" : "random.next", {
            sound: t(`sounds.${sound}.label`),
          })}
        </p>
      ) : null}
      {FOCUS_SOUND_GROUPS.map((group) => (
        <div key={group.id} className={styles.group}>
          <p className={styles.groupTitle}>{t(`groups.${group.id}`)}</p>
          <div className={styles.grid}>
            {group.ids.map((id) => (
              <SoundOption
                key={id}
                value={id}
                label={t(`sounds.${id}.label`)}
                description={t(`sounds.${id}.description`)}
                icon={FOCUS_SOUNDS[id].icon}
                checked={setting === id}
                playing={focusing && sound === id}
                onChoose={onChoose}
              />
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

type SoundOptionProps = {
  value: FocusSoundSetting;
  label: string;
  description: string;
  icon: IconComponent;
  checked: boolean;
  /** 집중 중이라 지금 들리는 소리 */
  playing: boolean;
  onChoose: (value: FocusSoundSetting) => void;
  className?: string;
};

/**
 * 소리 하나: 아이콘과 이름. 짧은 설명은 마우스를 올리면 보이고 화면 낭독기도 읽음.
 * 칸 전체가 라디오 버튼
 */
function SoundOption({
  value,
  label,
  description,
  icon: SoundIcon,
  checked,
  playing,
  onChoose,
  className,
}: SoundOptionProps) {
  const t = useTranslations("focusSound");
  return (
    <label className={cx(styles.option, className)} title={description}>
      <input
        type="radio"
        name="focus-sound"
        value={value}
        checked={checked}
        onChange={() => onChoose(value)}
        // 키보드로 옮겨 오면 칸 전체가 목록 안에 보이게 (숨긴 라디오 버튼만 보이면 칸이 잘림)
        onFocus={(e) =>
          e.currentTarget.parentElement?.scrollIntoView({ block: "nearest" })
        }
        className={styles.radio}
      />
      <SoundIcon size={22} className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.description}>{description}</span>
      </span>
      {playing ? (
        <>
          <VisuallyHidden>{t("playing")}</VisuallyHidden>
          <PlayingBars className={styles.playing} />
        </>
      ) : null}
    </label>
  );
}
