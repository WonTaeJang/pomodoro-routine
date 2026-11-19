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
          <BubbleTail />
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
