import styles from "./PetPlayground.module.scss";

/** The room's window, plant and rug, shared by home and the start of a walk. */
export function PetRoomArt() {
  return (
    <>
      <div className={styles.window} aria-hidden="true">
        <span />
        <i />
      </div>
      <div className={styles.plant} aria-hidden="true">
        <i />
        <span />
      </div>
      <div className={styles.rug} aria-hidden="true" />
    </>
  );
}
