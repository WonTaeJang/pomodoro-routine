"use client";

import { InfoIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { ONBOARDING } from "../content.ko";
import { useOnboardingStore } from "../onboarding";

/** 사용법 페이지 위쪽: 첫 방문 안내를 다시 열기 */
export function ReplayOnboardingButton({ className }: { className?: string }) {
  return (
    <Button
      className={className}
      variant="secondary"
      size="sm"
      icon={<InfoIcon size={16} />}
      onClick={() => useOnboardingStore.getState().show()}
    >
      {ONBOARDING.replay}
    </Button>
  );
}
