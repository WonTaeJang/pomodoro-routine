"use client";

import { memo, useState, type CSSProperties } from "react";
import {
  useAudibleFocusSound,
  type FocusSoundId,
} from "@/features/focus-sound";
import { cx } from "@/lib/cx";
import { seededRandom } from "@/lib/random";
import styles from "./SoundAmbience.module.scss";

/** 소리마다 보여 줄 분위기. 소리를 추가하면 여기도 채워야 함 (빠지면 타입 오류) */
const AMBIENCE = {
  white: "white",
  pink: "pink",
  brown: "brown",
  rain: "rain",
  "window-rain": "window",
  fireplace: "fire",
  forest: "leaves",
  waves: "waves",
  stream: "ripples",
  airplane: "clouds",
  library: "pages",
  cafe: "steam",
} as const satisfies Record<FocusSoundId, string>;

type Ambience = (typeof AMBIENCE)[FocusSoundId];

/** 분위기마다 움직이는 조각 개수 (은은하게, 적게) */
const COUNT: Record<Ambience, number> = {
  white: 4,
  pink: 3,
  brown: 3,
  rain: 18,
  window: 7,
  fire: 16,
  leaves: 6,
  waves: 3,
  ripples: 6,
  clouds: 4,
  pages: 5,
  steam: 3,
};

/** 노이즈 고리가 한 번 퍼지는 시간 (초). 백색은 잘고 빠르게, 브라운은 느리고 깊게 */
const RIPPLE_SECONDS = { white: 2.6, pink: 4.2, brown: 6.5 };

/**
 * 커피 김이 피어오르는 자리 [가로 %, 아래에서 %]. 원의 양옆 바깥.
 * (원 위는 모드 탭, 아래는 남은 시간 숫자와 가까워 피함)
 */
const STEAM_AT = [
  [9, 36],
  [86, 36],
  [14, 50],
];

type Vars = CSSProperties & Record<`--${string}`, string>;

/** 조각들의 위치·속도. 분위기마다 정해진 난수라 언제 그려도 같은 자리 */
function pieceStyles(ambience: Ambience, seed: number): Vars[] {
  const rand = seededRandom(seed);
  const between = (min: number, max: number) => min + rand() * (max - min);
  const s = (value: number) => `${value.toFixed(2)}s`;
  const count = COUNT[ambience];

  return Array.from({ length: count }, (_, i): Vars => {
    switch (ambience) {
      case "white":
      case "pink":
      case "brown": {
        const seconds = RIPPLE_SECONDS[ambience];
        return { "--d": s(seconds), animationDelay: s((-i * seconds) / count) };
      }
      case "rain":
        return {
          left: `${between(5, 95)}%`,
          "--d": s(between(1.1, 1.8)),
          animationDelay: s(-between(0, 2)),
        };
      case "window": {
        // 원 위쪽 띠 위에서 출발해 조금 흘러내림
        const angle = (between(-70, 70) * Math.PI) / 180;
        return {
          left: `${50 + Math.sin(angle) * 32}%`,
          top: `${50 - Math.cos(angle) * 32}%`,
          "--d": s(between(4, 7)),
          animationDelay: s(-between(0, 7)),
        };
      }
      case "fire":
        return {
          left: `${between(30, 70)}%`,
          "--size": `${between(3, 6).toFixed(1)}px`,
          "--x": `${between(-45, 45).toFixed(0)}px`,
          "--d": s(between(1.8, 3.6)),
          animationDelay: s(-between(0, 3.6)),
        };
      case "leaves":
        return {
          left: `${between(10, 85)}%`,
          "--x": `${between(-40, 40).toFixed(0)}px`,
          "--d": s(between(7, 11)),
          animationDelay: s(-between(0, 10)),
        };
      case "waves":
        return {
          bottom: `${18 + i * 14}px`,
          opacity: 0.32 - i * 0.08,
          "--d": s(3 + i * 1.3),
        };
      case "ripples":
        // 원 아래쪽 물 위에 번지는 작은 파문
        return {
          left: `${between(25, 75)}%`,
          bottom: `${between(10, 22).toFixed(0)}%`,
          "--d": s(between(3.5, 5.5)),
          animationDelay: s(-between(0, 5)),
        };
      case "pages":
        // 원 양옆을 천천히 떠오르며 흔들리는 종잇장 (가운데는 원 뒤로 숨어서 양옆으로 번갈아)
        return {
          left: `${i % 2 === 0 ? between(6, 18) : between(78, 90)}%`,
          "--x": `${between(-30, 30).toFixed(0)}px`,
          "--d": s(between(9, 13)),
          animationDelay: s(-between(0, 12)),
        };
      case "steam":
        // 원 양옆에서 피어오르는 커피 김
        return {
          left: `${STEAM_AT[i][0]}%`,
          bottom: `${STEAM_AT[i][1]}%`,
          "--d": s(between(4.5, 6)),
          animationDelay: s(-i * 1.7),
        };
      case "clouds":
        return {
          top: `${between(25, 75)}%`,
          width: `${between(50, 80).toFixed(0)}px`,
          "--d": s(between(16, 26)),
          animationDelay: s(-between(0, 24)),
        };
    }
  });
}

/**
 * 분위기별 조각을 처음 한 번만 계산해 둠. 타이머가 1초마다 다시 그려도 새로 만들지 않음
 * (렌더할 때마다 Math.random을 부르면 그릴 때마다 자리가 바뀜)
 */
const PIECES = Object.fromEntries(
  (Object.keys(COUNT) as Ambience[]).map((ambience, i) => [
    ambience,
    pieceStyles(ambience, i + 1),
  ]),
) as Record<Ambience, Vars[]>;

type SoundAmbienceProps = {
  /** 링 효과를 껐거나, 마지막 구간 빛이 나는 동안은 숨김 */
  hidden: boolean;
};

/**
 * 집중 소리에 맞춘 은은한 움직임 (타이머 원 둘레). 소리가 실제로 들리는 동안만 서서히 보이고,
 * 멈추면 서서히 사라짐. 사라지는 동안에도 마지막 소리의 모양을 그대로 둠
 */
export const SoundAmbience = memo(function SoundAmbience({
  hidden,
}: SoundAmbienceProps) {
  const audible = useAudibleFocusSound();
  const [last, setLast] = useState<FocusSoundId | null>(audible);
  if (audible !== null && audible !== last) setLast(audible);
  if (last === null) return null;

  const ambience = AMBIENCE[last];
  return (
    <div
      className={cx(
        styles.ambience,
        styles[ambience],
        audible !== null && !hidden && styles.visible,
      )}
      aria-hidden="true"
    >
      {PIECES[ambience].map((style, i) => (
        <i key={`${ambience}-${i}`} style={style} />
      ))}
    </div>
  );
});
