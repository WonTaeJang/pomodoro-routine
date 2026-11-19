import type { PetPose } from "./pet";
import type { TimeOfDay } from "./roomArt";

// 까미 말풍선 (I-058). 친밀도가 낮을 때는 강아지 소리만 내다가, 레벨이 오를수록
// 단어 → 짧은 문장 → 시간대 이야기 → 다정한 말로 늘어납니다. 문장은 문구 사전의 pet.speech.

export type SpeechLevel = 1 | 2 | 3 | 4 | 5;
type ByLevel = Record<`lv${SpeechLevel}`, readonly string[]>;

export type SpeechLines = {
  idle: ByLevel;
  /** Idle talk about the time of day, from level 4; sleepy sounds before. */
  time: Record<TimeOfDay | "nightSleepy", readonly string[]>;
  pat: ByLevel;
  snack: ByLevel;
  wake: ByLevel;
  home: ByLevel;
  /** Greeting when met during a break, instead of waking up. */
  rest: ByLevel;
  decorated: ByLevel;
  /** Idle talk with the whole palace set placed (I-067), one per level. */
  palace: Record<`lv${SpeechLevel}`, string>;
  /** Said once, as the new level is reached. */
  levelUp: Record<`lv${Exclude<SpeechLevel, 1>}`, string>;
  sleep: string;
};

/** What Kkami is reacting to; see `speechSituation` for the order. */
export type Situation =
  | "sleep"
  | "levelUp"
  | "wake"
  | "snack"
  | "decorated"
  | "pat"
  | "home"
  | "rest"
  | "idle";

/** Idle talk changes this often while nothing happens. */
export const IDLE_LINE_MS = 60_000;
/** How long Kkami keeps greeting after waking, or talking after a walk. */
export const WAKE_LINE_MS = 4000;
export const HOME_LINE_MS = 8000;
/** The break greeting stays a little longer: it is the reason to come. */
export const REST_LINE_MS = 8000;
/** Lines from earlier levels still come up now and then. */
export const EARLIER_LEVEL_CHANCE = 0.2;
const TIME_TALK_LEVEL = 4;

/** The strongest reason to speak wins. */
export function speechSituation({
  pose,
  levelUp,
  decorated,
  greeting,
  backHome,
  resting = false,
}: {
  pose: PetPose;
  /** A level was just reached. */
  levelUp: boolean;
  /** The happy reaction is about the room, not a pat. */
  decorated: boolean;
  /** Just woke up (WAKE_LINE_MS) or got home (HOME_LINE_MS). */
  greeting: boolean;
  backHome: boolean;
  /** On a break: the greeting is about resting together. */
  resting?: boolean;
}): Situation {
  if (pose === "sleeping") return "sleep";
  if (levelUp) return "levelUp";
  if (pose === "startled") return "wake";
  if (pose === "snacking") return "snack";
  if (pose === "happy") return decorated ? "decorated" : "pat";
  if (greeting) return resting ? "rest" : "wake";
  return backHome ? "home" : "idle";
}

export type SpeechPool = { main: string[]; earlier: string[] };

export function speechPool(
  lines: SpeechLines,
  situation: Situation,
  level: SpeechLevel,
  time: TimeOfDay,
): SpeechPool {
  if (situation === "sleep") return { main: [lines.sleep], earlier: [] };
  if (situation === "levelUp")
    // Level 1 is never reached, only started at.
    return {
      main: [lines.levelUp[`lv${level === 1 ? 2 : level}`]],
      earlier: [],
    };
  const byLevel = lines[situation];
  const main = [...byLevel[`lv${level}`]];
  if (situation === "idle") {
    if (level >= TIME_TALK_LEVEL) main.push(...lines.time[time]);
    else if (time === "night") main.push(...lines.time.nightSleepy);
  }
  const earlier: string[] = [];
  for (let below = 1; below < level; below++)
    earlier.push(...byLevel[`lv${below as SpeechLevel}`]);
  return { main, earlier };
}

/**
 * With the palace set placed, every other idle line is about it: the palace
 * line, unless it was the one just said (then null, for a usual line).
 */
export function palaceLine(
  lines: SpeechLines,
  level: SpeechLevel,
  previous: string | null,
): string | null {
  const line = lines.palace[`lv${level}`];
  return line === previous ? null : line;
}

/**
 * One line from the pool, not the one said last in this situation.
 * `random` returns [0, 1) like Math.random.
 */
export function pickLine(
  pool: SpeechPool,
  previous: string | null,
  random: () => number = Math.random,
): string {
  const useEarlier = pool.earlier.length > 0 && random() < EARLIER_LEVEL_CHANCE;
  const from = useEarlier ? pool.earlier : pool.main;
  const fresh = from.filter((line) => line !== previous);
  const list = fresh.length > 0 ? fresh : from;
  return list[Math.floor(random() * list.length)];
}
