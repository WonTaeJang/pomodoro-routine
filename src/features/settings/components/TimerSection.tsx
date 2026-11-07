"use client";

import { FieldRow, Stepper, Switch } from "@/components/ui";
import { useTimerStore } from "@/features/timer/store";
import { SettingsNote, SettingsSection } from "./SettingsSection";
import styles from "./Settings.module.scss";

const minutes = (v: number) => `${v}분`;

/** 세션 길이, 긴 휴식 주기, 자동 시작 */
export function TimerSection() {
  const settings = useTimerStore((s) => s.settings);
  const status = useTimerStore((s) => s.timer.status);
  const update = useTimerStore.getState().updateSettings;

  return (
    <SettingsSection title="타이머">
      <FieldRow label="집중">
        <Stepper
          className={styles.stepper}
          label="집중 시간"
          value={settings.focusMinutes}
          min={5}
          max={90}
          step={5}
          format={minutes}
          onChange={(focusMinutes) => update({ focusMinutes })}
        />
      </FieldRow>
      <FieldRow label="짧은 휴식">
        <Stepper
          className={styles.stepper}
          label="짧은 휴식 시간"
          value={settings.shortBreakMinutes}
          min={1}
          max={30}
          format={minutes}
          onChange={(shortBreakMinutes) => update({ shortBreakMinutes })}
        />
      </FieldRow>
      <FieldRow label="긴 휴식">
        <Stepper
          className={styles.stepper}
          label="긴 휴식 시간"
          value={settings.longBreakMinutes}
          min={5}
          max={60}
          step={5}
          format={minutes}
          onChange={(longBreakMinutes) => update({ longBreakMinutes })}
        />
      </FieldRow>
      <FieldRow
        label="긴 휴식 주기"
        description={`집중을 ${settings.longBreakInterval}번 마치면 긴 휴식`}
      >
        <Stepper
          className={styles.stepper}
          label="긴 휴식 주기"
          value={settings.longBreakInterval}
          min={2}
          max={8}
          format={(v) => `${v}회`}
          onChange={(longBreakInterval) => update({ longBreakInterval })}
        />
      </FieldRow>
      <Switch
        label="휴식 자동 시작"
        description="집중이 끝나면 휴식을 바로 시작해요"
        checked={settings.autoStartBreaks}
        onCheckedChange={(autoStartBreaks) => update({ autoStartBreaks })}
      />
      <Switch
        label="집중 자동 시작"
        description="휴식이 끝나면 다음 집중을 바로 시작해요"
        checked={settings.autoStartFocus}
        onCheckedChange={(autoStartFocus) => update({ autoStartFocus })}
      />
      {settings.testDurationSeconds ? (
        <SettingsNote>
          테스트 모드가 켜져 있어서 모든 세션이 {settings.testDurationSeconds}
          초로 진행돼요.
        </SettingsNote>
      ) : status !== "idle" ? (
        <SettingsNote>
          바꾼 시간은 지금 세션이 끝난 뒤 다음 세션부터 적용돼요.
        </SettingsNote>
      ) : null}
    </SettingsSection>
  );
}
