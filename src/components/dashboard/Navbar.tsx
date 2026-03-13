"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { 
  Search, 
  Pause, 
  Monitor, 
  Sparkles, 
  User, 
  Command 
} from "lucide-react"

export default function Navbar() {
  const supabase = createClient()
  const [firstName, setFirstName] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single()
        if (data) setFirstName(data.first_name)
      }
    }
    fetchName()
  }, [supabase])


  return (
    <header className="h-[72px] flex items-center justify-between px-8 bg-[#09090b]">
      {/* Search Bar - Centered Floating */}
      <div className="flex-1 flex justify-center">
        <div className="relative group max-w-xl w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search projects, prompts, tools, anything..."
            className="w-full bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] focus:border-blue-500/50 rounded-xl py-2.5 pl-11 pr-20 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none gap-1">
            <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-2">
        <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors hover:bg-zinc-800 rounded-lg">
            <Pause size={18} fill="currentColor" className="opacity-50" />
          </button>
        </div>
        
        <button className="p-2.5 text-zinc-500 hover:text-white transition-colors bg-[#18181b] border border-[#27272a] rounded-xl hover:bg-zinc-800">
          <Monitor size={18} />
        </button>

        <button className="p-2.5 text-zinc-400 hover:text-white transition-colors bg-[#18181b] border border-[#27272a] rounded-xl hover:bg-zinc-800">
          <Sparkles size={18} fill="currentColor" className="text-blue-500/50" />
        </button>

        <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] pl-2 pr-1.5 py-1 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User size={14} className="text-zinc-500 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-400 group-hover:text-white">
            {mounted && firstName ? firstName : "Profile"}
          </span>
        </div>
      </div>
    </header>
  )
}
