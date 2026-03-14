const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

export interface AiChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface TaskIntelligenceResult {
  summary: string
  tasks: {
    title: string
    description?: string
    priority?: string
    due_date?: string | null
  }[]
}

export function isAiConfigured() {
  return Boolean(OPENAI_API_KEY)
}

export async function runChatCompletion(messages: AiChatMessage[]) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "OpenAI API returned a non-OK response")
  }

  type OpenAIChatResponse = {
    choices?: {
      message?: {
        content?: string
      }
    }[]
  }

  const json = (await response.json()) as OpenAIChatResponse
  const content =
    json.choices?.[0]?.message?.content ??
    '{"summary":"Unable to parse AI response.","tasks":[]}'

  return content as string
}

export async function generateTaskIntelligence(
  description: string
): Promise<TaskIntelligenceResult> {
  const systemPrompt =
    "You are an expert project planner that converts a short natural-language task description into 3–7 concrete, actionable subtasks. " +
    "Respond strictly as JSON with keys: summary (string) and tasks (array of { title, description, priority, due_date }). " +
    'priority must be one of \"low\" | \"medium\" | \"high\" | \"urgent\". due_date can be a short human-readable string or null.'

  const raw = await runChatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Task description:\n${description}` },
  ])

  try {
    return JSON.parse(raw) as TaskIntelligenceResult
  } catch {
    return {
      summary:
        "AI returned an unexpected format. Showing raw suggestion instead.",
      tasks: [
        {
          title: description,
          description: raw,
          priority: "medium",
        },
      ],
    }
  }
}

