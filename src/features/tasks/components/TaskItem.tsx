"use client";

import { useState } from "react";
import { EditIcon, TrashIcon } from "@/components/icons";
import { Badge, Button, Checkbox, IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useTasksStore } from "../store";
import type { Task } from "../types";
import { PawCount } from "./PawCount";
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
          <Badge variant="solid" size="sm" className={styles.badge}>
            집중 중
          </Badge>
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
        <PawCount
          done={task.completedPomodoros}
          estimate={task.estimate}
          className={styles.count}
        />
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
