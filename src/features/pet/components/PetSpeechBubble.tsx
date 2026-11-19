import type { ReactNode } from "react";
import type { LookId } from "../furniture";
import { BubbleDecorIcon, HeartItemIcon } from "./PetIcons";
import styles from "./PetPlayground.module.scss";

/** While decorating: the bubble is a slot to pick, like the window or rug. */
export type BubblePick = {
  selected: boolean;
  /** Accessible name of the pick button. */
  label: string;
  /** Shown under the bubble while selected, e.g. the look being tried. */
  tag: string;
  onSelect: () => void;
};

/**
 * What Kkami says, in a bubble above his head. The words are decoration
 * (aria-hidden); the look is the speech bubble placed in his room (I-066).
 */
export function PetSpeechBubble({
  text,
  look,
  pick,
}: {
  text: string;
  look: LookId;
  pick?: BubblePick;
}) {
  return (
    <div
      className={styles.bubble}
      data-look={look}
      data-selected={pick?.selected === true}
    >
      <span aria-hidden="true">{text}</span>
      <BubbleDecor look={look} />
      {pick && (
        <>
          <button
            type="button"
            className={styles.slotPick}
            aria-label={pick.label}
            aria-pressed={pick.selected}
            onClick={pick.onSelect}
          />
          {pick.selected && (
            <span className={styles.slotTag} aria-hidden="true">
              {pick.tag}
            </span>
          )}
        </>
      )}
    </div>
  );
}

const Decor = ({ place, children }: { place: string; children: ReactNode }) => (
  <span className={styles.bubbleDecor} data-place={place} aria-hidden="true">
    {children}
  </span>
);

/** The tail and the small drawings each look adds. */
function BubbleDecor({ look }: { look: LookId }) {
  switch (look) {
    case "gameBubble":
      // A dialog box: no tail, a blinking ▼ as if more were coming.
      return (
        <Decor place="more">
          <BubbleDecorIcon decor="more" size={5} />
        </Decor>
      );
    case "cloudBubble":
      return (
        <>
          <Decor place="cloudTopLeft">
            <BubbleDecorIcon decor="cloud" size={16} />
          </Decor>
          <Decor place="cloudTop">
            <BubbleDecorIcon decor="cloud" size={10} />
          </Decor>
          <Decor place="cloudBottomRight">
            <BubbleDecorIcon decor="cloud" size={15} />
          </Decor>
          <span className={styles.bubbleThought} aria-hidden="true" />
        </>
      );
    case "heartBubble":
      return (
        <>
          <Decor place="heartTopLeft">
            <HeartItemIcon size={13} />
          </Decor>
          <Decor place="heartBottomRight">
            <HeartItemIcon size={13} />
          </Decor>
          <BubbleTail />
        </>
      );
    case "stampBubble":
      return (
        <>
          <Decor place="postmark">
            <BubbleDecorIcon decor="postmark" size={24} />
          </Decor>
          <StampTail />
        </>
      );
    default:
      return <BubbleTail />;
  }
}

/** Straight on the right, slanting in from the left, like a speech icon. */
function BubbleTail() {
  // 16 x 14, with the box's 3px shadow under it. The top edge is left open.
  return (
    <svg
      className={styles.bubbleTail}
      viewBox="-0.5 0 17 18"
      aria-hidden="true"
    >
      <polygon className={styles.shade} points="0,3 16,3 16,17" />
      <polygon className={styles.paper} points="0,0 16,0 16,14" />
      <path className={styles.line} d="M0 0 L16 14 L16 0" />
    </svg>
  );
}

/**
 * The stamp's paper running on into a tail: no outline, small perforations
 * along the slanted side. 20 x 22; the top 5px tucks under the box's edge.
 */
function StampTail() {
  return (
    <svg className={styles.stampTail} viewBox="0 0 20 22" aria-hidden="true">
      <path d={STAMP_TAIL} />
    </svg>
  );
}

/** The tail's outline: down the right side, then back up the slanted side, biting a hole every STEP. */
const STAMP_TAIL = (() => {
  const TIP = [20, 19];
  const START = [5.3, 5]; // where the slanted side leaves the box
  const STEP = 3.6;
  const R = 1.3;
  const length = Math.hypot(TIP[0] - START[0], TIP[1] - START[1]);
  // One step up the slanted side, from the tip toward the box.
  const [ux, uy] = [(START[0] - TIP[0]) / length, (START[1] - TIP[1]) / length];
  const at = (x: number, y: number) => `${+x.toFixed(2)} ${+y.toFixed(2)}`;
  let d = `M0 0H${TIP[0]}V${TIP[1]}`;
  for (let i = Math.floor(length / STEP); i >= 1; i--) {
    const [cx, cy] = [START[0] - ux * i * STEP, START[1] - uy * i * STEP];
    d += `L${at(cx - ux * R, cy - uy * R)}`;
    d += `A${R} ${R} 0 0 0 ${at(cx + ux * R, cy + uy * R)}`;
  }
  return `${d}L0 0Z`;
})();
