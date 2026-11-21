"use client";

import { useToday } from "@/lib/useNow";
import { affinityDay } from "./affinity";
import { giftWaiting, type PetProfile } from "./profile";

// VIP 선물 상자 (I-070): VIP 계정은 하루에 한 번(기기 날짜) 다마고치에서 선물 상자를 받습니다.
// 처음 받을 때는 아이돌 무대 세트를 받았다는 안내도 함께 보여 줍니다.

/** Whether today's gift box waits for this account, and if it is the first. */
export function useVipGift(vip: boolean | null, pet: PetProfile | null) {
  const today = useToday();
  const waiting =
    vip === true &&
    pet !== null &&
    today !== null &&
    giftWaiting(pet, affinityDay(today));
  return { waiting, first: pet?.gifts === 0 };
}
