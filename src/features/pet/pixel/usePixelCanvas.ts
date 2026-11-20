"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePageVisible } from "@/lib/usePageVisible";
import { drawScene } from "./render";
import type { Scene } from "./scene";
import type { Pose } from "./timeline";

// 캔버스에 장면을 그리는 재생기. 화면 갱신마다 시간을 넘기되, 그림이 실제로 바뀔 때만
// 다시 칠합니다. 탭이 숨으면 멈추고, 돌아와도 건너뛰지 않습니다.
// 캔버스는 CSS 크기 × 기기 픽셀 배율로 잡아 도트가 흐려지지 않습니다.

/** What a canvas plays: moved on by the player, drawn when its key changes. */
export interface Animation {
  /** Move on by `ms`; 0 applies changes (inputs, outfits) without moving. */
  advance(ms: number): void;
  /** Changes whenever the drawing would: until then nothing is redrawn. */
  frameKey(): string;
  pose(): Pose;
  /** Moving on its own; when false it is drawn only after `refresh()`. */
  playing(): boolean;
}

/**
 * Long gaps between frames (a busy tab) do not jump ahead. The walk's trip
 * clock steps the same way, so the two stay together (useWalkTrip).
 */
export const MAX_STEP_MS = 100;

/**
 * The canvas size in device pixels, so one canvas pixel is one screen pixel.
 * The browser's exact count is used when it agrees with CSS size × pixel
 * ratio (some emulated screens report CSS pixels there).
 */
function devicePixels(entry: ResizeObserverEntry): [number, number] {
  const ratio = window.devicePixelRatio || 1;
  const width = entry.contentRect.width * ratio;
  const height = entry.contentRect.height * ratio;
  const exact = entry.devicePixelContentBoxSize?.[0];
  if (
    exact &&
    Math.abs(exact.inlineSize - width) <= 1 &&
    Math.abs(exact.blockSize - height) <= 1
  )
    return [exact.inlineSize, exact.blockSize];
  return [Math.round(width), Math.round(height)];
}

/**
 * Play `animation` on a canvas sized by CSS. While it is playing and the tab
 * is visible it moves on with every screen refresh; otherwise it is drawn
 * once after each `refresh()`, as for reduced motion or a paused scene.
 */
export function usePixelCanvas(scene: Scene, animation: Animation) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [failed, setFailed] = useState(false);
  const visible = usePageVisible();
  const visibleNow = useRef(visible);
  // Draw once more soon (set by the effect below, which owns the loop).
  const refreshNow = useRef<() => void>(() => {});

  // Back in view: carry on from where it stopped.
  useEffect(() => {
    visibleNow.current = visible;
    if (visible) refreshNow.current();
  }, [visible]);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    let frame = 0;
    let last: number | null = null;
    let shownKey: string | null = null;
    let sized = false;
    let firstDraw = true;

    const draw = () => {
      if (!sized) return;
      const key = animation.frameKey();
      if (key === shownKey) return;
      shownKey = key;
      drawScene(ctx, scene, animation.pose(), canvas.width / scene.width);
      if (firstDraw) {
        firstDraw = false;
        setDrawn(true);
      }
    };
    const tick = (now: number) => {
      frame = 0;
      const live = visibleNow.current && animation.playing();
      const step =
        live && last !== null ? Math.min(now - last, MAX_STEP_MS) : 0;
      last = live ? now : null;
      animation.advance(step);
      draw();
      if (live) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    refreshNow.current = schedule;

    const resize = (entry: ResizeObserverEntry) => {
      const [width, height] = devicePixels(entry);
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      sized = true;
      shownKey = null; // resizing clears the canvas
      schedule();
    };
    const observer = new ResizeObserver(([entry]) => resize(entry));
    const observe = () => {
      try {
        // Also reports zoom (a new pixel ratio) where browsers support it.
        observer.observe(canvas, { box: "device-pixel-content-box" });
      } catch {
        observer.observe(canvas);
      }
    };
    // Elsewhere, zoom shows as a new resolution: measure again.
    let ratio: MediaQueryList | null = null;
    const watchRatio = () => {
      ratio?.removeEventListener("change", onRatio);
      ratio = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      ratio.addEventListener("change", onRatio);
    };
    const onRatio = () => {
      observer.unobserve(canvas);
      observe();
      watchRatio();
    };
    observe();
    watchRatio();
    schedule();
    return () => {
      ratio?.removeEventListener("change", onRatio);
      observer.disconnect();
      cancelAnimationFrame(frame);
      refreshNow.current = () => {};
    };
  }, [canvas, scene, animation]);

  /** Apply changes made to the animation, even while it is not playing. */
  const refresh = useCallback(() => refreshNow.current(), []);
  return { bindCanvas: setCanvas, drawn, failed, refresh };
}
