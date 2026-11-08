"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import kkamiDone from "@/assets/kkami/kkami-done.webp";
import { MedalIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { CertificateLauncher } from "@/features/certificate";
import { TaskDoneCheck } from "@/features/tasks/components/TaskDoneCheck";
import { useAutoPopupsHeld } from "@/lib/popupHold";
import { useNow } from "@/lib/useNow";
import { usePageVisible } from "@/lib/usePageVisible";
import { MODE_LABELS } from "../labels";
import { startSession } from "../startSession";
import { useTimerStore } from "../store";
import { AUTO_START_DELAY_MS } from "../timer";
import styles from "./CompletionDialog.module.scss";

/**
 * 세션이 끝났을 때 뜨는 팝업.
 * - 집중이 끝났으면 할 일을 다 끝냈는지 묻고, 다음 세션을 바로 시작할 수 있습니다.
 * - 자동 시작이면 5초를 센 뒤 저절로 닫히며 다음 세션이 시작됩니다. ("지금 시작" / "취소")
 *   5초는 팝업이 실제로 보인 순간부터 셉니다. 탭을 안 보고 있으면 돌아올 때까지 기다립니다.
 * - 설정 창, 수료증 창을 보는 중이면 그 창을 닫을 때까지 기다렸다가 뜹니다.
 */
export function CompletionDialog() {
  const completed = useTimerStore((s) => s.lastCompleted);
  const next = useTimerStore((s) => s.timer);
  const interval = useTimerStore((s) => s.settings.longBreakInterval);
  const { dismissCompleted, cancelAutoStart } = useTimerStore.getState();
  const held = useAutoPopupsHeld();
  const pageVisible = usePageVisible();
  const now = useNow();
  const shown = useShownAfterCelebration(
    completed?.endedAt ?? null,
    completed?.mode === "focus",
    held,
  );
  const open = completed !== null && shown;

  const focusDone = completed?.mode === "focus";
  const cycleDone = focusDone && completed?.cycleCompleted === true;
  const nextLabel = MODE_LABELS[next.mode];
  const walk = next.mode === "long-break" ? "긴" : "짧은";
  const autoStart = next.status === "idle" ? (next.autoStart ?? null) : null;
  const autoStartAt = autoStart?.at ?? null;

  // 팝업이 실제로 보이는 순간부터 자동 시작 카운트다운
  useEffect(() => {
    if (open && autoStart && autoStartAt === null && pageVisible) {
      useTimerStore.getState().beginAutoStart();
    }
  }, [open, autoStart, autoStartAt, pageVisible]);

  const secondsLeft =
    autoStartAt !== null && now !== null
      ? Math.max(1, Math.ceil((autoStartAt - now) / 1000))
      : AUTO_START_DELAY_MS / 1000;

  function cancel() {
    cancelAutoStart();
    dismissCompleted();
  }

  const title = cycleDone
    ? "한 사이클 완료!"
    : focusDone
      ? "수고했어요!"
      : "휴식 끝!";
  const message = cycleDone
    ? `집중 ${interval}번을 모두 마쳤어요. 까미랑 ${walk} 산책 다녀와요.`
    : focusDone
      ? `뽀모도로 하나를 완료했어요. 까미랑 ${walk} 산책 다녀와요.`
      : "까미가 기다리고 있어요. 다시 집중해볼까요?";

  return (
    <Dialog
      open={open}
      // 자동 시작 중에 X·Esc·바깥 클릭으로 닫으면 "취소"와 같음 (모르는 사이 시간이 흐르지 않게)
      onClose={autoStart ? cancel : dismissCompleted}
      title={title}
      footer={
        autoStart ? (
          <>
            <Button variant="ghost" onClick={cancel}>
              취소
            </Button>
            <Button
              onClick={() => {
                startSession();
                dismissCompleted();
              }}
            >
              지금 시작
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={dismissCompleted}>
              나중에
            </Button>
            <Button
              onClick={() => {
                startSession();
                dismissCompleted();
              }}
            >
              {nextLabel} 시작 →
            </Button>
          </>
        )
      }
    >
      <div className={styles.content}>
        <div className={styles.photoWrap}>
          <Image
            src={focusDone ? kkamiDone : kkamiDefault}
            alt={focusDone ? "웃고 있는 까미" : "정면을 바라보는 까미"}
            sizes="140px"
            className={styles.photo}
          />
          {cycleDone ? (
            <span className={styles.medal} aria-hidden="true">
              <MedalIcon size={28} />
            </span>
          ) : null}
        </div>
        <p>{message}</p>
        {cycleDone ? (
          <CertificateLauncher>
            {(open) => (
              <Button
                variant="secondary"
                icon={<MedalIcon size={18} />}
                onClick={open}
              >
                수료증 만들기
              </Button>
            )}
          </CertificateLauncher>
        ) : null}
        {focusDone && completed?.taskId ? (
          <TaskDoneCheck taskId={completed.taskId} />
        ) : null}
        {autoStart ? (
          <p className={styles.hint} aria-live="polite">
            {secondsLeft}초 후 {nextLabel} 시작
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

/** 집중 완료 축하 효과가 보이도록 팝업을 잠깐 늦게 엽니다. (움직임 줄이기면 바로) */
const CELEBRATION_MS = 1000;

/**
 * 팝업을 보여줄지. 축하 시간이 지나고, 기다리게 하는 창(설정, 수료증)이 없을 때 처음 보입니다.
 * 한 번 보인 뒤에는 이 팝업 안에서 연 수료증 창 때문에 닫히지 않습니다.
 */
function useShownAfterCelebration(
  key: number | null,
  celebrate: boolean,
  held: boolean,
): boolean {
  const [readyKey, setReadyKey] = useState<number | null>(null);
  const [shownKey, setShownKey] = useState<number | null>(null);

  useEffect(() => {
    if (key === null) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = celebrate && !reduceMotion ? CELEBRATION_MS : 0;
    const timer = setTimeout(() => setReadyKey(key), delay);
    return () => clearTimeout(timer);
  }, [key, celebrate]);

  const shown = key !== null && shownKey === key;
  // 렌더링 중 상태 맞추기: 처음 보이게 된 순간을 기억
  if (key !== null && !shown && readyKey === key && !held) {
    setShownKey(key);
  }
  return shown || (key !== null && readyKey === key && !held);
}
