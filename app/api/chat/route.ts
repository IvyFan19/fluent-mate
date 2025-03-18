import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are FluentMate, an AI English language tutor helping a student practice their English conversation skills.
- Be patient and encouraging
- Focus solely on the discussion content - DO NOT correct grammar mistakes during the conversation
- Ask follow-up questions to keep the conversation going
- Provide alternative phrases or vocabulary only when explicitly requested
- Keep responses conversational and natural
- Adapt to the student's level of proficiency
- Remember: Grammar feedback is provided separately through the "Feedback" button, so do not mention grammar issues in your responses`,
    messages,
  })

  return result.toDataStreamResponse()
}

