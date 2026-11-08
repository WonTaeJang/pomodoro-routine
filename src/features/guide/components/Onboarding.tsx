"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { STORAGE_KEYS } from "@/lib/storage";
import { TOUCH_ONLY_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { useSwipe } from "@/lib/useSwipe";
import { ONBOARDING } from "../content.ko";
import {
  isOnboardingSeen,
  markOnboardingSeen,
  onboardingSlides,
  shouldShowOnboarding,
  useOnboardingStore,
} from "../onboarding";
import { GuideText } from "./GuideParts";
import { OnboardingArt } from "./OnboardingArt";
import styles from "./Onboarding.module.scss";

/**
 * 첫 방문 안내. 앱 틀(AppShell)에서 한 번만 그립니다.
 * 처음 들어와 타이머 화면을 열면 자동으로 뜨고, "안내 다시 보기"로도 열립니다.
 */
export function Onboarding({ ready }: { ready: boolean }) {
  const open = useOnboardingStore((s) => s.open);
  const { show, close } = useOnboardingStore.getState();
  const onTimerPage = usePathname() === "/";

  // 저장값을 불러온 뒤 한 번만 판단
  useEffect(() => {
    if (!ready) return;
    const seen = isOnboardingSeen();
    const hasRecords =
      useTasksStore.getState().tasks.length > 0 ||
      useHistoryStore.getState().sessions.length > 0;
    // 이미 쓰던 사람은 띄우지 않고 본 것으로
    if (!seen && hasRecords) markOnboardingSeen();
    if (shouldShowOnboarding({ seen, hasRecords, onTimerPage })) show();
  }, [ready, onTimerPage, show]);

  // 다른 탭에서 안내를 닫으면 이 탭도 닫음
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.onboarding && e.newValue !== null) {
        useOnboardingStore.setState({ open: false });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!open) return null;
  return <OnboardingDialog onClose={close} />;
}

function OnboardingDialog({ onClose }: { onClose: () => void }) {
  const slides = onboardingSlides(!useMediaQuery(TOUCH_ONLY_QUERY));
  const [index, setIndex] = useState(0);
  /** 마지막으로 넘긴 방향 (새 장이 어느 쪽에서 들어올지) */
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const lastIndex = slides.length - 1;
  const slide = slides[Math.min(index, lastIndex)];
  const first = index === 0;
  const last = index >= lastIndex;
  const primaryRef = useRef<HTMLButtonElement>(null);

  // 열리면 "다음"에 포커스 (팝업이 열린 뒤에 옮겨야 해서 다음 화면 그리기 때)
  useEffect(() => {
    const id = requestAnimationFrame(() => primaryRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  /** 앞뒤로 장 넘기기 (처음·끝에서 멈춤) */
  const move = useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? "next" : "prev");
      setIndex((i) => Math.max(0, Math.min(lastIndex, i + delta)));
    },
    [lastIndex],
  );

  // 휴대폰: 손가락으로 밀어 넘기기
  const swipe = useSwipe({
    onNext: () => move(1),
    onPrev: () => move(-1),
    canNext: !last,
    canPrev: !first,
  });

  // ←·→ 키로 장 넘기기 (어느 버튼에 포커스가 있든)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <Dialog
      open
      onClose={onClose}
      title={slide.title}
      className={styles.dialog}
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {ONBOARDING.skip}
          </Button>
          <ol
            className={styles.dots}
            aria-label={ONBOARDING.progress(index + 1, slides.length)}
          >
            {slides.map((s, i) => (
              <li
                key={s.id}
                className={styles.dot}
                aria-current={i === index ? "step" : undefined}
              />
            ))}
          </ol>
          <div className={styles.nav}>
            {!first ? (
              <Button variant="secondary" size="sm" onClick={() => move(-1)}>
                {ONBOARDING.prev}
              </Button>
            ) : null}
            {last ? (
              <Button ref={primaryRef} size="sm" onClick={onClose}>
                {ONBOARDING.done}
              </Button>
            ) : (
              <Button ref={primaryRef} size="sm" onClick={() => move(1)}>
                {ONBOARDING.next}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.swipeArea} {...swipe.handlers}>
        <div
          // 장이 바뀌면 새로 그려서 옆에서 들어오는 움직임을 다시 보여줌
          key={slide.id}
          className={styles.slide}
          data-direction={direction ?? undefined}
          data-dragging={swipe.dragging || undefined}
          style={
            swipe.dragging
              ? { transform: `translateX(${swipe.offset}px)` }
              : undefined
          }
        >
          <OnboardingArt id={slide.id} />
          <ul className={styles.points}>
            {slide.points.map((point) => (
              <li key={point}>
                <GuideText text={point} />
              </li>
            ))}
          </ul>
          {last ? (
            <Link href="/guide" className={styles.more} onClick={onClose}>
              {ONBOARDING.moreGuide}
            </Link>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
