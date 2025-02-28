import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskChart } from "@/components/dashboard/task-chart";
import type { Task } from "@shared/schema";
import type { TaskMetrics, ChartData } from "@/lib/types";

function calculateMetrics(tasks: Task[]): TaskMetrics {
  return {
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    delayed: tasks.filter(t => t.status === "delayed").length,
    total: tasks.length
  };
}

function prepareChartData(metrics: TaskMetrics): ChartData[] {
  return [
    { name: "Completed", value: metrics.completed },
    { name: "Pending", value: metrics.pending },
    { name: "Delayed", value: metrics.delayed }
  ];
}

export default function Dashboard() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });

  const metrics = calculateMetrics(tasks);
  const chartData = prepareChartData(metrics);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Project overview and analytics</p>
      </div>

      <StatsCards metrics={metrics} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <TaskChart data={chartData} />
      </div>
    </div>
  );
}
