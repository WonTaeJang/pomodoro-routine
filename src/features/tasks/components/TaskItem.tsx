"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type CSSProperties } from "react";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("tasks");
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
    attributes: { roleDescription: t("sort.roleDescription") },
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
          submitLabel={t("save")}
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
        aria-label={t("sort.handle", { title: task.title })}
        title={t("sort.handleHint")}
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
            {t("active")}
          </Badge>
        ) : !task.done ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActive(task.id)}
            aria-label={t("select.label", { title: task.title })}
          >
            {t("select.button")}
          </Button>
        ) : null}
        <PawCount
          done={task.completedPomodoros}
          estimate={task.estimate}
          className={styles.count}
        />
        <IconButton
          label={t("edit", { title: task.title })}
          icon={<EditIcon size={16} />}
          size="sm"
          onClick={() => setEditing(true)}
        />
        <IconButton
          label={t("delete", { title: task.title })}
          icon={<TrashIcon size={16} />}
          size="sm"
          onClick={() => remove(task.id)}
        />
      </div>
    </li>
  );
}
