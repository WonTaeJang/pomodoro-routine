"use client";

import { useLocale, useTranslations } from "use-intl";
import { FieldRow, Section, SegmentedControl, Switch } from "@/components/ui";
import {
  setTheme,
  useThemeChoice,
  type ThemeChoice,
} from "@/features/theme/theme";
import { useTimerStore } from "@/features/timer/store";
import { LOCALE_NAMES, LOCALES, setLocale } from "@/i18n";
import { isWakeLockSupported } from "@/lib/useWakeLock";

const THEMES: ThemeChoice[] = ["system", "light", "dark"];

/** 언어 이름은 어느 화면에서든 그 언어로 ("한국어", "English") */
const localeOptions = LOCALES.map((value) => ({
  value,
  label: LOCALE_NAMES[value],
}));

/** 언어, 테마, 진행 띠 효과, 화면 켜두기 */
export function DisplaySection() {
  const themeChoice = useThemeChoice() ?? "system";
  const ringEffects = useTimerStore((s) => s.settings.ringEffects);
  const keepScreenOn = useTimerStore((s) => s.settings.keepScreenOn);
  // 설정 창은 화면이 뜬 뒤에만 열리므로 바로 확인해도 됨
  const wakeLockSupported = isWakeLockSupported();
  const update = useTimerStore.getState().updateSettings;
  const t = useTranslations("settings.display");
  const locale = useLocale();
  const themeOptions = THEMES.map((value) => ({
    value,
    label: t(`theme.${value}`),
  }));

  return (
    <Section title={t("title")} headingLevel={3}>
      <FieldRow label={t("language")}>
        <SegmentedControl
          label={t("language")}
          options={localeOptions}
          value={locale}
          onChange={setLocale}
        />
      </FieldRow>
      <FieldRow label={t("theme.label")}>
        <SegmentedControl
          label={t("theme.label")}
          options={themeOptions}
          value={themeChoice}
          onChange={(choice) => setTheme(choice === "system" ? null : choice)}
        />
      </FieldRow>
      <Switch
        label={t("ringEffects.label")}
        description={t("ringEffects.description")}
        checked={ringEffects}
        onCheckedChange={(on) => update({ ringEffects: on })}
      />
      <Switch
        label={t("keepScreenOn.label")}
        description={t(
          wakeLockSupported
            ? "keepScreenOn.description"
            : "keepScreenOn.unsupported",
        )}
        checked={keepScreenOn && wakeLockSupported}
        disabled={!wakeLockSupported}
        onCheckedChange={(on) => update({ keepScreenOn: on })}
      />
    </Section>
  );
}
