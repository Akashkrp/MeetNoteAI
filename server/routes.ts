import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateSummarySchema, sendEmailSchema } from "@shared/schema";
import { generateSummary } from "./services/openai";
import { sendSummaryEmail } from "./services/email";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept text files and documents
    if (file.mimetype === 'text/plain' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only text files (.txt, .doc, .docx) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text from buffer (assuming it's a text file)
      const text = req.file.buffer.toString('utf-8');
      
      res.json({ 
        text,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate summary endpoint
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const validatedData = generateSummarySchema.parse(req.body);
      
      // Generate summary using OpenAI
      const generatedSummary = await generateSummary(
        validatedData.transcript,
        validatedData.prompt
      );

      // Save to storage
      const summary = await storage.createSummary({
        originalTranscript: validatedData.transcript,
        customPrompt: validatedData.prompt,
        generatedSummary,
      });

      res.json(summary);
    } catch (error: any) {
      console.error("Summary generation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update summary endpoint
  app.patch("/api/summaries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { generatedSummary } = req.body;

      if (!generatedSummary) {
        return res.status(400).json({ message: "Generated summary is required" });
      }

      const summary = await storage.getSummary(id);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      // In a real implementation, you'd update the summary
      // For now, return the updated summary
      const updatedSummary = {
        ...summary,
        generatedSummary
      };

      res.json(updatedSummary);
    } catch (error: any) {
      console.error("Summary update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Send email endpoint
  app.post("/api/send-email", async (req, res) => {
    try {
      const validatedData = sendEmailSchema.parse(req.body);
      
      const summary = await storage.getSummary(validatedData.summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      // Send email
      await sendSummaryEmail({
        recipients: validatedData.recipients,
        subject: validatedData.subject,
        summaryContent: summary.generatedSummary,
        originalTranscript: validatedData.includeOriginal ? summary.originalTranscript : undefined,
        additionalMessage: validatedData.message,
        includeOriginal: validatedData.includeOriginal,
        sendCopy: validatedData.sendCopy,
      });

      // Log email
      await storage.createEmailLog({
        summaryId: validatedData.summaryId,
        recipients: validatedData.recipients,
        subject: validatedData.subject,
        message: validatedData.message,
      });

      res.json({ 
        message: "Email sent successfully",
        recipientCount: validatedData.recipients.length
      });
    } catch (error: any) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get summary endpoint
  app.get("/api/summaries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const summary = await storage.getSummary(id);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      res.json(summary);
    } catch (error: any) {
      console.error("Get summary error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
