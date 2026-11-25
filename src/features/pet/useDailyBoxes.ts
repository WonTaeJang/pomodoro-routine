"use client";

import { useToday } from "@/lib/useNow";
import { affinityDay } from "./affinity";
import {
  giftWaiting,
  snowWaiting,
  type DailyBox,
  type PetProfile,
} from "./profile";

// 그날의 상자 (기기 날짜로 하루에 한 번, 다마고치 방 바닥에 쌓임):
// - 눈송이 상자 (I-074): 11월부터 2월까지 누구나. 처음이면 크리스마스 꾸미기 안내
// - VIP 선물 상자 (I-070): VIP 계정만. 처음이면 아이돌 무대 세트 안내

/** Today's waiting boxes, the top of the pile first, and which are the first ever. */
export function useDailyBoxes(vip: boolean | null, pet: PetProfile | null) {
  const today = useToday();
  const day = today === null ? null : affinityDay(today);
  const boxes: DailyBox[] = [];
  if (pet && day) {
    if (snowWaiting(pet, day)) boxes.push("snow");
    if (vip === true && giftWaiting(pet, day)) boxes.push("gift");
  }
  const first: Record<DailyBox, boolean> = {
    snow: pet?.snows === 0,
    gift: pet?.gifts === 0,
  };
  return { boxes, first };
}
