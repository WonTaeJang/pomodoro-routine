import styles from "./PetPlayground.module.scss";

/** What Kkami says, in a bubble above his head (decoration only: aria-hidden). */
export function PetSpeechBubble({ text }: { text: string }) {
  return (
    <div className={styles.bubble} aria-hidden="true">
      {text}
      <BubbleTail />
    </div>
  );
}

/** Straight on the right, slanting in from the left, like a speech icon. */
function BubbleTail() {
  // 16 x 14, with the box's 3px shadow under it. The top edge is left open.
  return (
    <svg className={styles.bubbleTail} viewBox="-0.5 0 17 18">
      <polygon className={styles.shade} points="0,3 16,3 16,17" />
      <polygon className={styles.paper} points="0,0 16,0 16,14" />
      <path className={styles.line} d="M0 0 L16 14 L16 0" />
    </svg>
  );
}
