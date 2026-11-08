import { resetOnboarding } from "@/features/guide";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { setTheme } from "@/features/theme/theme";
import { useTimerStore } from "@/features/timer/store";
import { setLocale } from "@/i18n";

/**
 * 시간, 알림, 화면 설정(테마, 언어 포함)을 처음 값으로 되돌립니다. 할 일과 기록은 그대로.
 * 언어는 직접 고른 것을 지워서 브라우저 언어를 따릅니다.
 */
export function resetSettings() {
  useTimerStore.getState().resetSettings();
  setTheme(null);
  setLocale(null);
}

/** 이 브라우저에 저장된 까모도로 데이터(설정, 타이머, 기록, 할 일, 테마, 언어)를 모두 지웁니다. 첫 방문 안내도 다시 뜨게 */
export function resetAllData() {
  useTimerStore.getState().resetAll();
  useHistoryStore.getState().clear();
  useTasksStore.getState().clearAll();
  setTheme(null);
  setLocale(null);
  resetOnboarding();
}
