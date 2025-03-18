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
          content: `You are a grammar checking assistant with expertise in English language. Analyze the provided text for grammar, spelling, and usage errors.
          
          IMPORTANT: Only identify ACTUAL errors. Do not create false positives. If a sentence is grammatically correct, do not suggest changes.
          Be conservative in your corrections - if something could be correct in context, leave it alone.
          
          For each genuine error you find, please:
          1. Verify that your correction is a real English word or phrase
          2. Ensure the correction maintains the original meaning
          3. Consider the context of the entire sentence
          
          I need you to output a JSON object with these properties:
          1. "sentence": The complete original sentence
          2. "errors": An array of error objects, ONLY for genuine errors, each containing:
             - "errorWord": The incorrect word or phrase (exact match from the text)
             - "correctionWord": The corrected word or phrase
             - "position": Approximate position of the error in the text (character index)
             - "explanation": A very brief explanation of the error (1-5 words)
          
          Example:
          For input: "I am go well and he are happy."
          Output: {
            "sentence": "I am go well and he are happy.",
            "errors": [
              {"errorWord": "go", "correctionWord": "going", "position": 5, "explanation": "incorrect verb form"},
              {"errorWord": "are", "correctionWord": "is", "position": 17, "explanation": "subject-verb agreement"}
            ]
          }
          
          If there are no errors, return an empty errors array: {"sentence": "text", "errors": []}
          
          VERIFY each correction carefully before including it. When in doubt, do not include it as an error.
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