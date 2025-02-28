import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Meeting, InsertMeeting } from "@shared/schema";
import { insertMeetingSchema } from "@shared/schema";

export default function Meetings() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"]
  });

  const form = useForm<InsertMeeting>({
    resolver: zodResolver(insertMeetingSchema),
    defaultValues: {
      title: "",
      notes: "",
      date: new Date().toISOString()
    }
  });

  const createMeeting = useMutation({
    mutationFn: async (data: InsertMeeting) => {
      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString()
      };
      const res = await apiRequest("POST", "/api/meetings", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Meeting created",
        description: "New meeting has been recorded successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create meeting",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    createMeeting.mutate(data);
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Record and summarize meeting notes</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Meeting</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMeeting.isPending}>
                  {createMeeting.isPending ? "Saving..." : "Save Meeting"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-semibold">{meeting.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Notes:</p>
                  <p className="whitespace-pre-wrap">{meeting.notes}</p>
                  {meeting.summary && (
                    <>
                      <p className="font-medium mt-4">AI Summary:</p>
                      <p className="whitespace-pre-wrap">{meeting.summary}</p>
                    </>
                  )}
                </div>
              </div>
              {!meeting.summary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => summarizeMeeting.mutate(meeting.id)}
                  disabled={summarizeMeeting.isPending}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Summarize
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}