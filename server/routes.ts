import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWeeklyReport, summarizeMeetingNotes } from "./openai";
import { insertProjectSchema, insertTaskSchema, insertMeetingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid project data" });
    }
    const project = await storage.createProject(parsed.data);
    res.json(project);
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const tasks = await storage.getTasks(projectId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const parsed = insertTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid task data" });
    }
    const task = await storage.createTask(parsed.data);
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const task = await storage.updateTask(Number(req.params.id), req.body);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // Meetings
  app.get("/api/meetings", async (req, res) => {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const meetings = await storage.getMeetings(projectId);
    res.json(meetings);
  });

  app.post("/api/meetings", async (req, res) => {
    const parsed = insertMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid meeting data" });
    }
    const meeting = await storage.createMeeting(parsed.data);
    res.json(meeting);
  });

  app.post("/api/meetings/:id/summarize", async (req, res) => {
    try {
      const meeting = await storage.getMeeting(Number(req.params.id));
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      const summary = await summarizeMeetingNotes(meeting.notes || "");
      const updated = await storage.updateMeeting(meeting.id, { summary });
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to summarize meeting";
      res.status(500).json({ error: message });
    }
  });

  // Reports
  app.get("/api/reports", async (req, res) => {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const reports = await storage.getReports(projectId);
    res.json(reports);
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { projectId } = req.body;
      const [tasks, meetings] = await Promise.all([
        storage.getTasks(projectId),
        storage.getMeetings(projectId)
      ]);

      const content = await generateWeeklyReport(tasks, meetings);
      const report = await storage.createReport({
        projectId,
        content,
        generatedAt: new Date(),
        type: "weekly"
      });

      res.json(report);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate report";
      res.status(500).json({ error: message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}