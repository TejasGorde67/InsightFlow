export type TaskStatus = "completed" | "pending" | "delayed";
export type ProjectStatus = "active" | "completed" | "on_hold";

export interface TaskMetrics {
  completed: number;
  pending: number;
  delayed: number;
  total: number;
}

export interface ChartData {
  name: string;
  value: number;
}
