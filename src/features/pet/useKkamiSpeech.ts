"use client";

import { useEffect, useState } from "react";
import { useLocale, useMessages } from "use-intl";
import type { Messages } from "@/i18n/messages/ko";
import type { TimeOfDay } from "./roomArt";
import {
  IDLE_LINE_MS,
  pickLine,
  speechPool,
  type Situation,
  type SpeechLevel,
  type SpeechLines,
} from "./speech";

type Said = {
  turn: string;
  line: string;
  /** The last line of each situation, so it is not said twice in a row. */
  last: Partial<Record<Situation, string>>;
};

/**
 * What Kkami says now. Each new situation picks a line once; idle talk moves
 * on every minute. Picking waits for the browser, so server and client agree.
 */
export function useKkamiSpeech(
  situation: Situation,
  level: SpeechLevel,
  time: TimeOfDay,
) {
  const locale = useLocale();
  // Whole lists, not single messages: read the dictionary directly.
  const lines: SpeechLines = (useMessages() as unknown as Messages).pet.speech;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (situation !== "idle") return;
    const timer = setInterval(() => setTick((n) => n + 1), IDLE_LINE_MS);
    return () => clearInterval(timer);
  }, [situation]);

  // A new turn picks a new line; idle turns also move on with the minute.
  const turn = `${locale}:${situation}:${level}:${time}:${situation === "idle" ? tick : ""}`;
  const [said, setSaid] = useState<Said | null>(null);
  useEffect(() => {
    queueMicrotask(() =>
      setSaid((previous) => {
        if (previous?.turn === turn) return previous;
        const line = pickLine(
          speechPool(lines, situation, level, time),
          previous?.last[situation] ?? null,
        );
        return { turn, line, last: { ...previous?.last, [situation]: line } };
      }),
    );
  }, [turn, lines, situation, level, time]);
  return said?.line ?? "";
}
