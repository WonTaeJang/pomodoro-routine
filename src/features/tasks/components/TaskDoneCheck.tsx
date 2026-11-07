"use client";

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
        <p className={styles.note}>예상한 {task.estimate}번을 모두 채웠어요!</p>
      ) : null}

      <Checkbox
        label="이 할 일을 다 끝냈어요"
        checked={task.done}
        onChange={() => toggleDone(task.id)}
        className={styles.check}
      />

      {task.done ? (
        <p className={styles.note}>
          {nextTask
            ? `다음 할 일: ${nextTask.title}`
            : "남은 할 일이 없어요. 새 할 일을 추가해보세요."}
        </p>
      ) : null}
    </div>
  );
}
