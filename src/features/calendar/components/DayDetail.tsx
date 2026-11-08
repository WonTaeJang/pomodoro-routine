"use client";

import { useId, useMemo } from "react";
import { useLocale, useTranslations } from "use-intl";
import { CheckIcon, MedalIcon, PawIcon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Section } from "@/components/ui";
import { CertificateLauncher } from "@/features/certificate";
import type { DayStats } from "@/features/history/sessions";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { formatDuration, formatLongDate } from "@/lib/date";
import { getDayTasks, type DayTask } from "../calendar";
import styles from "./DayDetail.module.scss";

type DayDetailProps = {
  /** 고른 날짜 (그날 시작 시각) */
  day: number;
  today: number;
  /** 그날 기록 요약 (집중 횟수, 시간, 사이클 번호) */
  stats: DayStats;
};

/** 고른 날짜의 기록: 집중, 수료증, 완료한 할 일, 진행 중이던 할 일 */
export function DayDetail({ day, today, stats }: DayDetailProps) {
  const titleId = useId();
  const t = useTranslations("calendar.day");
  const common = useTranslations("common");
  const locale = useLocale();
  const sessions = useHistoryStore((s) => s.sessions);
  const tasks = useTasksStore((s) => s.tasks);
  const { completed, inProgress } = useMemo(
    () => getDayTasks(sessions, tasks, day),
    [sessions, tasks, day],
  );
  const empty =
    stats.focusCount === 0 && completed.length === 0 && inProgress.length === 0;

  return (
    <Card as="section" className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {formatLongDate(day, locale)}
        </h2>
        {day === today ? (
          <Badge variant="soft" size="sm">
            {common("today")}
          </Badge>
        ) : null}
      </div>

      {empty ? (
        <EmptyState imageSize={72}>
          {t(day > today ? "future" : "empty")}
        </EmptyState>
      ) : (
        <>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>{t("focus")}</dt>
              <dd>
                <PawIcon size={16} className={styles.paw} />
                {t("focusCount", { count: stats.focusCount })}
              </dd>
            </div>
            <div className={styles.stat}>
              <dt>{t("focusTime")}</dt>
              <dd>{formatDuration(stats.focusMs, locale)}</dd>
            </div>
            <div className={styles.stat}>
              <dt>{t("cycles")}</dt>
              <dd>
                <MedalIcon size={16} className={styles.medal} />
                {t("cycleCount", { count: stats.cycleNumbers.length })}
              </dd>
            </div>
          </dl>

          {stats.cycleNumbers.length > 0 ? (
            <div className={styles.certificates}>
              {stats.cycleNumbers.map((number) => (
                <CertificateLauncher key={number} number={number}>
                  {(open) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<MedalIcon size={16} className={styles.medal} />}
                      onClick={open}
                    >
                      {t("certificate", { number })}
                    </Button>
                  )}
                </CertificateLauncher>
              ))}
            </div>
          ) : null}

          <TaskList
            title={t("completed.title")}
            tasks={completed}
            emptyText={t("completed.empty")}
            done
          />
          <TaskList
            title={t("inProgress.title")}
            tasks={inProgress}
            emptyText={t("inProgress.empty")}
          />
        </>
      )}
    </Card>
  );
}

type TaskListProps = {
  title: string;
  tasks: DayTask[];
  emptyText: string;
  done?: boolean;
};

function TaskList({ title, tasks, emptyText, done = false }: TaskListProps) {
  const t = useTranslations("calendar.day");
  return (
    <Section title={`${title} ${tasks.length}`}>
      {tasks.length === 0 ? (
        <p className={styles.none}>{emptyText}</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task, i) => (
            <li key={task.id ?? `gone-${i}`} className={styles.task}>
              {done ? (
                <CheckIcon size={16} className={styles.check} />
              ) : (
                <span className={styles.dot} aria-hidden="true" />
              )}
              <span className={styles.taskTitle}>{task.title}</span>
              {task.pomodoros > 0 ? (
                <span
                  className={styles.count}
                  aria-label={t("taskFocusCount", { count: task.pomodoros })}
                >
                  <PawIcon size={14} />
                  {task.pomodoros}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
