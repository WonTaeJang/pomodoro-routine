"use client";

import Image from "next/image";
import { useId, useMemo } from "react";
import kkami from "@/assets/mascot/kkami-basic.svg";
import { CheckIcon, MedalIcon, PawIcon } from "@/components/icons";
import { Badge, Button, Card, Section } from "@/components/ui";
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
          {formatLongDate(day)}
        </h2>
        {day === today ? (
          <Badge variant="soft" size="sm">
            오늘
          </Badge>
        ) : null}
      </div>

      {empty ? (
        <div className={styles.empty}>
          <Image src={kkami} alt="" width={72} height={72} />
          <p>
            {day > today ? "아직 오지 않은 날이에요." : "이날은 기록이 없어요."}
          </p>
        </div>
      ) : (
        <>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>집중</dt>
              <dd>
                <PawIcon size={16} className={styles.paw} />
                {stats.focusCount}번
              </dd>
            </div>
            <div className={styles.stat}>
              <dt>집중한 시간</dt>
              <dd>{formatDuration(stats.focusMs)}</dd>
            </div>
            <div className={styles.stat}>
              <dt>사이클</dt>
              <dd>
                <MedalIcon size={16} className={styles.medal} />
                {stats.cycleNumbers.length}개
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
                      제 {number}호 수료증
                    </Button>
                  )}
                </CertificateLauncher>
              ))}
            </div>
          ) : null}

          <TaskList
            title="완료한 할 일"
            tasks={completed}
            emptyText="이날 완료한 할 일이 없어요."
            done
          />
          <TaskList
            title="진행 중이던 할 일"
            tasks={inProgress}
            emptyText="이날 집중한 할 일은 모두 끝냈어요."
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
                  aria-label={`이날 집중 ${task.pomodoros}번`}
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
