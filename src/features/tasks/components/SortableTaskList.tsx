"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useTasksStore } from "../store";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";

/** 손잡이를 이만큼(px) 움직여야 끌기 시작. 손잡이를 그냥 눌렀다 뗀 것과 구분 */
const DRAG_START_DISTANCE = 4;

/** 위아래로만 움직이게 */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

type SortableTaskListProps = {
  /** 같은 묶음(할 일 또는 완료한 할 일)만, 화면 순서대로 */
  tasks: Task[];
  activeTaskId: string | null;
};

/**
 * 끌어서 순서를 바꿀 수 있는 할 일 묶음.
 * 마우스·터치는 손잡이를 끌고, 키보드는 손잡이에서 스페이스·화살표로 옮깁니다.
 * 묶음마다 따로 만들어서 할 일과 완료한 할 일이 서로 섞이지 않습니다.
 */
export function SortableTaskList({
  tasks,
  activeTaskId,
}: SortableTaskListProps) {
  const id = useId();
  const t = useTranslations("tasks.sort");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_START_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const screenReaderInstructions: ScreenReaderInstructions = {
    draggable: t("instructions"),
  };
  const titleOf = (taskId: UniqueIdentifier) =>
    tasks.find((task) => task.id === taskId)?.title ?? "";
  const positionOf = (taskId: UniqueIdentifier) => ({
    position: tasks.findIndex((task) => task.id === taskId) + 1,
    total: tasks.length,
  });

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("pickedUp", { title: titleOf(active.id), ...positionOf(active.id) }),
    onDragOver: ({ over }) =>
      over ? t("movedTo", positionOf(over.id)) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t("dropped", { title: titleOf(active.id), ...positionOf(over.id) })
        : t("droppedInPlace", { title: titleOf(active.id) }),
    onDragCancel: ({ active }) => t("cancelled", { title: titleOf(active.id) }),
  };

  if (tasks.length === 0) return null;

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    useTasksStore.getState().move(String(active.id), String(over.id));
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            active={task.id === activeTaskId}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
