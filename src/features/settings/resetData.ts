import { resetOnboarding } from "@/features/guide";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { setTheme } from "@/features/theme/theme";
import { useTimerStore } from "@/features/timer/store";

/** 시간, 알림, 화면 설정(테마 포함)을 처음 값으로 되돌립니다. 할 일과 기록은 그대로 */
export function resetSettings() {
  useTimerStore.getState().resetSettings();
  setTheme(null);
}

/** 이 브라우저에 저장된 까모도로 데이터(설정, 타이머, 기록, 할 일, 테마)를 모두 지웁니다. 첫 방문 안내도 다시 뜨게 */
export function resetAllData() {
  useTimerStore.getState().resetAll();
  useHistoryStore.getState().clear();
  useTasksStore.getState().clearAll();
  setTheme(null);
  resetOnboarding();
}
