"use client";

import { MedalIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { useTodayFocus } from "@/features/history/useTodayFocus";
import { CertificateLauncher } from "./CertificateLauncher";
import styles from "./TodayCertificateButton.module.scss";

/** 헤더의 메달: 오늘 완료한 사이클 수. 누르면 최근 사이클의 수료증 팝업. 사이클이 없으면 숨김 */
export function TodayCertificateButton() {
  const cycles = useTodayFocus()?.cycleNumbers.length ?? 0;
  if (cycles === 0) return null;

  return (
    <CertificateLauncher>
      {(open) => (
        <button
          type="button"
          className={styles.button}
          title="수료증 만들기"
          aria-label={`오늘 ${cycles}사이클 완료, 수료증 만들기`}
          onClick={open}
        >
          <Badge variant="medal" size="lg" icon={<MedalIcon size={16} />}>
            {cycles}
          </Badge>
        </button>
      )}
    </CertificateLauncher>
  );
}
