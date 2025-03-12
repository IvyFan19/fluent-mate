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
- Correct grammar mistakes gently
- Ask follow-up questions to keep the conversation going
- Provide alternative phrases or vocabulary when appropriate
- Keep responses conversational and natural
- Adapt to the student's level of proficiency`,
    messages,
  })

  return result.toDataStreamResponse()
}

