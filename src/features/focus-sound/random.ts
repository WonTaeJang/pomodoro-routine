import { seededRandom } from "@/lib/random";
import { FOCUS_SOUND_IDS, type FocusSoundId } from "./sounds";

/**
 * "랜덤"일 때 n번째 집중(0부터)에 틀 소리.
 * 모든 소리를 한 번씩 섞은 묶음을 차례로 써서 골고루 나오고, 바로 앞 집중과 같은 소리는 나오지 않습니다.
 * n만 같으면 늘 같은 소리라서, 새로고침하거나 탭을 여러 개 열어도 한 집중 안에서는 소리가 바뀌지 않습니다.
 */
export function randomFocusSound(
  index: number,
  ids: readonly FocusSoundId[] = FOCUS_SOUND_IDS,
): FocusSoundId {
  const n = Math.max(0, Math.floor(index));
  const round = Math.floor(n / ids.length);
  return shuffledRound(round, ids)[n % ids.length];
}

/** round번째 묶음: 모든 소리를 섞은 순서. 앞 묶음의 마지막과 첫 소리가 같으면 첫 두 개를 바꿈 */
function shuffledRound(
  round: number,
  ids: readonly FocusSoundId[],
): FocusSoundId[] {
  const order = shuffle(ids, round);
  if (round > 0 && ids.length > 1) {
    const previousLast = shuffle(ids, round - 1).at(-1);
    if (order[0] === previousLast) [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

/** seed마다 늘 같은 순서로 섞음 (Fisher–Yates) */
function shuffle(ids: readonly FocusSoundId[], seed: number): FocusSoundId[] {
  const random = seededRandom(seed * 7919 + 17);
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
