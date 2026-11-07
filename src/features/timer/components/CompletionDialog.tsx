"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import kkamiDone from "@/assets/kkami/kkami-done.webp";
import { MedalIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { TaskDoneCheck } from "@/features/tasks/components/TaskDoneCheck";
import { MODE_LABELS } from "../labels";
import { useTimerStore } from "../store";
import styles from "./CompletionDialog.module.scss";

/**
 * 세션이 끝났을 때 뜨는 팝업.
 * 집중이 끝났으면 할 일을 다 끝냈는지 묻고, 다음 세션을 바로 시작할 수 있습니다.
 */
export function CompletionDialog() {
  const completed = useTimerStore((s) => s.lastCompleted);
  const next = useTimerStore((s) => s.timer);
  const interval = useTimerStore((s) => s.settings.longBreakInterval);
  const { dismissCompleted, start } = useTimerStore.getState();
  const shown = useDelayedOpen(
    completed?.endedAt ?? null,
    completed?.mode === "focus",
  );

  const focusDone = completed?.mode === "focus";
  const cycleDone = focusDone && completed?.cycleCompleted === true;
  const nextLabel = MODE_LABELS[next.mode];
  const nextIsRunning = next.status === "running";
  const walk = next.mode === "long-break" ? "긴" : "짧은";

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
      open={completed !== null && shown}
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
        {focusDone && completed?.taskId ? (
          <TaskDoneCheck taskId={completed.taskId} />
        ) : null}
        {nextIsRunning ? (
          <p className={styles.hint}>{nextLabel}이 자동으로 시작됐어요.</p>
        ) : null}
      </div>
    </Dialog>
  );
}

/** 집중 완료 축하 효과가 보이도록 팝업을 잠깐 늦게 엽니다. (움직임 줄이기면 바로) */
const CELEBRATION_MS = 1000;

function useDelayedOpen(key: number | null, celebrate: boolean): boolean {
  const [openedKey, setOpenedKey] = useState<number | null>(null);

  useEffect(() => {
    if (key === null) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = celebrate && !reduceMotion ? CELEBRATION_MS : 0;
    const timer = setTimeout(() => setOpenedKey(key), delay);
    return () => clearTimeout(timer);
  }, [key, celebrate]);

  return key !== null && openedKey === key;
}
