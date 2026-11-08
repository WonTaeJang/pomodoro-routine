"use client";

import Image from "next/image";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import kkamiDone from "@/assets/kkami/kkami-done.webp";
import { MedalIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { CertificateLauncher } from "@/features/certificate";
import { TaskDoneCheck } from "@/features/tasks/components/TaskDoneCheck";
import { MODE_LABELS } from "../labels";
import { startSession } from "../startSession";
import { useTimerStore } from "../store";
import styles from "./CompletionDialog.module.scss";
import {
  useAutoStartCountdown,
  useShownAfterCelebration,
} from "./useCompletionDialog";

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
  const shown = useShownAfterCelebration(
    completed?.endedAt ?? null,
    completed?.mode === "focus",
  );
  const open = completed !== null && shown;
  const { waiting: autoStart, secondsLeft } = useAutoStartCountdown(open);

  const focusDone = completed?.mode === "focus";
  const cycleDone = focusDone && completed?.cycleCompleted === true;
  const nextLabel = MODE_LABELS[next.mode];
  const walk = next.mode === "long-break" ? "긴" : "짧은";

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
