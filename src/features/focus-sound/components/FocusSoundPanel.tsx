"use client";

import { Slider } from "@/components/ui";
import { useFocusRunning } from "@/features/timer/hooks";
import { useTimerStore } from "@/features/timer/store";
import { cx } from "@/lib/cx";
import { previewFocusSound, setPreviewVolume, stopPreview } from "../player";
import {
  FOCUS_SOUND_GROUPS,
  FOCUS_SOUNDS,
  type FocusSoundSetting,
} from "../sounds";
import styles from "./FocusSoundPanel.module.scss";

/** 집중 소리 고르기, 크기. 집중 중이 아닐 때 고르면 잠깐 미리 들려줍니다. */
export function FocusSoundPanel() {
  const sound = useTimerStore((s) => s.settings.focusSound);
  const volume = useTimerStore((s) => s.settings.focusSoundVolume);
  const focusing = useFocusRunning();
  const update = useTimerStore.getState().updateSettings;

  function choose(value: FocusSoundSetting) {
    update({ focusSound: value });
    if (value === "off") stopPreview();
    else if (!focusing) previewFocusSound(value, volume);
  }

  return (
    <div className={styles.panel}>
      <div>
        <h2 className={styles.title}>집중 소리</h2>
        <p className={styles.hint}>
          집중할 때만 들려요.
          {focusing ? null : " 고르면 미리 들려줘요."}
        </p>
      </div>

      <fieldset className={styles.options}>
        <legend className={styles.legend}>소리 종류</legend>
        <SoundOption
          value="off"
          label="끄기"
          description="소리 없이 집중"
          checked={sound === "off"}
          onChoose={choose}
          className={styles.off}
        />
        {FOCUS_SOUND_GROUPS.map(({ title, ids }) => (
          <div key={title} className={styles.group}>
            <p className={styles.groupTitle}>{title}</p>
            <div className={styles.grid}>
              {ids.map((id) => (
                <SoundOption
                  key={id}
                  value={id}
                  label={FOCUS_SOUNDS[id].label}
                  description={FOCUS_SOUNDS[id].description}
                  checked={sound === id}
                  onChoose={choose}
                />
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <Slider
        label="소리 크기"
        value={Math.round(volume * 100)}
        onChange={(value) => {
          update({ focusSoundVolume: value / 100 });
          setPreviewVolume(value / 100);
        }}
        format={(value) => `${value}%`}
        disabled={sound === "off"}
      />
    </div>
  );
}

type SoundOptionProps = {
  value: FocusSoundSetting;
  label: string;
  description: string;
  checked: boolean;
  onChoose: (value: FocusSoundSetting) => void;
  className?: string;
};

/** 소리 하나 (이름 + 짧은 설명). 칸 전체가 라디오 버튼 */
function SoundOption({
  value,
  label,
  description,
  checked,
  onChoose,
  className,
}: SoundOptionProps) {
  return (
    <label className={cx(styles.option, className)}>
      <input
        type="radio"
        name="focus-sound"
        value={value}
        checked={checked}
        onChange={() => onChoose(value)}
        className={styles.radio}
      />
      <span className={styles.label}>{label}</span>
      <span className={styles.description}>{description}</span>
    </label>
  );
}
