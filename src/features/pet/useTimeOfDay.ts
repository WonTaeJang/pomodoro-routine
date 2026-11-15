"use client";

import { useSyncExternalStore } from "react";
import {
  TIME_STARTS,
  msUntilNextTime,
  timeOfDay,
  type TimeOfDay,
} from "./roomArt";

// Development only: preview another time of day with ?time=dusk.
function previewTime(): TimeOfDay | null {
  if (process.env.NODE_ENV === "production") return null;
  const time = new URLSearchParams(window.location.search).get("time");
  return time && time in TIME_STARTS ? (time as TimeOfDay) : null;
}

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    // A second late, so the new hour has surely begun.
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      msUntilNextTime(new Date()) + 1000,
    );
  };
  schedule();
  // Timers sleep with the device: check again when the page comes back.
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** The time of day on the device clock. Server rendering assumes day. */
export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(
    subscribe,
    () => previewTime() ?? timeOfDay(new Date()),
    () => "day",
  );
}
