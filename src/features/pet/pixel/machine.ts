import {
  applyClip,
  clipMs,
  copyPose,
  frameAt,
  type Clip,
  type Pose,
} from "./timeline";

// 상태 머신: 상태마다 동작 하나를 틀고, 페이지가 켜고 끄는 값(input)이나 한 번 보내는 신호(trigger),
// 또는 동작이 끝남에 따라 다른 상태로 넘어갑니다. 화면 없이 계산만 하므로 테스트로 확인합니다.

export type Transition<S extends string, I extends string, T extends string> =
  | { to: S; when: (inputs: Readonly<Record<I, boolean>>) => boolean }
  | { to: S; trigger: T }
  /** When a clip that does not loop has played to its end. */
  | { to: S; atEnd: true };

export type MachineDef<
  S extends string,
  I extends string,
  T extends string = never,
> = {
  initial: S;
  /** Transitions are tried in order; the first that applies wins. */
  states: Record<
    S,
    { clip: Clip; transitions: readonly Transition<S, I, T>[] }
  >;
};

export type MachineRun<S extends string> = {
  state: S;
  /** Time in the current state, in ms. */
  elapsed: number;
  /** Values left by earlier states, under the current clip. */
  carried: Pose;
};

/** Enough for any chain of instant transitions in one step. */
const MAX_CHAIN = 8;

export function startMachine<S extends string>(
  def: MachineDef<S, string, string>,
): MachineRun<S> {
  return { state: def.initial, elapsed: 0, carried: new Map() };
}

/** What the machine shows: carried values with the current clip on top. */
export function machinePose<S extends string>(
  def: MachineDef<S, string, string>,
  { state, elapsed, carried }: MachineRun<S>,
): Pose {
  const { clip } = def.states[state];
  return applyClip(copyPose(carried), clip, frameAt(clip, elapsed));
}

/**
 * Advance by `ms`, then follow transitions. Triggers are spent in this step:
 * one the current state does not listen to is dropped.
 */
export function stepMachine<
  S extends string,
  I extends string,
  T extends string,
>(
  def: MachineDef<S, I, T>,
  run: MachineRun<S>,
  ms: number,
  inputs: Readonly<Record<I, boolean>>,
  triggers: ReadonlySet<T> = new Set(),
): MachineRun<S> {
  let next: MachineRun<S> = { ...run, elapsed: run.elapsed + Math.max(0, ms) };
  const spent = new Set<T>();
  for (let chain = 0; chain < MAX_CHAIN; chain++) {
    const { clip, transitions } = def.states[next.state];
    const length = clipMs(clip);
    const taken = transitions.find((transition) => {
      if ("when" in transition) return transition.when(inputs);
      if ("trigger" in transition)
        return (
          triggers.has(transition.trigger) && !spent.has(transition.trigger)
        );
      return !clip.loop && next.elapsed >= length;
    });
    if (!taken) return next;
    if ("trigger" in taken) spent.add(taken.trigger);
    next = {
      state: taken.to,
      // Time past the end carries into the next state, so chains keep time.
      elapsed: "atEnd" in taken ? next.elapsed - length : 0,
      carried: machinePose(def, next),
    };
  }
  // Inputs that contradict each other would bounce forever: settle for now
  // and try again next step, as a player stepping frame by frame would.
  return next;
}
