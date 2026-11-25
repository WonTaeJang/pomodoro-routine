import type { CSSProperties } from "react";
import { XMAS_LIGHT_CELLS } from "../roomArt";
import { SleighArt } from "./PetIcons";
import styles from "./PetPlayground.module.scss";

// 크리스마스 에디션 (I-075): 크리스마스 세트 넷을 모두 놓으면
// - 게임기가 썰매가 됨: 위에 선물 짐과 고삐 맨 루돌프, 아래에 금빛 썰매 날 (산타 옷 까미가 산타)
// - 방에 눈이 내리고 창문 전구가 번갈아 깜빡이며, 1분에 한 번쯤 산타 썰매가 날아감
// 움직임은 CSS만 쓰고, 움직임 줄이기면 썰매는 날지 않고 눈·전구도 멈춤

/** The device as Santa's sleigh: gifts and Rudolph on top, runners below. */
export function DeviceSleigh() {
  return (
    <span className={styles.sleigh} aria-hidden="true">
      <span className={styles.sleighCargo}>
        <SleighArt part="cargo" />
      </span>
      <span className={styles.sleighRein} />
      <span className={styles.sleighDeer}>
        <SleighArt part="deer" noseClass={styles.nose} />
      </span>
      <span className={styles.sleighRunner}>
        <i className={styles.runnerPost} />
        <i className={styles.runnerPost} />
        <i className={styles.runnerPost} />
        <span className={styles.sleighCurl}>
          <SleighArt part="curl" />
        </span>
      </span>
    </span>
  );
}

// Snowflakes across the room: where (% from the left), how long a fall
// takes (s), when in it they start, which way the wind takes them.
const FLAKES = [
  [4, 7.2, 0, 6],
  [13, 9.1, 3.4, -5],
  [22, 6.4, 1.2, 8],
  [31, 8.3, 5.1, -7],
  [40, 7.6, 2.3, 5],
  [49, 9.6, 0.6, -6],
  [58, 6.9, 4.2, 7],
  [67, 8.7, 1.8, -4],
  [76, 7.3, 6.0, 6],
  [85, 9.3, 2.9, -8],
  [94, 6.6, 4.8, 5],
] as const;

/** Snow falling and Santa's sleigh flying by, once a minute or so. */
export function ChristmasSky() {
  return (
    <div className={styles.christmasSky} aria-hidden="true">
      {FLAKES.map(([left, fall, start, drift], i) => (
        <i
          key={left}
          className={styles.flake}
          data-small={i % 3 === 0}
          style={
            {
              left: `${left}%`,
              animationDuration: `${fall}s`,
              animationDelay: `-${start}s`,
              "--drift": `${drift}px`,
            } as CSSProperties
          }
        />
      ))}
      <div className={styles.sleighFlight}>
        <span className={styles.sleighTeam}>
          <SleighArt part="team" cell={2} noseClass={styles.nose} />
          <i className={styles.sparkle} />
          <i className={styles.sparkle} />
          <i className={styles.sparkle} />
        </span>
      </div>
    </div>
  );
}

/** The Christmas window's string lights, taking turns to blink. */
export function WindowLights() {
  return XMAS_LIGHT_CELLS.map((x, i) => (
    <i
      key={x}
      className={styles.windowLight}
      data-turn={i % 2}
      style={{ left: `calc(var(--room-cell) * ${x})` }}
      aria-hidden="true"
    />
  ));
}
