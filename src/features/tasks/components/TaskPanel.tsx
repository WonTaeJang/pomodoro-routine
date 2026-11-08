"use client";

import { useId } from "react";
import { PawIcon } from "@/components/icons";
import { Button, Card } from "@/components/ui";
import { useTasksStore } from "../store";
import { sortForDisplay } from "../tasks";
import { SortableTaskList } from "./SortableTaskList";
import { TaskForm } from "./TaskForm";
import styles from "./TaskPanel.module.scss";

/** 할 일 목록 카드 */
export function TaskPanel() {
  const titleId = useId();
  const tasks = useTasksStore((s) => s.tasks);
  const activeTaskId = useTasksStore((s) => s.activeTaskId);
  const { add, clearDone } = useTasksStore.getState();

  const sorted = sortForDisplay(tasks);
  const openTasks = sorted.filter((t) => !t.done);
  const doneTasks = sorted.filter((t) => t.done);

  return (
    <Card as="section" className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          할 일
        </h2>
        {tasks.length > 0 ? (
          <span className={styles.count}>{openTasks.length}개 남음</span>
        ) : null}
        {doneTasks.length > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            className={styles.clear}
            onClick={clearDone}
          >
            완료한 할 일 지우기
          </Button>
        ) : null}
      </div>

      <TaskForm submitLabel="추가" resetOnSubmit onSubmit={add} />

      {tasks.length === 0 ? (
        <p className={styles.empty}>
          할 일을 추가하고 집중해보세요.
          <br />
          집중을 마칠 때마다 선택한 할 일에{" "}
          <PawIcon size={14} className={styles.paw} /> 발자국이 쌓여요.
        </p>
      ) : (
        <ul className={styles.list}>
          <SortableTaskList tasks={openTasks} activeTaskId={activeTaskId} />
          <SortableTaskList tasks={doneTasks} activeTaskId={activeTaskId} />
        </ul>
      )}
    </Card>
  );
}
