"use client";

import { useToday } from "@/lib/useNow";
import { affinityDay } from "./affinity";
import type { PetProfile } from "./profile";

// Development only: walk and give treats as often as needed to test.
const LIMITED = process.env.NODE_ENV !== "development";

/**
 * Whether today's count (local date) has reached a daily limit, such as five
 * walks or five treats. The key then rests until tomorrow.
 */
export function useDailyLimitReached(
  pet: PetProfile | null,
  countOn: (pet: PetProfile, day: string) => number,
  limit: number,
) {
  const today = useToday();
  return (
    LIMITED &&
    pet !== null &&
    today !== null &&
    countOn(pet, affinityDay(today)) >= limit
  );
}
