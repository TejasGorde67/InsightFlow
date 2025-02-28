import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateWeeklyReport(tasks: any[], meetings: any[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Generate a detailed weekly project report based on the following data:
Tasks: ${JSON.stringify(tasks)}
Meetings: ${JSON.stringify(meetings)}

Please analyze the data and create a professional report that includes:
1. Overall project progress
2. Key accomplishments
3. Challenges faced
4. Next week's priorities
5. Meeting highlights

Respond with JSON in this format:
{
  "summary": string,
  "accomplishments": string[],
  "challenges": string[],
  "priorities": string[],
  "meetingHighlights": string[]
}` }],
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content || '{"error": "No content generated"}';
  } catch (error) {
    if (error instanceof Error) {
      console.error('OpenAI API Error:', error);
      if ((error as any).status === 429) {
        throw new Error('AI service is currently unavailable due to rate limiting. Please try again later.');
      }
      throw new Error(`Failed to generate report: ${error.message}`);
    }
    throw new Error('Failed to generate report: Unknown error');
  }
}

async function summarizeMeetingNotes(notes: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Please summarize the following meeting notes concisely, highlighting key decisions and action items:

${notes}

Respond with JSON in this format:
{
  "summary": string,
  "decisions": string[],
  "actionItems": string[]
}` }],
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content || '{"error": "No content generated"}';
  } catch (error) {
    if (error instanceof Error) {
      console.error('OpenAI API Error:', error);
      if ((error as any).status === 429) {
        throw new Error('AI service is currently unavailable due to rate limiting. Please try again later.');
      }
      throw new Error(`Failed to summarize notes: ${error.message}`);
    }
    throw new Error('Failed to summarize notes: Unknown error');
  }
}

export { generateWeeklyReport, summarizeMeetingNotes };