"use client";

import Image from "next/image";
import { useTranslations } from "use-intl";
import { MedalIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { CertificateLauncher } from "@/features/certificate";
import { TaskDoneCheck } from "@/features/tasks/components/TaskDoneCheck";
import { useKkamiPhoto } from "../photos/useKkamiPhoto";
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
  const t = useTranslations();

  const focusDone = completed?.mode === "focus";
  // 집중을 마쳤으면 웃는 까미, 휴식을 마쳤으면 집중을 기다리는 까미. 팝업마다 한 장을 랜덤으로
  const photoPool = focusDone ? "done" : "default";
  const photo = useKkamiPhoto(
    "completion",
    completed ? `${photoPool}:${completed.endedAt}` : null,
    photoPool,
  );
  const cycleDone = focusDone && completed?.cycleCompleted === true;
  const nextLabel = t(`timer.modes.${next.mode}`);
  const walk = next.mode === "long-break" ? "long" : "short";

  function cancel() {
    cancelAutoStart();
    dismissCompleted();
  }

  const done = cycleDone ? "cycle" : focusDone ? "focus" : "break";
  const title = t(`timer.completion.${done}.title`);
  const message = t(`timer.completion.${done}.message`, {
    count: interval,
    walk,
  });

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
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                startSession();
                dismissCompleted();
              }}
            >
              {t("timer.completion.startNow")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={dismissCompleted}>
              {t("timer.completion.later")}
            </Button>
            <Button
              onClick={() => {
                startSession();
                dismissCompleted();
              }}
            >
              {t("timer.completion.startNext", { mode: nextLabel })}
            </Button>
          </>
        )
      }
    >
      <div className={styles.content}>
        <div className={styles.photoWrap}>
          {photo ? (
            <Image
              src={photo}
              alt={t(`kkami.${photoPool}`)}
              sizes="140px"
              className={styles.photo}
            />
          ) : null}
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
                {t("certificate.make")}
              </Button>
            )}
          </CertificateLauncher>
        ) : null}
        {focusDone && completed?.taskId ? (
          <TaskDoneCheck taskId={completed.taskId} />
        ) : null}
        {autoStart ? (
          <p className={styles.hint} aria-live="polite">
            {t("timer.completion.autoStart", {
              seconds: secondsLeft,
              mode: nextLabel,
            })}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
