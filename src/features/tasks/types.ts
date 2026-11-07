export type Task = {
  id: string;
  title: string;
  /** 예상 뽀모도로 수 */
  estimate: number;
  /** 이 할 일로 완료한 뽀모도로 수 */
  completedPomodoros: number;
  done: boolean;
  /** 목록 순서. 작을수록 위. 추가할 때 맨 아래 번호가 붙음 */
  order: number;
  /** 등록한 시각(epoch ms) */
  createdAt: number;
  /** 완료한 시각(epoch ms). 완료하지 않았거나 완료를 취소하면 null */
  completedAt: number | null;
};

export type TasksState = {
  tasks: Task[];
  /** 지금 집중할 할 일 */
  activeTaskId: string | null;
};
