import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Report } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports"]
  });

  const generateReport = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reports/generate", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report generated",
        description: "AI has generated a new weekly report"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">AI-generated project insights and summaries</p>
        </div>

        <Button onClick={() => generateReport.mutate()} disabled={generateReport.isPending}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {new Date(report.generatedAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {JSON.parse(report.content).map((section: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {section.items.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}