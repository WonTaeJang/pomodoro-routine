"use client";

import { useTranslations } from "use-intl";
import { FieldRow, Section, Stepper, Switch } from "@/components/ui";
import { useTimerStore } from "@/features/timer/store";
import type { TimerMode, TimerSettings } from "@/features/timer/types";
import { SettingsNote } from "./SettingsNote";
import styles from "./Settings.module.scss";

/** 시간 설정 이름 (focusMinutes 등) */
type MinutesKey = Extract<keyof TimerSettings, `${string}Minutes`>;

/** 모드별 시간 조절 범위 (분) */
const LENGTHS: {
  mode: TimerMode;
  key: MinutesKey;
  min: number;
  max: number;
  step: number;
}[] = [
  { mode: "focus", key: "focusMinutes", min: 5, max: 90, step: 5 },
  { mode: "short-break", key: "shortBreakMinutes", min: 1, max: 30, step: 1 },
  { mode: "long-break", key: "longBreakMinutes", min: 5, max: 60, step: 5 },
];

/** 세션 길이, 긴 휴식 주기, 자동 시작 */
export function TimerSection() {
  const settings = useTimerStore((s) => s.settings);
  const status = useTimerStore((s) => s.timer.status);
  const update = useTimerStore.getState().updateSettings;
  const t = useTranslations("settings.timer");
  const modes = useTranslations("timer.modes");
  const minutes = (value: number) => t("minutes", { value });

  return (
    <Section title={t("title")} headingLevel={3}>
      {LENGTHS.map(({ mode, key, min, max, step }) => (
        <FieldRow key={mode} label={modes(mode)}>
          <Stepper
            className={styles.stepper}
            label={t(`length.${mode}`)}
            value={settings[key]}
            min={min}
            max={max}
            step={step}
            format={minutes}
            onChange={(value) => update({ [key]: value })}
          />
        </FieldRow>
      ))}
      <FieldRow
        label={t("interval.label")}
        description={t("interval.description", {
          count: settings.longBreakInterval,
        })}
      >
        <Stepper
          className={styles.stepper}
          label={t("interval.label")}
          value={settings.longBreakInterval}
          min={2}
          max={8}
          format={(value) => t("interval.value", { value })}
          onChange={(longBreakInterval) => update({ longBreakInterval })}
        />
      </FieldRow>
      <Switch
        label={t("autoStartBreaks.label")}
        description={t("autoStartBreaks.description")}
        checked={settings.autoStartBreaks}
        onCheckedChange={(autoStartBreaks) => update({ autoStartBreaks })}
      />
      <Switch
        label={t("autoStartFocus.label")}
        description={t("autoStartFocus.description")}
        checked={settings.autoStartFocus}
        onCheckedChange={(autoStartFocus) => update({ autoStartFocus })}
      />
      {settings.testDurationSeconds ? (
        <SettingsNote>
          {t("testMode", { seconds: settings.testDurationSeconds })}
        </SettingsNote>
      ) : status !== "idle" ? (
        <SettingsNote>{t("appliesNext")}</SettingsNote>
      ) : null}
    </Section>
  );
}
