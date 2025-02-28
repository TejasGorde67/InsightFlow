import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "on_hold"] }).notNull().default("active"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["completed", "pending", "delayed"] }).notNull().default("pending"),
  dueDate: timestamp("due_date"),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  title: text("title").notNull(),
  notes: text("notes"),
  summary: text("summary"),
  date: timestamp("date").notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").notNull(),
  type: text("type", { enum: ["weekly", "monthly"] }).notNull(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true, summary: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true });

// Types
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Report = typeof reports.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
