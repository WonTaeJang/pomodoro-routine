"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "./storage";

/**
 * 탭을 여러 개 열어도 알림 소리, 브라우저 알림, 집중 소리는 한 탭에서만 냅니다.
 * 그 탭은 마지막으로 누르거나 입력한 탭입니다. 브라우저는 사용자가 한 번이라도 누른 탭에서만
 * 소리를 낼 수 있게 해서, 보기만 한 탭으로 넘기면 소리가 끊기기 때문입니다.
 */

const KEY = STORAGE_KEYS.soundTab;
const CHANGE_EVENT = "kkamodoro-sound-tab-change";

let tabId: string | null = null;
const myId = () => (tabId ??= crypto.randomUUID());

function owner(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** 이 탭이 소리와 알림을 낼 탭인지. 정해진 탭이 없으면(잠깐) 모든 탭이 냅니다. */
export function isSoundTab(): boolean {
  const current = owner();
  return current === null || current === myId();
}

function claim() {
  if (owner() === myId()) return;
  try {
    localStorage.setItem(KEY, myId());
  } catch {
    // 저장이 막힌 환경이면 모든 탭이 소리를 냄
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** 소리를 낼 탭이 바뀌면 onChange를 부릅니다. */
export function subscribeSoundTab(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** 이 탭이 소리를 낼 탭인지 (화면용). 서버와 첫 렌더링에서는 false */
export function useIsSoundTab(): boolean {
  return useSyncExternalStore(subscribeSoundTab, isSoundTab, () => false);
}

/**
 * 소리를 낼 탭 정하기를 시작합니다. 앱 틀에서 한 번만 부르고, 돌려준 함수로 멈춥니다.
 * - 정해진 탭이 없으면 이 탭이 맡음 (처음 연 탭)
 * - 누르거나 입력하면 이 탭이 맡음
 * - 맡은 탭을 닫으면 비워 두고, 남은 탭 중 하나가 바로 맡음
 */
export function startSoundTab(): () => void {
  if (owner() === null) claim();

  const onStorage = (e: StorageEvent) => {
    if ((e.key === KEY || e.key === null) && owner() === null) claim();
  };
  const onLeave = () => {
    if (owner() === myId()) {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // 무시
      }
    }
  };
  const onBack = () => {
    if (owner() === null) claim();
  };

  window.addEventListener("pointerdown", claim, true);
  window.addEventListener("keydown", claim, true);
  window.addEventListener("storage", onStorage);
  window.addEventListener("pagehide", onLeave);
  window.addEventListener("pageshow", onBack);
  return () => {
    window.removeEventListener("pointerdown", claim, true);
    window.removeEventListener("keydown", claim, true);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pagehide", onLeave);
    window.removeEventListener("pageshow", onBack);
  };
}
