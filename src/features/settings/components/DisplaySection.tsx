"use client";

import { FieldRow, SegmentedControl, Switch } from "@/components/ui";
import {
  setTheme,
  useThemeChoice,
  type ThemeChoice,
} from "@/features/theme/theme";
import { useTimerStore } from "@/features/timer/store";
import { SettingsSection } from "./SettingsSection";

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "기기 설정" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

/** 테마, 진행 띠 효과 */
export function DisplaySection() {
  const themeChoice = useThemeChoice() ?? "system";
  const ringEffects = useTimerStore((s) => s.settings.ringEffects);
  const update = useTimerStore.getState().updateSettings;

  return (
    <SettingsSection title="화면">
      <FieldRow label="테마">
        <SegmentedControl
          label="테마"
          options={themeOptions}
          value={themeChoice}
          onChange={(choice) => setTheme(choice === "system" ? null : choice)}
        />
      </FieldRow>
      <Switch
        label="띠 효과"
        description="10%마다 발자국 도장, 마지막 1분 빛, 집중 완료 축하"
        checked={ringEffects}
        onCheckedChange={(on) => update({ ringEffects: on })}
      />
    </SettingsSection>
  );
}
