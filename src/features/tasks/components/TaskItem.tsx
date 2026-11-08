"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type CSSProperties } from "react";
import { EditIcon, GripIcon, TrashIcon } from "@/components/icons";
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

/**
 * 할 일 한 줄. 손잡이를 끌어서 옮깁니다. (SortableTaskList 안에서만 사용)
 * 수정 중에는 손잡이가 없어 옮길 수 없습니다.
 */
export function TaskItem({ task, active }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const { update, remove, toggleDone, setActive } = useTasksStore.getState();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    attributes: { roleDescription: "순서를 바꿀 수 있는 할 일" },
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (editing) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className={cx(styles.item, styles.editing)}
      >
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
      ref={setNodeRef}
      style={style}
      className={cx(
        styles.item,
        active && styles.active,
        task.done && styles.done,
        isDragging && styles.dragging,
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={styles.handle}
        {...attributes}
        {...listeners}
        aria-label={`${task.title} 순서 바꾸기`}
        title="끌어서 순서 바꾸기"
      >
        <GripIcon size={16} />
      </button>
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
