import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/storage";
import { ONBOARDING_SLIDES, type OnboardingSlide } from "./content.ko";

/**
 * 첫 방문 안내 (백로그 I-009).
 * - 처음 들어와 타이머 화면을 열면 한 번 뜸. 어떻게 닫든 본 것으로 저장
 * - 이미 쓰던 사람(할 일이나 기록이 있음)에게는 띄우지 않음
 * - ☰ 메뉴와 사용법 페이지의 "안내 다시 보기"로 언제든 다시 열 수 있음
 * - "모든 데이터 지우기"를 하면 다시 처음 방문처럼
 */

const KEY = STORAGE_KEYS.onboarding;

export function isOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true; // 저장이 막힌 환경이면 매번 뜨지 않게
  }
}

/** 본 것으로 저장. 이미 쓰던 사람이라 띄우지 않을 때도 씀 */
export function markOnboardingSeen() {
  try {
    localStorage.setItem(KEY, "seen");
  } catch {
    // 무시
  }
}

/** 데이터를 모두 지울 때: 다음 방문에 안내가 다시 뜨게 */
export function resetOnboarding() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}

/** 처음 방문해서 안내를 띄울지. 이미 쓰던 사람이면 띄우지 않음 */
export function shouldShowOnboarding({
  seen,
  hasRecords,
  onTimerPage,
}: {
  seen: boolean;
  hasRecords: boolean;
  onTimerPage: boolean;
}): boolean {
  return !seen && !hasRecords && onTimerPage;
}

/** 보여줄 장. 키보드가 없는 기기(휴대폰)는 단축키 장을 뺌 */
export function onboardingSlides(hasKeyboard: boolean): OnboardingSlide[] {
  return ONBOARDING_SLIDES.filter(
    (slide) => hasKeyboard || !slide.keyboardOnly,
  );
}

type OnboardingStore = {
  open: boolean;
  show: () => void;
  /** 닫으면 본 것으로 저장 */
  close: () => void;
};

/** 안내 창 열림 상태. 자동으로 열 때와 "안내 다시 보기"가 함께 씀 */
export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  close: () => {
    markOnboardingSeen();
    set({ open: false });
  },
}));
