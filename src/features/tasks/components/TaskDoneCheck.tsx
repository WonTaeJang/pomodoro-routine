"use client";

import { useTranslations } from "use-intl";
import { Checkbox } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useTasksStore } from "../store";
import { PawCount } from "./PawCount";
import styles from "./TaskDoneCheck.module.scss";

type TaskDoneCheckProps = {
  taskId: string;
  className?: string;
};

/**
 * 집중이 끝났을 때 "이 할 일을 다 끝냈나요?"를 묻는 카드.
 * 체크하면 할 일이 완료되고, 다음 할 일이 자동으로 선택됩니다. 다시 누르면 취소됩니다.
 */
export function TaskDoneCheck({ taskId, className }: TaskDoneCheckProps) {
  const task = useTasksStore((s) => s.tasks.find((t) => t.id === taskId));
  const nextTask = useTasksStore((s) =>
    s.tasks.find((t) => t.id === s.activeTaskId && t.id !== taskId),
  );
  const toggleDone = useTasksStore.getState().toggleDone;
  const t = useTranslations("tasks.doneCheck");

  if (!task) return null;
  const reachedEstimate = task.completedPomodoros >= task.estimate;

  return (
    <div className={cx(styles.card, task.done && styles.done, className)}>
      <p className={styles.title}>
        <span className={styles.name}>{task.title}</span>
        <PawCount
          done={task.completedPomodoros}
          estimate={task.estimate}
          size="md"
        />
      </p>

      {!task.done && reachedEstimate ? (
        <p className={styles.note}>
          {t("reachedEstimate", { count: task.estimate })}
        </p>
      ) : null}

      <Checkbox
        label={t("label")}
        checked={task.done}
        onChange={() => toggleDone(task.id)}
        className={styles.check}
      />

      {task.done ? (
        <p className={styles.note}>
          {nextTask ? t("next", { title: nextTask.title }) : t("noneLeft")}
        </p>
      ) : null}
    </div>
  );
}
