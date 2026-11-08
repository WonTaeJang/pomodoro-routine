/**
 * 같은 seed면 항상 같은 순서로 0~1 값을 내는 난수.
 * (수료증 색종이 위치를 고정하거나, 집중 소리를 테스트에서 똑같이 만들 때)
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
