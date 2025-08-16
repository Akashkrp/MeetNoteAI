import { type Summary, type InsertSummary, type EmailLog, type InsertEmailLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Summary operations
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: string): Promise<Summary | undefined>;
  
  // Email log operations
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  getEmailLogsBySummaryId(summaryId: string): Promise<EmailLog[]>;
}

export class MemStorage implements IStorage {
  private summaries: Map<string, Summary>;
  private emailLogs: Map<string, EmailLog>;

  constructor() {
    this.summaries = new Map();
    this.emailLogs = new Map();
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = randomUUID();
    const summary: Summary = {
      ...insertSummary,
      id,
      createdAt: new Date(),
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async createEmailLog(insertEmailLog: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const emailLog: EmailLog = {
      id,
      summaryId: insertEmailLog.summaryId,
      recipients: Array.from(insertEmailLog.recipients),
      subject: insertEmailLog.subject,
      message: insertEmailLog.message || null,
      sentAt: new Date(),
    };
    this.emailLogs.set(id, emailLog);
    return emailLog;
  }

  async getEmailLogsBySummaryId(summaryId: string): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values()).filter(
      (log) => log.summaryId === summaryId
    );
  }
}

export const storage = new MemStorage();
