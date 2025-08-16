import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSummaryWithGemini(transcript: string, customPrompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert meeting summarizer. Your task is to analyze meeting transcripts and create structured summaries based on specific user instructions.

Guidelines:
- Follow the user's custom instructions precisely
- Create well-structured, easy-to-read summaries
- Use proper formatting with headings, bullet points, and sections as appropriate
- Ensure all key information from the transcript is captured according to the user's requirements
- Make the summary actionable and useful for the intended audience`;

    const userPrompt = `Please summarize the following meeting transcript according to these specific instructions:

INSTRUCTIONS: ${customPrompt}

TRANSCRIPT:
${transcript}

Please provide a well-formatted summary that follows the instructions above.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error("No summary generated");
    }

    return summary;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}