"use client"

import { useState, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Sparkles, 
  User, 
  Command,
  X
} from "lucide-react"
import { useProfile } from "@/components/providers/ProfileProvider"
import Link from "next/link"

export default function Navbar() {
  const router = useRouter()
  const { profile } = useProfile()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    router.push(`/dashboard/tasks?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") setSearchQuery("")
  }

  return (
    <header className="h-[72px] flex items-center justify-between px-8 bg-[#09090b] border-b border-[#1c1c1f]">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative group max-w-xl w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks... (Enter to search)"
            className="w-full bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] focus:border-blue-500/50 rounded-xl py-2.5 pl-11 pr-20 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-mono pointer-events-none">
                <Command size={10} />
                <span>K</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-2 ml-4">
        <Link
          href="/dashboard"
          title="AI Intelligence"
          className="p-2.5 text-zinc-400 hover:text-blue-400 transition-colors bg-[#18181b] border border-[#27272a] rounded-xl hover:bg-zinc-800 hover:border-blue-500/30"
        >
          <Sparkles size={18} className="text-blue-500/60" />
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] pl-2 pr-3 py-1 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User size={14} className="text-zinc-500 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-400 group-hover:text-white">
            {profile?.first_name ?? "Profile"}
          </span>
        </Link>
      </div>
    </header>
  )
}
