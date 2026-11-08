import { prepareAlerts } from "@/features/alerts";
import { prepareFocusSound } from "@/features/focus-sound";
import { useTimerStore } from "./store";

/**
 * 사용자가 시작(또는 다시 시작)을 누를 때 쓰는 동작.
 * 누른 순간에 소리(알림, 집중 소리)를 깨우고 알림 권한을 물은 뒤 타이머를 시작합니다.
 * (시작 버튼, 완료 팝업의 다음 세션 버튼, 단축키에서 함께 씀)
 */
export function startSession() {
  prepareAlerts();
  prepareFocusSound();
  useTimerStore.getState().start();
}
