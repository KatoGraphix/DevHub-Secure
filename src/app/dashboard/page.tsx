"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  CheckSquare, 
  Sparkles, 
  Cpu, 
  Command, 
  ArrowRight 
} from "lucide-react"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Keep loading state simulation for smooth transition
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

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
                placeholder='"Describe what you need to do... &#10;"Prepare investor pitch for DevHub next week"'
                className="w-full bg-transparent text-zinc-300 placeholder:text-zinc-700 resize-none outline-none text-lg min-h-[120px] pt-1"
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

          <button className="w-full bg-[#18181b] border border-[#27272a] hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 py-4 rounded-xl flex items-center justify-center gap-3 text-zinc-400 font-bold text-sm uppercase tracking-widest transition-all group/btn mt-auto">
            <Sparkles size={18} className="group-hover/btn:scale-110 transition-transform" />
            <span>Generate smart task</span>
          </button>
        </motion.div>

        {/* Right Card: Output Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#27272a] transition-all overflow-hidden relative"
        >
          {/* Glowing Orb */}
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
                <p className="text-xs text-zinc-400 font-medium tracking-tight">GPT-4 Turbo</p>
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
