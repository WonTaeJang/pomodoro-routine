/**
 * 맞추기 한 번(run)을 겹치지 않게 돌립니다. 도는 중에 또 요청하면 끝난 뒤 한 번 더 돌림
 * (그 사이 생긴 변경도 올리게). run이 오류를 던지면(인터넷이 끊김, 서버 오류) false로 끝나고,
 * 브라우저 쪽 값은 그대로이므로 다음에 부르면 못 한 것부터 다시 합니다. stop() 뒤로는 돌리지 않음.
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
    running = run(refresh, isStopped)
      .catch(() => false)
      .finally(() => {
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
    /** 맞춥니다. refresh면 서버에서 다시 받음. 성공하면 true */
    sync,
    /** 그만 맞춥니다 (로그아웃, 계정 바꿈). 응답을 기다리던 중이어도 그 뒤 결과는 버림 */
    stop: () => {
      stopped = true;
      queued = null;
    },
  };
}

export type Runner = ReturnType<typeof createRunner>;
