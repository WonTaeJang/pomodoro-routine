"use client";

import { useState } from "react";
import { EditIcon, PawIcon, TrashIcon } from "@/components/icons";
import { Button, Checkbox, IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useTasksStore } from "../store";
import type { Task } from "../types";
import { TaskForm } from "./TaskForm";
import styles from "./TaskItem.module.scss";

type TaskItemProps = {
  task: Task;
  active: boolean;
};

export function TaskItem({ task, active }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const { update, remove, toggleDone, setActive } = useTasksStore.getState();

  if (editing) {
    return (
      <li className={cx(styles.item, styles.editing)}>
        <TaskForm
          initialTitle={task.title}
          initialEstimate={task.estimate}
          submitLabel="저장"
          autoFocus
          onSubmit={(title, estimate) => {
            update(task.id, { title, estimate });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          className={styles.form}
        />
      </li>
    );
  }

  return (
    <li
      className={cx(
        styles.item,
        active && styles.active,
        task.done && styles.done,
      )}
    >
      <Checkbox
        label={task.title}
        checked={task.done}
        onChange={() => toggleDone(task.id)}
        className={styles.check}
      />
      <div className={styles.meta}>
        {active ? (
          <span className={styles.badge}>집중 중</span>
        ) : !task.done ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActive(task.id)}
            aria-label={`${task.title}에 집중하기`}
          >
            선택
          </Button>
        ) : null}
        <span
          className={styles.count}
          aria-label={`뽀모도로 ${task.completedPomodoros}개 완료, 예상 ${task.estimate}개`}
        >
          <PawIcon size={14} />
          {task.completedPomodoros}/{task.estimate}
        </span>
        <IconButton
          label={`${task.title} 수정`}
          icon={<EditIcon size={16} />}
          size="sm"
          onClick={() => setEditing(true)}
        />
        <IconButton
          label={`${task.title} 삭제`}
          icon={<TrashIcon size={16} />}
          size="sm"
          onClick={() => remove(task.id)}
        />
      </div>
    </li>
  );
}
