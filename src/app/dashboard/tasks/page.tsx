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
  ChevronDown,
  BarChart3,
  CheckCircle2,
  Activity,
  Download,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { exportAdvancedReport } from "@/utils/export-pdf"

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
  completed_at?: string | null
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
  { key: "in_progress", label: "In Progress", dotColor: "bg-cyan-500", activeText: "text-cyan-500" },
  { key: "review", label: "Review", dotColor: "bg-amber-500", activeText: "text-amber-500" },
  { key: "done", label: "Done", dotColor: "bg-emerald-500", activeText: "text-emerald-500" },
]

const priorityStyles: Record<string, string> = {
  low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  medium: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
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
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [filters, setFilters] = useState({ priority: "", status: "", assignee: "", startDate: "", endDate: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
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

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)
      const isAdmin = currentUser?.role === "admin_assigner"
      const exportTasks = isAdmin ? tasks : tasks.filter(t => t.assigned_to === currentUser?.id)
      
      const exportStats = {
        total: exportTasks.length,
        completed: exportTasks.filter(t => t.status === "done").length,
        pending: exportTasks.length - exportTasks.filter(t => t.status === "done").length,
        rate: exportTasks.length > 0 
          ? Math.round((exportTasks.filter(t => t.status === "done").length / exportTasks.length) * 100).toString()
          : '0'
      }

      await exportAdvancedReport(
        exportTasks.map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          assignee: t.assigned_profile?.first_name || 'Open',
          created_at: t.created_at,
          completed_at: t.completed_at || undefined
        })),
        exportStats,
        isAdmin ? "ALL OPERATORS" : `${currentUser?.first_name} ${currentUser?.last_name}`,
        filters.startDate || filters.endDate 
          ? `${filters.startDate || '...'} to ${filters.endDate || '...'}`
          : undefined
      )
      
      toast.success("Mission Report Dispatched", {
        description: "Check your local downloads terminal.",
        style: { background: '#020617', border: '1px solid #06b6d4', color: '#06b6d4' }
      })
    } catch (err) {
      console.error("[PDF] Export Failed:", err)
      toast.error("Export Failed", {
        description: "Manual override required. Check console for details."
      })
    } finally {
      setExporting(false)
    }
  }

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
    const completedAt = status === "done" ? new Date().toISOString() : null
    const { error } = await supabase.from("tasks").update({ status, completed_at: completedAt }).eq("id", taskId)
    if (error) { console.error("Error updating task status:", error); return }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, completed_at: completedAt } : t))

    if (status === "done") {
      fetch("/api/notifications/task-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      }).catch(err => console.error("Notification Error:", err))
    }
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

    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) setCurrentUser(profile)
    }

    Promise.all([fetchTasks(), fetchUsers(), fetchCurrentUser()])

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
    const matchesDate = (!filters.startDate || new Date(t.created_at) >= new Date(filters.startDate)) &&
                        (!filters.endDate || new Date(t.created_at) <= new Date(filters.endDate + 'T23:59:59'))
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee && matchesDate
  })

  // Calculate Stats based on filtered tasks
  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter(t => t.status === "done").length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#020617]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] relative">
      <div className="absolute inset-0 z-0 opacity-[0.01] pointer-events-none select-none overflow-hidden text-[8px] leading-none text-cyan-500 break-all whitespace-normal font-mono">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="mb-0.5">
            {Math.random().toString(36).substring(2).repeat(15)}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-cyan-500/10 z-10">
        <div>
          <h1 className="text-2xl font-black text-white tracking-[0.1em] uppercase">Smart Schedule</h1>
          <p className="text-cyan-500/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Manage and track your project tasks with AI assistance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#0c0c0e]/50 backdrop-blur-sm border border-cyan-500/10 rounded-xl p-1">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                showAnalytics ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-zinc-500 hover:text-cyan-400/60"
              }`}
            >
              <BarChart3 size={12} />
              Stats
            </button>
            <div className="w-[1px] bg-cyan-500/10 mx-1 self-stretch" />
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                view === "kanban" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-zinc-500 hover:text-cyan-400/60"
              }`}
            >
              <KanbanIcon size={12} />
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                view === "list" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-zinc-500 hover:text-cyan-400/60"
              }`}
            >
              <ListIcon size={12} />
              List
            </button>
          </div>

          <button 
            disabled={exporting}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] disabled:opacity-50"
          >
            {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {exporting ? "Compiling..." : "Export"}
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar z-10">
        {/* Task Analytics Grid (Dropdown Tray) */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-cyan-500/5 bg-cyan-500/[0.01]"
            >
              <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Operations", value: totalTasks, icon: BarChart3, color: "text-cyan-400" },
                  { label: "Mission Completed", value: completedTasks, icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "Tasks Pending", value: pendingTasks, icon: Activity, color: "text-amber-400" },
                  { label: "Completion Rate", value: `${completionRate}%`, icon: KanbanIcon, color: "text-fuchsia-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#0c0c0e]/50 border border-cyan-500/10 rounded-2xl p-4 flex items-center justify-between group hover:border-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.02)]"
                  >
                    <div>
                      <p className="text-[9px] font-bold text-cyan-500/40 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                    <div className={`p-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={16} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Bar */}
        <div className="px-8 py-8 flex items-center gap-4 sticky top-0 bg-[#020617]/80 backdrop-blur-md">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/20 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0c0c0e]/50 border border-cyan-500/10 rounded-xl py-2 pl-10 pr-4 text-[11px] font-medium text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 bg-[#0c0c0e] border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              showFilters ? "border-cyan-500/30 text-cyan-400" : "border-cyan-500/10 text-cyan-500/40 hover:text-cyan-400 hover:border-cyan-500/20"
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
              className="px-8 py-4 bg-[#0c0c0e]/40 backdrop-blur-sm border-b border-cyan-500/10 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-[8px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="bg-[#0c0c0e] border border-cyan-500/10 rounded-lg px-3 py-1 text-[10px] text-cyan-400/60 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="bg-[#0c0c0e] border border-cyan-500/10 rounded-lg px-3 py-1 text-[10px] text-cyan-400/60 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-[#0c0c0e] border border-cyan-500/10 rounded-lg px-3 py-1 text-[10px] text-cyan-400/60 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-[#0c0c0e] border border-cyan-500/10 rounded-lg px-3 py-1 text-[10px] text-cyan-400/60 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Operative</label>
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                    className="bg-[#0c0c0e] border border-cyan-500/10 rounded-lg px-3 py-1 text-[10px] text-cyan-400/60 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="">All Operatives</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setFilters({ priority: "", status: "", assignee: "", startDate: "", endDate: "" })}
                  className="self-end text-[9px] font-black text-cyan-500/40 hover:text-cyan-400 underline uppercase tracking-widest"
                >
                  Clear filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === "kanban" ? (
          <div className="p-4 lg:p-8 flex flex-col lg:flex-row gap-6 h-full min-w-0 lg:min-w-max">
            {statusColumns.map((col) => {
              const colTasks = filteredTasks.filter(t => t.status === col.key)
              return (
                <div key={col.key} className="w-full lg:w-80 flex flex-col flex-shrink-0 min-h-[400px] lg:h-full bg-[#0c0c0e]/30 border border-cyan-500/10 rounded-2xl overflow-hidden">
                  {/* Column Header */}
                  <div className="p-4 flex items-center justify-between border-b border-cyan-500/5 bg-cyan-500/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor} shadow-[0_0_8px_currentColor]`} />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{col.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-cyan-500/40 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-full">
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
                          className="border border-dashed border-cyan-500/5 rounded-xl p-8 text-center"
                        >
                          <p className="text-[9px] font-bold text-cyan-500/20 uppercase tracking-widest leading-relaxed">System Ready <br/> No active tasks</p>
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
                            className="bg-[#0c0c0e]/50 backdrop-blur-sm border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all group shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${priorityStyles[task.priority]}`}>
                                {task.priority}
                              </span>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="text-zinc-800 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug tracking-tight">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-zinc-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/5">
                              {/* Assignee */}
                              <div className="relative">
                                {editingAssignee === task.id ? (
                                  <select
                                    value={task.assigned_to || ""}
                                    onChange={(e) => { updateTaskAssignment(task.id, e.target.value); setEditingAssignee(null) }}
                                    onBlur={() => setEditingAssignee(null)}
                                    className="w-24 bg-[#0c0c0e] border border-cyan-500 rounded px-2 py-1 text-[9px] text-cyan-400 focus:outline-none font-mono"
                                    autoFocus
                                  >
                                    <option value="">Unassigned</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name}</option>)}
                                  </select>
                                ) : (
                                  <div 
                                    className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-bold uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                                    onClick={() => setEditingAssignee(task.id)}
                                  >
                                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
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
                                  className="appearance-none bg-[#0c0c0e] border border-cyan-500/10 hover:border-cyan-500/40 text-[9px] font-black uppercase text-cyan-500/40 hover:text-cyan-400 rounded-lg pl-2 pr-5 py-1 tracking-widest cursor-pointer focus:outline-none transition-all"
                                >
                                  {statusColumns.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-cyan-500/20 pointer-events-none" />
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
                    className="p-3 text-[9px] text-cyan-500/40 hover:text-cyan-400 font-black uppercase tracking-widest text-center border-t border-cyan-500/5 hover:bg-cyan-500/[0.02] transition-all"
                  >
                    + Add Task
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8">
            <div className="bg-[#0c0c0e]/30 border border-cyan-500/10 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-cyan-500/[0.02] border-b border-cyan-500/10">
                    <th className="px-6 py-4 text-[9px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">Task Title</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">Assignee</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">Priority</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">Timeline</th>
                    <th className="px-6 py-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/5">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-cyan-500/[0.01] transition-all group">
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">{task.title}</p>
                          {task.description && <p className="text-[10px] text-zinc-600 mt-1 truncate max-w-sm uppercase tracking-widest font-bold">{task.description}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <UserIcon size={12} className="text-zinc-600" />
                          </div>
                          {editingAssignee === task.id ? (
                            <select
                              value={task.assigned_to || ""}
                              onChange={(e) => { updateTaskAssignment(task.id, e.target.value); setEditingAssignee(null) }}
                              onBlur={() => setEditingAssignee(null)}
                              className="bg-[#0c0c0e] border border-cyan-500 rounded px-2 py-1 text-[10px] text-cyan-400 focus:outline-none"
                              autoFocus
                            >
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                            </select>
                          ) : (
                            <span
                              className="text-[10px] font-black text-cyan-500/40 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors"
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
                            className={`appearance-none bg-transparent border rounded-lg pl-2 pr-6 py-1 text-[8px] font-black uppercase tracking-widest cursor-pointer focus:outline-none transition-all ${
                              task.status === "done" ? "border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]" :
                              task.status === "in_progress" ? "border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]" :
                              task.status === "review" ? "border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]" :
                              "border-cyan-500/10 text-cyan-500/40"
                            }`}
                          >
                            {statusColumns.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-cyan-500/20 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-black border uppercase tracking-widest ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-mono text-[9px] text-cyan-500/40 font-bold uppercase tracking-[0.1em]">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString("en-ZA", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\//g, ".") : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-800 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-sans"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-[9px] font-black text-cyan-500/20 uppercase tracking-widest">No active operations found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metadata */}
      <div className="border-t border-cyan-500/10 p-6 flex justify-between items-center bg-cyan-500/[0.02] z-10">
        <span className="text-[9px] text-cyan-700 font-black uppercase tracking-[0.2em]">
          DevHub v2.0
        </span>
        <div className="flex gap-4">
          <span className="text-[9px] text-cyan-700 font-black uppercase tracking-[0.2em]">
            Schedule Protocol
          </span>
          <span className="text-[9px] text-cyan-700 font-black opacity-40">
            •
          </span>
          <span className="text-[9px] text-cyan-700 font-black uppercase tracking-[0.2em]">
            Authorized Operators Only
          </span>
        </div>
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
