"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Github,
  Search,
  Wrench,
  Settings,
  LogOut,
  User,
  Share2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  BarChart3,
  Mail,
  Globe,
  Database
} from "lucide-react"
import { useProfile } from "@/components/providers/ProfileProvider"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  external?: boolean
  adminOnly?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "AI Intelligence", icon: LayoutDashboard },
      { href: "/dashboard/tasks", label: "Smart Schedule", icon: Calendar },
      { href: "/dashboard/api-docs", label: "API Docs", icon: BookOpen },
    ]
  },
  {
    label: "External Resources",
    items: [
      { href: "https://github.com", label: "GitHub Repositories", icon: Github, external: true },
      { href: "https://sharepoint.com", label: "SharePoint", icon: Share2, external: true },
      { href: "https://supabase.com", label: "Supabase Central", icon: Database, external: true },
    ]
  },
  {
    label: "Partner APIs",
    items: [
      { href: "#", label: "SumSub KYC", icon: ShieldCheck, external: true },
      { href: "#", label: "TRUID Auth", icon: CreditCard, external: true },
      { href: "#", label: "Experian Credit", icon: Building2, external: true },
      { href: "#", label: "Iress Market", icon: BarChart3, external: true },
      { href: "#", label: "Yahoo Finance", icon: Globe, external: true },
      { href: "#", label: "Resend Mail", icon: Mail, external: true },
      { href: "#", label: "Alliance News", icon: Search, external: true },
    ]
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/admin", label: "Admin Panel", icon: Wrench, adminOnly: true },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { profile } = useProfile()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/login")
    router.refresh()
  }

  const isAdmin = profile?.role === "admin_assigner"

  return (
    <aside className="w-64 flex flex-col h-screen bg-[#09090b] border-r border-[#1c1c1f] transition-all duration-300">
      {/* Header / Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/50 flex items-center justify-center p-1.5 bg-blue-500/10">
            <div className="w-full h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">DEVHUB</h1>
            <p className="text-[10px] text-zinc-500 mt-1">Your Personal AI hub</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar font-sans">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin)
          if (visibleItems.length === 0) return null

          return (
            <div key={section.label} className="space-y-2">
              <h3 className="px-4 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                {section.label}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href
                  const content = (
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-[#18181b] text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    }`}>
                      <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                      <span className="truncate">{item.label}</span>
                      {item.external && <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />}
                      {isActive && !item.external && <div className="ml-auto w-1 h-3 bg-blue-500 rounded-full" />}
                    </div>
                  )

                  if (item.external) {
                    return (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                        {content}
                      </a>
                    )
                  }

                  return (
                    <Link key={item.label} href={item.href} className="block">
                      {content}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-auto p-4 border-t border-[#1c1c1f]">
        <div className="flex items-center justify-between group">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 border border-transparent group-hover:bg-[#18181b] group-hover:border-[#27272a] p-2 rounded-xl transition-all duration-200 flex-1 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {profile ? `${profile.first_name} ${profile.last_name}` : "Loading..."}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {profile ? (isAdmin ? "Admin Plan" : "Free Plan") : ""}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-blue-400 transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
