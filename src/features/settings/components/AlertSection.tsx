"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";
import { Button, Section, Slider, Switch } from "@/components/ui";
import {
  getNotificationStatus,
  previewAlertSound,
  requestNotificationPermission,
  unlockAudio,
  type NotificationStatus,
} from "@/features/alerts";
import { useTimerStore } from "@/features/timer/store";
import styles from "./Settings.module.scss";

const NOTIFICATION_DESCRIPTIONS: Record<NotificationStatus, string> = {
  default: "다른 탭에 있을 때 세션이 끝나면 알려줘요",
  granted: "다른 탭에 있을 때 세션이 끝나면 알려줘요",
  denied:
    "브라우저에서 알림이 차단돼 있어요. 주소창 왼쪽의 사이트 설정에서 허용해 주세요",
  unsupported: "이 브라우저는 알림을 지원하지 않아요",
};

/** 알림 소리, 소리 크기, 브라우저 알림 */
export function AlertSection() {
  const settings = useTimerStore((s) => s.settings);
  const update = useTimerStore.getState().updateSettings;
  // 설정 창은 화면이 뜬 뒤에만 열리므로 처음 값을 바로 읽어도 됨
  const [permission, setPermission] = useState(getNotificationStatus);
  const volume = Math.round(settings.soundVolume * 100);
  // 브라우저에서 막혀 있으면 켜도 알림이 오지 않으므로 꺼진 것으로 보여줌
  const notificationsBlocked =
    permission === "denied" || permission === "unsupported";

  return (
    <Section title="알림" headingLevel={3}>
      <Switch
        label="알림 소리"
        description="세션이 끝나면 종소리로 알려줘요"
        checked={settings.soundEnabled}
        onCheckedChange={(soundEnabled) => {
          // 켜는 순간(사용자가 누른 순간)에 오디오를 깨워야 소리가 남
          if (soundEnabled) unlockAudio();
          update({ soundEnabled });
        }}
      />
      <div className={styles.volume}>
        <Slider
          label="소리 크기"
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
          미리 듣기
        </Button>
      </div>
      <Switch
        label="브라우저 알림"
        description={NOTIFICATION_DESCRIPTIONS[permission]}
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
