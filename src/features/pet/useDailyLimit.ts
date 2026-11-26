"use client";

import { useToday } from "@/lib/useNow";
import { affinityDay } from "./affinity";
import type { PetProfile } from "./profile";

// Development only: walk and give treats as often as needed to test.
const LIMITED = process.env.NODE_ENV !== "development";

type CountOn = (pet: PetProfile, day: string) => number;

/** How many are left today (local date) of a daily limit, such as five walks. */
export function useDailyLeft(
  pet: PetProfile | null,
  countOn: CountOn,
  limit: number,
) {
  const today = useToday();
  return pet && today !== null
    ? Math.max(0, limit - countOn(pet, affinityDay(today)))
    : limit;
}

/**
 * Whether today's count has reached a daily limit, such as five walks or five
 * treats. The key then rests until tomorrow.
 */
export function useDailyLimitReached(
  pet: PetProfile | null,
  countOn: CountOn,
  limit: number,
) {
  const left = useDailyLeft(pet, countOn, limit);
  return LIMITED && left === 0;
}
