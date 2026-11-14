"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getAccountFlags, type AccountFlags } from "./api";

/**
 * 지금 로그인한 계정이 관리자·VIP인지. 로그인하지 않았거나 아직 모르면 null.
 * (메뉴의 "관리자" 항목, 프로필의 VIP 배지)
 */
export function useAccountFlags(): AccountFlags | null {
  const { status, user } = useAuth();
  const userId = status === "signedIn" && user ? user.id : null;
  const [loaded, setLoaded] = useState<{
    userId: string;
    flags: AccountFlags;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void getAccountFlags(userId).then((flags) => {
      if (alive) setLoaded({ userId, flags });
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  return userId && loaded?.userId === userId ? loaded.flags : null;
}
