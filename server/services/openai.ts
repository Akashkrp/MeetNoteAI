import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateSummary(transcript: string, customPrompt: string): Promise<string> {
  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = response.choices[0].message.content;
    if (!summary) {
      throw new Error("No summary generated");
    }

    return summary;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}
