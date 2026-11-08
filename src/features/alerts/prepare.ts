import { useTimerStore } from "@/features/timer/store";
import { unlockAudio } from "@/lib/audio";
import { requestNotificationPermission } from "./notify";

/**
 * 사용자가 시작 버튼 등을 누를 때 불러서 소리와 알림을 준비합니다.
 * (브라우저는 사용자가 누른 순간에만 소리를 깨우고 권한을 물을 수 있음)
 */
export function prepareAlerts() {
  const { settings } = useTimerStore.getState();
  if (settings.soundEnabled) unlockAudio();
  if (settings.notificationsEnabled) void requestNotificationPermission();
}
