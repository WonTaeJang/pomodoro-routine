import type { KeyboardEvent } from "react";

/** Space/Enter on a care control acts on it only, not on page-wide shortcuts. */
export function stopCareKey(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " " || event.key === "Enter") event.stopPropagation();
}
