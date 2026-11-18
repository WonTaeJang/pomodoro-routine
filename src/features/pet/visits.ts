/**
 * 다마고치 화면에 들어온 것을 알립니다. 계정 맞추기가 이때 돌봄 기록을 정리함
 * (src/features/sync/accountSync.ts). 아직 듣는 쪽이 없으면 기억했다가 듣기 시작할 때 한 번 알림.
 */
const listeners = new Set<() => void>();
let missed = false;

export function petScreenOpened() {
  if (listeners.size === 0) {
    missed = true;
    return;
  }
  listeners.forEach((listener) => listener());
}

/** 다마고치 화면에 들어올 때마다 부릅니다. 그만 듣는 함수를 돌려줌 */
export function onPetScreenOpen(listener: () => void): () => void {
  listeners.add(listener);
  if (missed) {
    missed = false;
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
}
