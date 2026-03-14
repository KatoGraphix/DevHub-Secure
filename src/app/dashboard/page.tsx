"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, KeyboardEvent } from "react"
import { motion } from "framer-motion"
import { 
  CheckSquare, 
  Sparkles, 
  Cpu, 
  Command, 
  ArrowRight 
} from "lucide-react"

interface GeneratedTask {
  title: string
  description?: string
  priority?: string
  due_date?: string | null
}

interface IntelligenceResponse {
  summary: string
  tasks: GeneratedTask[]
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IntelligenceResponse | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const runIntelligence = async () => {
    if (!input.trim() || analyzing) return
    setAnalyzing(true)
    setError(null)

    try {
      const res = await fetch("/api/task-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Unable to generate smart task right now.")
      }

      const data = (await res.json()) as IntelligenceResponse
      setResult(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the AI service."
      setError(message)
      setResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      void runIntelligence()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-10 py-12 space-y-12 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
          <CheckSquare size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Task Intelligence</h1>
          <p className="text-zinc-500 text-lg max-w-xl mt-2 leading-relaxed">
            Describe your task naturally. DevHub will understand and enhance it.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Card: Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-8 flex flex-col space-y-6 relative group hover:border-[#27272a] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-center text-blue-400/50">
              <Cpu size={20} />
            </div>
            <div className="flex-1">
              <textarea 
                placeholder={`"Describe what you need to do..."\n"Prepare investor pitch for DevHub next week"`}
                className="w-full bg-transparent text-zinc-300 placeholder:text-zinc-700 resize-none outline-none text-lg min-h-[120px] pt-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-600 font-medium">
            <div className="flex items-center gap-1.5 opacity-60">
                <Sparkles size={12} />
                <span className="uppercase tracking-widest">Natural language supported</span>
            </div>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1.5 opacity-60">
                <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[8px] text-zinc-600 font-mono">
                  <Command size={8} />
                  <span>Enter</span>
                </div>
                <span className="uppercase tracking-widest">to analyze</span>
            </div>
          </div>

          <button
            onClick={runIntelligence}
            disabled={analyzing || !input.trim()}
            className="w-full bg-[#18181b] border border-[#27272a] hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 py-4 rounded-xl flex items-center justify-center gap-3 text-zinc-400 font-bold text-sm uppercase tracking-widest transition-all group/btn mt-auto disabled:opacity-40 disabled:hover:bg-[#18181b] disabled:hover:border-[#27272a]"
          >
            <Sparkles size={18} className="group-hover/btn:scale-110 transition-transform" />
            <span>{analyzing ? "Analyzing..." : "Generate smart task"}</span>
          </button>
        </motion.div>

        {/* Right Card: Output */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-8 flex flex-col text-center space-y-4 hover:border-[#27272a] transition-all overflow-hidden relative"
        >
          {analyzing && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
              <div className="relative mb-2">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
                />
                <div className="w-4 h-4 bg-blue-400 rounded-full relative z-10 shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              </div>
              <h3 className="text-white text-lg font-bold">Analyzing task...</h3>
              <p className="text-zinc-600 text-sm max-w-[260px] leading-relaxed">
                DevHub is breaking this down into actionable steps.
              </p>
            </div>
          )}

          {!analyzing && error && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-3">
              <h3 className="text-red-400 text-lg font-bold">Unable to generate tasks</h3>
              <p className="text-zinc-500 text-sm max-w-[260px] leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {!analyzing && !error && result && (
            <div className="flex flex-col items-start text-left space-y-4 flex-1">
              <div>
                <h3 className="text-white text-lg font-bold mb-1">AI Task Plan</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <div className="space-y-2 w-full">
                {result.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="w-full rounded-xl border border-[#27272a] bg-[#09090b] px-4 py-3 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {task.title}
                      </p>
                      {task.priority && (
                        <span className="text-[10px] uppercase tracking-widest text-blue-400">
                          {task.priority}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-[10px] text-zinc-600 mt-1">
                        Due: {task.due_date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analyzing && !error && !result && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
              <div className="relative mb-4">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
                />
                <div className="w-3 h-3 bg-blue-400 rounded-full relative z-10 shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              </div>

              <h3 className="text-white text-lg font-bold">Waiting for task input</h3>
              <p className="text-zinc-600 text-sm max-w-[240px] leading-relaxed">
                AI insights will appear here once you describe your task
              </p>
            </div>
          )}

          {/* Decorative Corner Elements */}
          <div className="absolute top-4 right-4 text-zinc-800">
            <div className="w-2 h-2 border-t-2 border-r-2 border-current rounded-tr-sm" />
          </div>
          <div className="absolute bottom-4 left-4 text-zinc-800">
            <div className="w-2 h-2 border-b-2 border-l-2 border-current rounded-bl-sm" />
          </div>
        </motion.div>
      </div>

      {/* Footer Info / Tip */}
      <div className="flex items-center justify-between pt-10 border-t border-[#1c1c1f]">
        <div className="flex items-center gap-8">
            <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Model</p>
                <p className="text-xs text-zinc-400 font-medium tracking-tight">
                  {process.env.NEXT_PUBLIC_MODEL_NAME ?? "Configured via API"}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Context</p>
                <p className="text-xs text-zinc-400 font-medium tracking-tight">Active Project</p>
            </div>
        </div>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <span className="text-xs font-semibold uppercase tracking-widest">Explore Tools</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
