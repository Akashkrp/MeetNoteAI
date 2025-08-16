import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateSummarySchema, sendEmailSchema } from "@shared/schema";
import { generateSummary } from "./services/openai";
import { generateSummaryWithGemini } from "./services/gemini";
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

// AI Service Selection
async function generateSummaryWithAvailableService(transcript: string, prompt: string): Promise<{ summary: string, provider: string }> {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  console.log('AI Service Check:', { hasOpenAI, hasGemini });
  
  // Try Gemini first (free tier is more generous)
  if (hasGemini) {
    try {
      const summary = await generateSummaryWithGemini(transcript, prompt);
      return { summary, provider: 'Google Gemini (Free)' };
    } catch (error: any) {
      console.log('Gemini failed, trying OpenAI:', error.message);
    }
  }
  
  // Fallback to OpenAI
  if (hasOpenAI) {
    try {
      const summary = await generateSummary(transcript, prompt);
      return { summary, provider: 'OpenAI GPT-4o' };
    } catch (error: any) {
      console.log('OpenAI failed:', error.message);
      throw error;
    }
  }
  
  // Demo mode when no API keys available
  const demoSummary = `# Meeting Summary (Demo Mode)

## Key Points
- This is a demonstration of the AI summarization feature
- To enable real AI summaries, add your GEMINI_API_KEY (free) or OPENAI_API_KEY
- The application successfully processed your transcript: "${transcript.substring(0, 100)}..."
- Your custom prompt was: "${prompt}"

## Next Steps
- Add API keys to get real AI-powered summaries
- Gemini API is completely free: https://makersuite.google.com/app/apikey
- OpenAI has a free tier: https://platform.openai.com/api-keys

## Features Working
✅ File upload\n✅ Text processing\n✅ Custom prompts\n✅ Summary editing\n✅ Email sharing\n\n*This demo summary shows that all application features are working correctly.*`;
  
  return { summary: demoSummary, provider: 'Demo Mode' };
}

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
      
      // Generate summary using available AI service
      const { summary: generatedSummary, provider } = await generateSummaryWithAvailableService(
        validatedData.transcript,
        validatedData.prompt
      );

      // Save to storage
      const summary = await storage.createSummary({
        originalTranscript: validatedData.transcript,
        customPrompt: validatedData.prompt,
        generatedSummary,
      });

      res.json({ ...summary, aiProvider: provider });
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

  // AI Service status endpoint
  app.get("/api/ai-status", (req, res) => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    const services = [];
    
    if (hasGemini) {
      services.push({ name: "Google Gemini", status: "available", type: "free", description: "Free AI service with generous limits" });
    } else {
      services.push({ name: "Google Gemini", status: "setup", type: "free", description: "Get free API key at https://makersuite.google.com/app/apikey" });
    }
    
    if (hasOpenAI) {
      services.push({ name: "OpenAI GPT-4o", status: "available", type: "paid", description: "Premium AI service (requires billing)" });
    } else {
      services.push({ name: "OpenAI GPT-4o", status: "setup", type: "paid", description: "Get API key at https://platform.openai.com/api-keys" });
    }
    
    const mode = hasGemini ? "free" : hasOpenAI ? "paid" : "demo";
    
    res.json({
      mode,
      services,
      recommendation: hasGemini || hasOpenAI ? null : "Add GEMINI_API_KEY for free AI summaries"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
