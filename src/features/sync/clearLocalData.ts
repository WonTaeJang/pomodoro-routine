import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { useTimerStore } from "@/features/timer/store";
import { clearSyncMemory } from "./memory";

/**
 * 로그아웃하면 이 브라우저의 할 일·집중 기록·타이머와 계정 맞추기 기억을 지웁니다.
 * 계정에는 그대로 남아 있고, 다시 로그인하면 받아옵니다. 다른 계정으로 로그인해도 섞이지 않게 하려는 것.
 * 설정(시간, 소리 등)·테마·언어·첫 방문 안내는 브라우저 설정이라 남기고,
 * 돌봄 기록은 아직 계정에 저장하지 않으므로 남깁니다.
 * 아직 계정에 올리지 못한 변경이 있어도 지웁니다 (사용자 결정).
 */
export function clearLocalAccountData() {
  useTasksStore.getState().clearAll();
  useHistoryStore.getState().clear();
  useTimerStore.getState().resetTimer();
  clearSyncMemory();
}
