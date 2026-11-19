import { useEffect, useRef, useState } from "react";
import { useHistoryStore } from "@/features/history/store";
import type { CompletedSession } from "@/features/timer/types";
import { STORAGE_KEYS } from "@/lib/storage";
import { useStoresReady } from "@/lib/useHydrateStores";

/**
 * 발바닥 도장 (I-066): 한 사이클을 마칠 때마다 하나. 수료증과 같은 조건이라
 * 따로 저장하지 않고 집중 기록에서 셉니다 (사이클 완료 표시가 붙은 집중 수 = 수료증 수).
 * 집중 기록은 계정에도 저장되므로 다른 기기에서 마친 사이클도 들어오고, 두 번 세지 않습니다.
 */
export function stampsEarned(sessions: readonly CompletedSession[]): number {
  return sessions.filter((s) => s.mode === "focus" && s.cycleCompleted).length;
}

/** 아이템 상자에서 확인한 도장 수 (이 브라우저). 더 많이 받았으면 아이템 버튼에 빨간 점 */
export function readStampsSeen(): number {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEYS.stampsSeen));
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function writeStampsSeen(count: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.stampsSeen, String(count));
  } catch {
    // 저장하지 못하면 다음에 빨간 점이 한 번 더 보일 뿐
  }
}

/** 로그아웃: 다른 계정으로 들어와도 섞이지 않게 */
export function clearStampsSeen() {
  try {
    localStorage.removeItem(STORAGE_KEYS.stampsSeen);
  } catch {
    // 지우지 못해도 확인한 수가 많아 빨간 점이 안 보일 뿐
  }
}

/**
 * 받은 도장 수, 아직 확인하지 않았는지, 확인하기.
 * onEarn: 보고 있는 동안 도장을 새로 받으면 (이 탭이든 다른 탭이든) 받은 만큼 한 번
 */
export function useStamps(onEarn?: () => void) {
  const ready = useStoresReady();
  const earned = useHistoryStore((s) => stampsEarned(s.sessions));
  const [seen, setSeen] = useState(() =>
    typeof window === "undefined" ? 0 : readStampsSeen(),
  );
  const before = useRef<number | null>(null);
  const earn = useRef(onEarn);
  useEffect(() => {
    earn.current = onEarn;
  }, [onEarn]);
  useEffect(() => {
    if (!ready) return;
    const last = before.current;
    before.current = earned;
    if (last !== null && earned > last) earn.current?.();
  }, [ready, earned]);
  return {
    earned: ready ? earned : 0,
    unseen: ready && earned > seen,
    see() {
      if (!ready || earned <= seen) return;
      writeStampsSeen(earned);
      setSeen(earned);
    },
  };
}
