"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"
import { 
  Database, 
  Users, 
  ListTodo, 
  Shield, 
  RefreshCw, 
  Circle,
  AlertOctagon,
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  role_id: string
  position: string
  access: boolean
}

interface TaskRow {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string | null
  created_by: string | null
}

const statusBadge: Record<string, string> = {
  todo: "text-zinc-500",
  in_progress: "text-blue-500",
  review: "text-amber-500",
  done: "text-emerald-500",
}

export default function AdminPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const loadData = useCallback(async () => {
    const { data: allProfiles } = await supabase.from("profiles").select("*").order("role_id")
    if (allProfiles) setProfiles(allProfiles)
    const { data: allTasks } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })
    if (allTasks) setTasks(allTasks)
  }, [supabase])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin_assigner") {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)
      await loadData()
      setLoading(false)
    }
    fetchData()
  }, [supabase, loadData])

  const handleRefresh = async () => {
    setLoading(true)
    await loadData()
    setLoading(false)
    toast.success("SYSTEM_DATA_SYNC_COMPLETE")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#09090b]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-[#09090b] px-6">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_-10px_rgba(239,68,68,0.5)]"
        >
          <AlertOctagon size={40} />
        </motion.div>
        <h2 className="text-2xl font-black text-white mb-3 tracking-widest uppercase">Access Restricted</h2>
        <p className="text-zinc-500 text-sm max-w-sm leading-relaxed font-medium">
          Your credentials do not match the required authorization level for this terminal. Please contact your Admin Assigner.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Admin Header */}
      <div className="px-8 py-8 flex items-center justify-between border-b border-[#1c1c1f]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-[0.1em] uppercase flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <Database size={18} className="text-blue-400" />
            </div>
            Admin Terminal
          </h1>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Database Management & User Oversight
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-3 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Sync Data
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-10 custom-scrollbar">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Total Handlers", value: profiles.length, icon: Users, color: "text-blue-400" },
            { label: "Active Operations", value: tasks.length, icon: ListTodo, color: "text-zinc-400" },
            { label: "Admin Access", value: profiles.filter(p => p.role === "admin_assigner").length, icon: Shield, color: "text-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-6 relative group hover:border-[#27272a] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 group-hover:text-blue-400 transition-colors">
                    <stat.icon size={20} />
                </div>
                <MoreHorizontal size={16} className="text-zinc-800" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{stat.value.toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</p>
              
              <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* User Inventory */}
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Users size={14} className="text-blue-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Personnel Inventory</h3>
            </div>
            <div className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/10 border-b border-[#1c1c1f]">
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Operator ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Full Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Network Access</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Classification</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Link Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c1c1f]">
                        {profiles.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.01] transition-all group">
                                <td className="px-6 py-5">
                                    <span className="font-mono text-[10px] font-bold bg-[#18181b] border border-[#27272a] px-2 py-1 rounded text-zinc-400 uppercase tracking-wider">{p.role_id}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-semibold text-white">{p.first_name} {p.last_name}</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 tracking-widest opacity-60">{p.position}</p>
                                </td>
                                <td className="px-6 py-5 text-xs text-zinc-500 font-medium lowercase">
                                    {p.email}
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                    p.role === "admin_assigner" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                    }`}>
                                    {p.role === "admin_assigner" ? "ADMIN_PRIME" : "STANDARD_OP"}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.access ? "bg-emerald-500" : "bg-red-500"} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{p.access ? "Secure" : "Revoked"}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Global Operations Ledger */}
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ListTodo size={14} className="text-zinc-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operations Ledger</h3>
            </div>
            <div className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/10 border-b border-[#1c1c1f]">
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Op ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Objective</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Threat Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c1c1f]">
                        {tasks.map((t) => (
                            <tr key={t.id} className="hover:bg-white/[0.01] transition-all group font-mono">
                                <td className="px-6 py-5 text-[10px] text-zinc-700 font-bold uppercase tracking-wider">
                                    {t.id.slice(0, 8)}
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-zinc-300 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t.title}</span>
                                </td>
                                <td className="px-6 py-5 flex items-center gap-2 mt-4 border-none">
                                    <Circle className={`w-1.5 h-1.5 ${statusBadge[t.status]} fill-current shadow-[0_0_8px_currentColor]`} />
                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{t.status}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                                        {t.priority === 'urgent' ? '!!! CRITICAL' : t.priority}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  )
}
