"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Filter, 
  Search, 
  Kanban as KanbanIcon, 
  List as ListIcon,
  Calendar,
  User as UserIcon,
  MoreVertical,
  Circle
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  assigned_profile?: { first_name: string; last_name: string } | null
  creator_profile?: { first_name: string; last_name: string } | null
}

const statusColumns = [
  { key: "todo", label: "To Do", dotColor: "bg-zinc-500", activeText: "text-zinc-500" },
  { key: "in_progress", label: "In Progress", dotColor: "bg-blue-500", activeText: "text-blue-500" },
  { key: "review", label: "Review", dotColor: "bg-amber-500", activeText: "text-amber-500" },
  { key: "done", label: "Done", dotColor: "bg-emerald-500", activeText: "text-emerald-500" },
]

const priorityStyles: Record<string, string> = {
  low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function TasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*, assigned_profile:profiles!assigned_to(first_name, last_name), creator_profile:profiles!created_by(first_name, last_name)")
        .order("created_at", { ascending: false })

      if (data) setTasks(data)
      setLoading(false)
    }
    fetchTasks()

    const channel = supabase
      .channel("tasks-realtime-devhub")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Dynamic Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-[#1c1c1f]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DEVHUB Schedule</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track your project tasks with AI assistance.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === "kanban" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <KanbanIcon size={14} />
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ListIcon size={14} />
              List
            </button>
          </div>

          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
            <Plus size={16} />
            Create Task
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-8 py-4 flex items-center gap-4 bg-[#09090b]/50 backdrop-blur-sm sticky top-0 z-10 border-b border-[#1c1c1f]">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all">
          <Filter size={14} />
          Filters
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {view === "kanban" ? (
          <div className="p-8 flex gap-6 h-full min-w-max">
            {statusColumns.map((col) => {
              const colTasks = filteredTasks.filter(t => t.status === col.key)
              return (
                <div key={col.key} className="w-80 flex flex-col h-full bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl overflow-hidden">
                  {/* Column Header */}
                  <div className="p-4 flex items-center justify-between border-b border-[#1c1c1f] bg-zinc-900/10">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor} shadow-[0_0_8px_currentColor] ${col.activeText}`} />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{col.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards Area */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {colTasks.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border border-dashed border-[#1c1c1f] rounded-xl p-8 text-center"
                            >
                                <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">System Ready <br/> No active tasks</p>
                            </motion.div>
                        ) : (
                            colTasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-blue-500/30 hover:bg-[#1d1d21] transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                        <button className="text-zinc-700 group-hover:text-zinc-400">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug">
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 pt-4 border-t border-[#1c1c1f]">
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                                <UserIcon size={10} />
                                            </div>
                                            <span className="truncate max-w-[80px]">
                                                {task.assigned_profile ? task.assigned_profile.first_name : "Open"}
                                            </span>
                                        </div>
                                        {task.due_date && (
                                            <div className="ml-auto flex items-center gap-1 text-[10px] text-zinc-600 font-bold">
                                                <Calendar size={12} />
                                                <span>{new Date(task.due_date).toLocaleDateString("en-ZA", { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Footer Action */}
                  <button className="p-3 text-[10px] text-zinc-600 hover:text-blue-400 font-bold uppercase tracking-widest text-center border-t border-[#1c1c1f] hover:bg-blue-500/5 transition-all">
                    + Add New Phase
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View Overhaul */
          <div className="p-8">
            <div className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/10 border-b border-[#1c1c1f]">
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Task Title</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Assignee</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Priority</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c1c1f]">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-white/[0.02] transition-all group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <Circle className="w-2 h-2 text-zinc-800 group-hover:text-blue-500 transition-colors" />
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{task.title}</p>
                                            {task.description && <p className="text-xs text-zinc-600 mt-1 truncate max-w-sm">{task.description}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                            <UserIcon size={12} className="text-zinc-500" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-400">
                                            {task.assigned_profile ? `${task.assigned_profile.first_name} ${task.assigned_profile.last_name}` : "UNASSIGNED"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const s = statusColumns.find(c => c.key === task.status)
                                            return (
                                                <>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${s?.dotColor} shadow-[0_0_8px_currentColor] ${s?.activeText}`} />
                                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{s?.label}</span>
                                                </>
                                            )
                                        })()}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold border uppercase tracking-widest ${priorityStyles[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-5 font-mono text-[10px] text-zinc-500 font-bold">
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-ZA", { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : "00.00.00"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
