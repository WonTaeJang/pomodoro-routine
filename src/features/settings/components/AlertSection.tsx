"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { PlayIcon } from "@/components/icons";
import { Button, Section, Slider, Switch } from "@/components/ui";
import {
  getNotificationStatus,
  previewAlertSound,
  requestNotificationPermission,
  type NotificationStatus,
} from "@/features/alerts";
import { useTimerStore } from "@/features/timer/store";
import { unlockAudio } from "@/lib/audio";
import styles from "./Settings.module.scss";

/** 알림 권한 상태별 설명 문구 (settings.alerts.notifications.<값>) */
const NOTIFICATION_DESCRIPTIONS = {
  default: "available",
  granted: "available",
  denied: "denied",
  unsupported: "unsupported",
} as const satisfies Record<NotificationStatus, string>;

/** 알림 소리, 소리 크기, 브라우저 알림 */
export function AlertSection() {
  const settings = useTimerStore((s) => s.settings);
  const update = useTimerStore.getState().updateSettings;
  const t = useTranslations("settings.alerts");
  const common = useTranslations("common");
  // 설정 창은 화면이 뜬 뒤에만 열리므로 처음 값을 바로 읽어도 됨
  const [permission, setPermission] = useState(getNotificationStatus);
  const volume = Math.round(settings.soundVolume * 100);
  // 브라우저에서 막혀 있으면 켜도 알림이 오지 않으므로 꺼진 것으로 보여줌
  const notificationsBlocked =
    permission === "denied" || permission === "unsupported";

  return (
    <Section title={t("title")} headingLevel={3}>
      <Switch
        label={t("sound.label")}
        description={t("sound.description")}
        checked={settings.soundEnabled}
        onCheckedChange={(soundEnabled) => {
          // 켜는 순간(사용자가 누른 순간)에 오디오를 깨워야 소리가 남
          if (soundEnabled) unlockAudio();
          update({ soundEnabled });
        }}
      />
      <div className={styles.volume}>
        <Slider
          label={common("volume")}
          className={styles.volumeSlider}
          value={volume}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          disabled={!settings.soundEnabled}
          onChange={(v) => update({ soundVolume: v / 100 })}
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<PlayIcon size={14} />}
          disabled={!settings.soundEnabled || volume === 0}
          onClick={() => previewAlertSound(settings.soundVolume)}
        >
          {t("preview")}
        </Button>
      </div>
      <Switch
        label={t("notifications.label")}
        description={t(
          `notifications.${NOTIFICATION_DESCRIPTIONS[permission]}`,
        )}
        checked={settings.notificationsEnabled && !notificationsBlocked}
        disabled={notificationsBlocked}
        onCheckedChange={async (notificationsEnabled) => {
          update({ notificationsEnabled });
          if (notificationsEnabled) {
            setPermission(await requestNotificationPermission());
          }
        }}
      />
    </Section>
  );
}
