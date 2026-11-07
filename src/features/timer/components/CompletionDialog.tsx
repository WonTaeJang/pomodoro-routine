"use client";

import Image from "next/image";
import kkamiDone from "@/assets/kkami/kkami-done.webp";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import { PawIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { useTasksStore } from "@/features/tasks/store";
import { MODE_LABELS } from "../labels";
import { useTimerStore } from "../store";
import styles from "./CompletionDialog.module.scss";

/** 세션이 끝났을 때 뜨는 팝업. 다음 세션을 바로 시작할 수 있습니다. */
export function CompletionDialog() {
  const completed = useTimerStore((s) => s.lastCompleted);
  const next = useTimerStore((s) => s.timer);
  const { dismissCompleted, start } = useTimerStore.getState();
  const task = useTasksStore((s) =>
    completed?.taskId
      ? s.tasks.find((t) => t.id === completed.taskId)
      : undefined,
  );

  const focusDone = completed?.mode === "focus";
  const nextLabel = MODE_LABELS[next.mode];
  const nextIsRunning = next.status === "running";

  const title = focusDone ? "수고했어요!" : "휴식 끝!";
  const message = focusDone
    ? `뽀모도로 하나를 완료했어요. 까미랑 ${next.mode === "long-break" ? "긴" : "짧은"} 산책 다녀와요.`
    : "까미가 기다리고 있어요. 다시 집중해볼까요?";

  return (
    <Dialog
      open={completed !== null}
      onClose={dismissCompleted}
      title={title}
      footer={
        nextIsRunning ? (
          <Button onClick={dismissCompleted}>확인</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={dismissCompleted}>
              나중에
            </Button>
            <Button
              onClick={() => {
                start();
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
        <Image
          src={focusDone ? kkamiDone : kkamiDefault}
          alt={focusDone ? "웃고 있는 까미" : "정면을 바라보는 까미"}
          sizes="140px"
          className={styles.photo}
        />
        <p>{message}</p>
        {focusDone && task ? (
          <p className={styles.task}>
            {task.title}
            <PawIcon size={16} />
            {task.completedPomodoros}/{task.estimate}
          </p>
        ) : null}
        {nextIsRunning ? (
          <p className={styles.hint}>{nextLabel}이 자동으로 시작됐어요.</p>
        ) : null}
      </div>
    </Dialog>
  );
}
