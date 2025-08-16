import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalTranscript: text("original_transcript").notNull(),
  customPrompt: text("custom_prompt").notNull(),
  generatedSummary: text("generated_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  summaryId: varchar("summary_id").references(() => summaries.id).notNull(),
  recipients: jsonb("recipients").$type<string[]>().notNull(),
  subject: text("subject").notNull(),
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
});

export const generateSummarySchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
  prompt: z.string().min(1, "Custom prompt is required"),
});

export const sendEmailSchema = z.object({
  summaryId: z.string().min(1, "Summary ID is required"),
  recipients: z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional(),
  includeOriginal: z.boolean().default(false),
  sendCopy: z.boolean().default(false),
});

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type GenerateSummaryRequest = z.infer<typeof generateSummarySchema>;
export type SendEmailRequest = z.infer<typeof sendEmailSchema>;
