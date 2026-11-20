import type { Prop, Props } from "./scene";

// 키프레임과 동작(clip). 도트가 번지지 않도록 기본은 다음 키까지 값을 그대로 유지(hold)하고,
// 풍경처럼 일정하게 미끄러지는 것만 직선(linear)으로 잇되 프레임 단위로 끊어 셉니다.

/** A value from this frame on (frames at the clip's fps). */
export type Key = readonly [frame: number, value: number];
export type Track = {
  node: string;
  prop: Prop;
  keys: readonly Key[];
  /** Straight between keys instead of holding each one. */
  linear: boolean;
};
export type Clip = {
  fps: number;
  /** Length in frames. A clip that does not loop holds its last frame. */
  frames: number;
  loop: boolean;
  tracks: readonly Track[];
  /** Frames where the drawing can change, in order: nothing changes between. */
  changes: readonly number[];
};
/** What clips set on nodes, by node id: anything not set keeps the scene's value. */
export type Pose = Map<string, Partial<Props>>;

/** Keys for one node: `{ y: [[0, 164], [16, 160]] }`. */
export function keys(
  node: string,
  props: Partial<Record<Prop, readonly Key[]>>,
  interpolation: "hold" | "linear" = "hold",
): Track[] {
  return Object.entries(props).map(([prop, list]) => {
    const sorted = [...list!].sort((a, b) => a[0] - b[0]);
    return {
      node,
      prop: prop as Prop,
      keys: sorted,
      linear: interpolation === "linear",
    };
  });
}

export function clip(
  {
    fps,
    frames,
    loop = false,
  }: { fps: number; frames: number; loop?: boolean },
  ...tracks: readonly (Track | readonly Track[])[]
): Clip {
  if (!(fps > 0) || !Number.isInteger(frames) || frames < 1)
    throw new Error(`Bad clip timing: ${fps} fps, ${frames} frames`);
  const all = tracks.flat();
  const changes = new Set<number>();
  for (const { keys, linear } of all) {
    if (!linear) for (const [frame] of keys) changes.add(frame);
    else
      for (let frame = keys[0][0]; frame <= keys[keys.length - 1][0]; frame++)
        changes.add(frame);
  }
  return {
    fps,
    frames,
    loop,
    tracks: all,
    changes: [...changes].sort((a, b) => a - b),
  };
}

/** The clip's length in whole milliseconds (when the next one starts). */
export const clipMs = ({ frames, fps }: Clip) =>
  Math.round((frames * 1000) / fps);

/** The frame showing `ms` into a clip: looped, or held at the end. */
export function frameAt({ fps, frames, loop }: Clip, ms: number): number {
  // A hair of slack, so 3000 ms at 12 fps is frame 36 and not 35.999….
  const frame = Math.floor((Math.max(0, ms) * fps) / 1000 + 1e-6);
  return loop ? frame % frames : Math.min(frame, frames);
}

/**
 * The last frame at or before `frame` where the clip changed: two frames
 * with the same answer look the same, so the second is not redrawn.
 */
export function lastChange({ changes }: Clip, frame: number): number {
  let low = 0;
  let high = changes.length - 1;
  let found = 0;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (changes[middle] <= frame) {
      found = changes[middle];
      low = middle + 1;
    } else high = middle - 1;
  }
  return found;
}

/** A track's value at a frame: the last key reached, or a straight line between keys. */
export function sample({ keys, linear }: Track, frame: number): number {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, value] = keys[i];
    if (frame < at) {
      const [from, start] = keys[i - 1];
      return linear
        ? start + ((value - start) * (frame - from)) / (at - from)
        : start;
    }
  }
  return keys[keys.length - 1][1];
}

function set(pose: Pose, node: string, prop: Prop, value: number) {
  const props = pose.get(node);
  if (props) props[prop] = value;
  else pose.set(node, { [prop]: value });
}

/** Lay a clip's values at a frame over `pose`. */
export function applyClip(pose: Pose, { tracks }: Clip, frame: number): Pose {
  for (const track of tracks)
    set(pose, track.node, track.prop, sample(track, frame));
  return pose;
}

/** A pose's own copy, to change without touching the original. */
export const copyPose = (pose: Pose): Pose =>
  new Map([...pose].map(([id, props]) => [id, { ...props }]));

/** A value the page sets directly on a node, outside any clip. */
export type Override = [node: string, props: Partial<Props>];

/** Show one node of a set and hide the rest (an outfit, a sky). */
export const showOnly = (
  ids: readonly string[],
  shown: string | null,
): Override[] => ids.map((id) => [id, { opacity: id === shown ? 1 : 0 }]);

/** Set values directly, as the page's switches do (outfits, time of day). */
export function override(pose: Pose, values: Iterable<Override>): Pose {
  for (const [node, props] of values)
    for (const [prop, value] of Object.entries(props))
      set(pose, node, prop as Prop, value);
  return pose;
}

/** The clip of a sequence showing `ms` in, and how far into it. */
function sequenceAt(sequence: readonly Clip[], ms: number) {
  let start = 0;
  for (const [index, part] of sequence.entries()) {
    const length = clipMs(part);
    if (ms < start + length || index === sequence.length - 1)
      return { index, frame: frameAt(part, ms - start) };
    start += length;
  }
  throw new Error("Empty sequence");
}

/**
 * Clips played one after another, each starting when the previous one ends.
 * Earlier clips leave their last values: a value stays until a clip sets it.
 */
export function applySequence(
  pose: Pose,
  sequence: readonly Clip[],
  ms: number,
): Pose {
  const { index, frame } = sequenceAt(sequence, ms);
  for (const done of sequence.slice(0, index))
    applyClip(pose, done, done.frames);
  return applyClip(pose, sequence[index], frame);
}

/** Which clip of a sequence shows and its last change, as "clip:frame". */
export function sequenceFrame(sequence: readonly Clip[], ms: number): string {
  const { index, frame } = sequenceAt(sequence, ms);
  return `${index}:${lastChange(sequence[index], frame)}`;
}

/** When each clip of a sequence starts, in ms. */
export function sequenceStarts(sequence: readonly Clip[]): number[] {
  let start = 0;
  return sequence.map((part) => {
    const at = start;
    start += clipMs(part);
    return at;
  });
}
