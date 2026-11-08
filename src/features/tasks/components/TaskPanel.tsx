"use client";

import { useId } from "react";
import { useTranslations } from "use-intl";
import { PawIcon } from "@/components/icons";
import { Button, Card } from "@/components/ui";
import { useTasksStore } from "../store";
import { sortForDisplay, visibleTasks } from "../tasks";
import { SortableTaskList } from "./SortableTaskList";
import { TaskForm } from "./TaskForm";
import styles from "./TaskPanel.module.scss";

/** 할 일 목록 카드 */
export function TaskPanel() {
  const titleId = useId();
  const tasks = useTasksStore((s) => s.tasks);
  const activeTaskId = useTasksStore((s) => s.activeTaskId);
  const { add, archiveDone } = useTasksStore.getState();
  const t = useTranslations("tasks");

  const visible = sortForDisplay(visibleTasks(tasks));
  const openTasks = visible.filter((task) => !task.done);
  const doneTasks = visible.filter((task) => task.done);

  return (
    <Card as="section" className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {t("title")}
        </h2>
        {visible.length > 0 ? (
          <span className={styles.count}>
            {t("remaining", { count: openTasks.length })}
          </span>
        ) : null}
        {doneTasks.length > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            className={styles.clear}
            onClick={archiveDone}
            title={t("clearDone.hint")}
          >
            {t("clearDone.label")}
          </Button>
        ) : null}
      </div>

      <TaskForm submitLabel={t("add")} resetOnSubmit onSubmit={add} />

      {visible.length === 0 ? (
        <p className={styles.empty}>
          {t("empty.title")}
          <br />
          {t.rich("empty.hint", {
            paw: () => <PawIcon size={14} className={styles.paw} />,
          })}
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
