"use client";

import { useTranslations } from "use-intl";
import { FieldRow, Section, Stepper, Switch } from "@/components/ui";
import { useTimerStore } from "@/features/timer/store";
import { SETTING_RANGES } from "@/features/timer/timer";
import type { TimerMode, TimerSettings } from "@/features/timer/types";
import { SettingsNote } from "./SettingsNote";
import styles from "./Settings.module.scss";

/** 시간 설정 이름 (focusMinutes 등) */
type MinutesKey = Extract<keyof TimerSettings, `${string}Minutes`>;

/** 모드별 시간 설정 (조절 범위는 SETTING_RANGES) */
const LENGTHS: { mode: TimerMode; key: MinutesKey }[] = [
  { mode: "focus", key: "focusMinutes" },
  { mode: "short-break", key: "shortBreakMinutes" },
  { mode: "long-break", key: "longBreakMinutes" },
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
      {LENGTHS.map(({ mode, key }) => (
        <FieldRow key={mode} label={modes(mode)}>
          <Stepper
            className={styles.stepper}
            label={t(`length.${mode}`)}
            value={settings[key]}
            min={SETTING_RANGES[key].min}
            max={SETTING_RANGES[key].max}
            step={SETTING_RANGES[key].step}
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
          min={SETTING_RANGES.longBreakInterval.min}
          max={SETTING_RANGES.longBreakInterval.max}
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
