"use client";

import { useEffect } from "react";
import { useAccountFlags } from "@/features/admin";
import { useAuth } from "@/features/auth";
import { hasVip, vipSlots, withoutVip, type Placed } from "./furniture";
import { petStore, usePetStore } from "./store";

// 아이돌 무대 세트와 응원 피켓 말풍선은 VIP 계정에만 있습니다. VIP가 아니면 어디에도
// 보이지 않고, 방에 놓여 있던 것은 기본 모양으로 돌려 저장합니다.

/**
 * Whether this account is VIP: null while it is not known yet (signing in,
 * or the check failed), so nothing is taken away by mistake.
 */
export function usePetVip(): boolean | null {
  const { status } = useAuth();
  const flags = useAccountFlags();
  if (status === "signedIn") return flags?.vip ?? null;
  return status === "loading" ? null : false;
}

/** The room as this account may see it: VIP pieces only for VIP accounts. */
export const shownPlaced = (placed: Placed, vip: boolean | null) =>
  vip === false ? withoutVip(placed) : placed;

/** The placed room from the store, as this account may see it. */
export function useShownPlaced(): Placed {
  const vip = usePetVip();
  const placed = usePetStore((s) => s.pet?.placed);
  return shownPlaced(placed ?? {}, vip);
}

/** Not VIP (any more): put the starting looks back where VIP pieces were. */
export function useVipRoomCleanup(vip: boolean | null) {
  const holdsVip = usePetStore((s) => hasVip(s.pet?.placed ?? {}));
  useEffect(() => {
    if (vip !== false || !holdsVip) return;
    const placed = petStore.getState().pet?.placed ?? {};
    const back = Object.fromEntries(
      vipSlots(placed).map((slot) => [slot, null]),
    );
    void petStore.getState().recordPlaceAll(back);
  }, [vip, holdsVip]);
}
