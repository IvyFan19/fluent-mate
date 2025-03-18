import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { text } = await req.json()

  // Use OpenAI directly for simplicity
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a grammar checking assistant. Analyze the provided text and identify any grammar errors.
          
          I need you to output a JSON object with these properties:
          1. "sentence": The complete original sentence
          2. "errorWord": The incorrect word or phrase (e.g., "is using")
          3. "correctionWord": The corrected word or phrase (e.g., "uses")
          
          Example:
          For input: "I am go well."
          Output: {"sentence": "I am go well.", "errorWord": "go", "correctionWord": "going"}
          
          If there are no errors, set errorWord and correctionWord to empty strings.
          
          Only provide a single error correction per sentence. If multiple errors exist, focus on the most important one.
          
          Provide ONLY the JSON object and nothing else in your response.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Return as JSON
  return Response.json(JSON.parse(content));
} 