/**
 * 맞추기 한 번(run)을 겹치지 않게 돌립니다. 도는 중에 또 요청하면 끝난 뒤 한 번 더 돌림
 * (그 사이 생긴 변경도 올리게). stop() 뒤로는 돌리지 않습니다.
 * run은 실패해도 던지지 않고 false를 돌려줘야 합니다.
 */
export function createRunner(
  run: (refresh: boolean, isStopped: () => boolean) => Promise<boolean>,
) {
  let running: Promise<boolean> | null = null;
  let queued: { refresh: boolean } | null = null;
  let stopped = false;
  const isStopped = () => stopped;

  function sync({ refresh = false } = {}): Promise<boolean> {
    if (stopped) return Promise.resolve(false);
    if (running) {
      queued = { refresh: refresh || queued?.refresh === true };
      return running;
    }
    running = run(refresh, isStopped).finally(() => {
      running = null;
      if (queued) {
        const next = queued;
        queued = null;
        void sync(next);
      }
    });
    return running;
  }

  return {
    sync,
    /** 그만 맞춥니다 (로그아웃, 계정 바꿈). 응답을 기다리던 중이어도 그 뒤 결과는 버림 */
    stop: () => {
      stopped = true;
      queued = null;
    },
  };
}

export type Runner = ReturnType<typeof createRunner>;
