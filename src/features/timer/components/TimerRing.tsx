import type { ReactNode } from "react";
import { PawIcon } from "@/components/icons";
import { ProgressRing } from "@/components/ui";
import { Celebration } from "./Celebration";
import styles from "./TimerRing.module.scss";

/**
 * 발자국 도장을 찍는 지점: 10%마다 하나씩 (10% ~ 90%, 100%는 완료 효과).
 * 발자국은 원을 따라 걸어가는 방향을 보도록 돌림 (12시에서는 오른쪽, 3시에서는 아래쪽)
 */
const STAMP_STEP = 0.1;
const MILESTONES = Array.from({ length: 9 }, (_, i) => {
  const at = Math.round((i + 1) * STAMP_STEP * 10) / 10;
  return { at, rotate: at * 360 + 90 };
});

/** 마지막 구간: 1분. 짧은 세션(테스트 모드 등)은 전체의 20% */
const FINAL_PHASE_MS = 60_000;

type TimerRingProps = {
  ready: boolean;
  running: boolean;
  remainingMs: number;
  durationMs: number;
  /** 발자국 도장, 빛, 완료 축하 효과. 끄면 띠만 줄어듦 (설정) */
  effects: boolean;
  /** 집중을 마친 시각. 값이 바뀌면 축하 효과를 보여줌 */
  celebrateKey: number | null;
  /** 한 사이클 완료 축하 */
  bigCelebration?: boolean;
  children: ReactNode;
};

/**
 * 까미 사진을 감싸는 타이머 띠.
 * - 10%가 지날 때마다 발자국 도장 하나
 * - 마지막 구간에는 띠가 빛나고 지금 위치에 빛나는 점
 * - 집중을 마치면 띠가 퍼지며 발자국과 색종이가 터짐
 * 설정에서 효과를 끄면 띠만 줄어듭니다.
 */
export function TimerRing({
  ready,
  running,
  remainingMs,
  durationMs,
  effects,
  celebrateKey,
  bigCelebration = false,
  children,
}: TimerRingProps) {
  const remaining = ready && durationMs > 0 ? remainingMs / durationMs : 1;
  const elapsed = 1 - remaining;
  const finalPhase = Math.min(FINAL_PHASE_MS, durationMs * 0.2);
  const glow =
    effects && ready && running && remainingMs > 0 && remainingMs <= finalPhase;
  const celebration = effects ? celebrateKey : null;

  const markers =
    effects && ready
      ? MILESTONES.filter((m) => elapsed >= m.at).map((m) => ({
          at: m.at,
          content: (
            <span className={styles.stamp}>
              <PawIcon
                size={16}
                style={{ transform: `rotate(${m.rotate}deg)` }}
              />
            </span>
          ),
        }))
      : [];

  return (
    <ProgressRing
      value={remaining}
      markers={markers}
      glow={glow}
      flashKey={celebration}
      overlay={
        celebration !== null ? (
          <Celebration
            key={`celebration-${celebration}`}
            big={bigCelebration}
          />
        ) : null
      }
    >
      {children}
    </ProgressRing>
  );
}
