"use client";

import { FieldRow, Section, SegmentedControl, Switch } from "@/components/ui";
import {
  setTheme,
  useThemeChoice,
  type ThemeChoice,
} from "@/features/theme/theme";
import { useTimerStore } from "@/features/timer/store";
import { isWakeLockSupported } from "@/lib/useWakeLock";

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "기기 설정" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

/** 테마, 진행 띠 효과, 화면 켜두기 */
export function DisplaySection() {
  const themeChoice = useThemeChoice() ?? "system";
  const ringEffects = useTimerStore((s) => s.settings.ringEffects);
  const keepScreenOn = useTimerStore((s) => s.settings.keepScreenOn);
  // 설정 창은 화면이 뜬 뒤에만 열리므로 바로 확인해도 됨
  const wakeLockSupported = isWakeLockSupported();
  const update = useTimerStore.getState().updateSettings;

  return (
    <Section title="화면" headingLevel={3}>
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
      <Switch
        label="화면 켜두기"
        description={
          wakeLockSupported
            ? "타이머가 도는 동안 화면이 꺼지지 않게 해요"
            : "이 브라우저는 화면 켜두기를 지원하지 않아요"
        }
        checked={keepScreenOn && wakeLockSupported}
        disabled={!wakeLockSupported}
        onCheckedChange={(on) => update({ keepScreenOn: on })}
      />
    </Section>
  );
}
