/** The walk scene. Fetched once in the background while Kkami is home. */
export const WALK_SRC = "/rive/kkami-walk.riv";

let pending: Promise<void> | null = null;
let buffer: ArrayBuffer | null = null;

/**
 * Start downloading the walk scene so the first walk needs no download.
 * Safe to call repeatedly; a failed download is tried again next time.
 */
export function preloadWalk(): void {
  if (pending || buffer) return;
  pending = fetch(WALK_SRC)
    .then((response) => {
      if (!response.ok) throw new Error(`Walk scene: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => {
      buffer = data;
    })
    .catch(() => {
      // The walk falls back to loading the file itself, with its own error.
    })
    .finally(() => {
      pending = null;
    });
}

/** A copy of the downloaded scene for one walk, or null if not ready yet. */
export function preloadedWalk(): ArrayBuffer | null {
  return buffer && buffer.slice(0);
}

/** Tests only: forget the download. */
export function resetPreloadedWalk(): void {
  pending = null;
  buffer = null;
}
