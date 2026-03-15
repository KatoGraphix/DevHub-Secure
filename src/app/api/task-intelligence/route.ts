import { NextResponse } from "next/server"
import {
  generateTaskIntelligence,
  isAiConfigured,
} from "@/lib/ai"

interface RequestBody {
  description?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody
  const description = body.description?.trim()

  if (!description) {
    return NextResponse.json(
      { error: "Please provide a non-empty task description." },
      { status: 400 }
    )
  }

  if (!isAiConfigured()) {
    return NextResponse.json({
      summary:
        "AI provider is not configured. This plan was generated locally as a simple breakdown of your request.",
      tasks: [
        {
          title: description,
          description:
            "Single high-level task based on your description. Configure OPENAI_API_KEY to enable richer AI planning.",
          priority: "medium",
        },
      ],
    })
  }

  try {
    const result = await generateTaskIntelligence(description)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Task intelligence error:", error)
    const raw = error instanceof Error ? error.message : String(error)
    if (raw.includes("insufficient_quota")) {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please check your plan and billing at platform.openai.com." },
        { status: 402 }
      )
    }
    if (raw.includes("invalid_api_key") || raw.includes("Incorrect API key")) {
      return NextResponse.json(
        { error: "The OPENAI_API_KEY secret is invalid. Update it in your Replit Secrets." },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to contact the AI service. Please try again later." },
      { status: 500 }
    )
  }
}

