import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskMetrics } from "@/lib/types";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  metrics: TaskMetrics;
}

export function StatsCards({ metrics }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.completed}</div>
          <p className="text-xs text-muted-foreground">
            of {metrics.total} total tasks
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pending}</div>
          <p className="text-xs text-muted-foreground">
            need attention
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.delayed}</div>
          <p className="text-xs text-muted-foreground">
            require immediate action
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
