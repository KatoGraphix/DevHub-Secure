"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  Trash2,
  ChevronDown
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

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
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

function TasksContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({ priority: "", status: "", assignee: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to: ""
  })

  // Sync search from URL param
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  const createTask = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        assigned_to: newTask.assigned_to || null,
        created_by: user.id,
        status: "todo"
      })
      .select()

    if (error) { console.error("Error creating task:", error); return }

    // Trigger email notification if assigned
    if (newTask.assigned_to) {
      fetch("/api/notifications/task-assigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: data[0].id, assigneeId: newTask.assigned_to })
      }).catch(err => console.error("Notification failed:", err))
    }

    setTasks(prev => [data[0], ...prev])
    setShowCreateModal(false)
    setNewTask({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" })
  }

  const updateTaskAssignment = async (taskId: string, assignedTo: string) => {
    const { error } = await supabase.from("tasks").update({ assigned_to: assignedTo || null }).eq("id", taskId)
    if (error) { console.error("Error updating task assignment:", error); return }
    
    // Trigger email notification
    if (assignedTo) {
      fetch("/api/notifications/task-assigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, assigneeId: assignedTo })
      }).catch(err => console.error("Notification failed:", err))
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigned_to: assignedTo || null } : t))
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId)
    if (error) { console.error("Error updating task status:", error); return }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)
    if (error) { console.error("Error deleting task:", error); return }
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("id, first_name, last_name, email, role").order("first_name")
      if (error) { console.error("Error fetching users:", error); return }
      setUsers(data || [])
    }

    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*, assigned_profile:profiles!assigned_to(first_name, last_name), creator_profile:profiles!created_by(first_name, last_name)")
        .order("created_at", { ascending: false })
      if (data) setTasks(data)
      setLoading(false)
    }

    Promise.all([fetchTasks(), fetchUsers()])

    const channel = supabase
      .channel("tasks-realtime-devhub")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => { fetchTasks() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    const matchesPriority = !filters.priority || t.priority === filters.priority
    const matchesStatus = !filters.status || t.status === filters.status
    const matchesAssignee = !filters.assignee || t.assigned_to === filters.assignee
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-[#1c1c1f]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DEVHUB Schedule</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track your project tasks with AI assistance.</p>
        </div>

        <div className="flex items-center gap-4">
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

          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
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
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 bg-[#18181b] border rounded-xl text-xs font-semibold transition-all ${
            showFilters ? "border-blue-500/50 text-blue-400" : "border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46]"
          }`}
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-8 py-4 bg-[#09090b]/50 backdrop-blur-sm border-b border-[#1c1c1f] overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <button
                onClick={() => setFilters({ priority: "", status: "", assignee: "" })}
                className="self-end text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor} ${col.activeText}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{col.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
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
                            className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-blue-500/30 hover:bg-[#1d1d21] transition-all group shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority]}`}>
                                {task.priority}
                              </span>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={12} />
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
                            <div className="flex items-center gap-2 pt-3 border-t border-[#1c1c1f]">
                              {/* Assignee */}
                              <div className="relative">
                                {editingAssignee === task.id ? (
                                  <select
                                    value={task.assigned_to || ""}
                                    onChange={(e) => { updateTaskAssignment(task.id, e.target.value); setEditingAssignee(null) }}
                                    onBlur={() => setEditingAssignee(null)}
                                    className="w-24 bg-[#18181b] border border-blue-500 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                                    autoFocus
                                  >
                                    <option value="">Unassigned</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name}</option>)}
                                  </select>
                                ) : (
                                  <div 
                                    className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => setEditingAssignee(task.id)}
                                  >
                                    <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                      <UserIcon size={10} />
                                    </div>
                                    <span className="truncate max-w-[60px]">
                                      {task.assigned_profile ? task.assigned_profile.first_name : "Open"}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Status dropdown */}
                              <div className="ml-auto relative">
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                  className="appearance-none bg-[#0c0c0e] border border-[#27272a] hover:border-blue-500/40 text-zinc-500 hover:text-blue-400 rounded-lg pl-2 pr-5 py-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer focus:outline-none focus:border-blue-500/50 transition-all"
                                >
                                  {statusColumns.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                              </div>

                              {/* Due date */}
                              {task.due_date && (
                                <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold shrink-0">
                                  <Calendar size={10} />
                                  <span>{new Date(task.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => { setShowCreateModal(true) }}
                    className="p-3 text-[10px] text-zinc-600 hover:text-blue-400 font-bold uppercase tracking-widest text-center border-t border-[#1c1c1f] hover:bg-blue-500/5 transition-all"
                  >
                    + Add Task
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
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
                    <th className="px-6 py-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1f]">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{task.title}</p>
                          {task.description && <p className="text-xs text-zinc-600 mt-1 truncate max-w-sm">{task.description}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <UserIcon size={12} className="text-zinc-500" />
                          </div>
                          {editingAssignee === task.id ? (
                            <select
                              value={task.assigned_to || ""}
                              onChange={(e) => { updateTaskAssignment(task.id, e.target.value); setEditingAssignee(null) }}
                              onBlur={() => setEditingAssignee(null)}
                              className="bg-[#18181b] border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                              autoFocus
                            >
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                            </select>
                          ) : (
                            <span
                              className="text-xs font-bold text-zinc-400 cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => setEditingAssignee(task.id)}
                            >
                              {task.assigned_profile ? `${task.assigned_profile.first_name} ${task.assigned_profile.last_name}` : "UNASSIGNED"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className={`appearance-none bg-transparent border rounded-lg pl-2 pr-6 py-1 text-[9px] font-black uppercase tracking-widest cursor-pointer focus:outline-none transition-all ${
                              task.status === "done" ? "border-emerald-500/30 text-emerald-400" :
                              task.status === "in_progress" ? "border-blue-500/30 text-blue-400" :
                              task.status === "review" ? "border-amber-500/30 text-amber-400" :
                              "border-zinc-700 text-zinc-400"
                            }`}
                          >
                            {statusColumns.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold border uppercase tracking-widest ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-mono text-[10px] text-zinc-500 font-bold">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString("en-ZA", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\//g, ".") : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">No tasks found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-white mb-4">Create New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Task description (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Assign To</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TasksContent />
    </Suspense>
  )
}
