export type Task = {
  id: string;
  title: string;
  /** 예상 뽀모도로 수 */
  estimate: number;
  /** 이 할 일로 완료한 뽀모도로 수 */
  completedPomodoros: number;
  done: boolean;
  createdAt: number;
};

export type TasksState = {
  tasks: Task[];
  /** 지금 집중할 할 일 */
  activeTaskId: string | null;
};
