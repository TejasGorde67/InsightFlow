import {
  type Project, type Task, type Meeting, type Report,
  type InsertProject, type InsertTask, type InsertMeeting, type InsertReport
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;

  // Tasks
  getTasks(projectId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Meetings
  getMeetings(projectId?: number): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<Meeting>): Promise<Meeting>;

  // Reports
  getReports(projectId?: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private meetings: Map<number, Meeting>;
  private reports: Map<number, Report>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.meetings = new Map();
    this.reports = new Map();
    this.currentIds = { projects: 1, tasks: 1, meetings: 1, reports: 1 };
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentIds.projects++;
    const newProject = {
      id,
      name: project.name,
      description: project.description || null,
      status: project.status || "active"
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const existing = await this.getProject(id);
    if (!existing) throw new Error("Project not found");
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  // Tasks
  async getTasks(projectId?: number): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return projectId ? tasks.filter(t => t.projectId === projectId) : tasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentIds.tasks++;
    const newTask = {
      id,
      title: task.title,
      description: task.description || null,
      status: task.status || "pending",
      projectId: task.projectId || null,
      dueDate: task.dueDate || null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const existing = await this.getTask(id);
    if (!existing) throw new Error("Task not found");
    const updated = { ...existing, ...task };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Meetings
  async getMeetings(projectId?: number): Promise<Meeting[]> {
    const meetings = Array.from(this.meetings.values());
    return projectId ? meetings.filter(m => m.projectId === projectId) : meetings;
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    try {
      const id = this.currentIds.meetings++;
      const newMeeting = {
        id,
        title: meeting.title,
        date: new Date(meeting.date),
        notes: meeting.notes || null,
        summary: null,
        projectId: meeting.projectId || null
      };
      this.meetings.set(id, newMeeting);
      return newMeeting;
    } catch (error) {
      console.error('Error in createMeeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  async updateMeeting(id: number, meeting: Partial<Meeting>): Promise<Meeting> {
    const existing = await this.getMeeting(id);
    if (!existing) throw new Error("Meeting not found");
    const updated = { ...existing, ...meeting };
    this.meetings.set(id, updated);
    return updated;
  }

  // Reports
  async getReports(projectId?: number): Promise<Report[]> {
    const reports = Array.from(this.reports.values());
    return projectId ? reports.filter(r => r.projectId === projectId) : reports;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentIds.reports++;
    const newReport = {
      id,
      type: report.type,
      content: report.content,
      projectId: report.projectId || null,
      generatedAt: report.generatedAt
    };
    this.reports.set(id, newReport);
    return newReport;
  }
}

export const storage = new MemStorage();