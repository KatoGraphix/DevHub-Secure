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
  Database,
  Menu,
  X
} from "lucide-react"
import { useProfile } from "@/components/providers/ProfileProvider"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { exportOperatorManual } from "@/utils/export-pdf"

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
      { href: "/dashboard/api-docs?tab=external#sumsub", label: "SumSub KYC", icon: ShieldCheck },
      { href: "/dashboard/api-docs?tab=external#truid", label: "TRUID Auth", icon: CreditCard },
      { href: "/dashboard/api-docs?tab=external#experian", label: "Experian Credit", icon: Building2 },
      { href: "/dashboard/api-docs?tab=external#iress", label: "Iress Market", icon: BarChart3 },
      { href: "/dashboard/api-docs?tab=external#yahoo", label: "Yahoo Finance", icon: Globe },
      { href: "/dashboard/api-docs?tab=external#resend", label: "Resend Mail", icon: Mail },
      { href: "/dashboard/api-docs?tab=external#alliance", label: "Alliance News", icon: Search },
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
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/login")
    router.refresh()
  }

  const isAdmin = profile?.role === "admin_assigner"

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#020617] border border-cyan-500/20 rounded-lg text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-64 flex flex-col h-screen bg-[#020617] border-r border-cyan-500/10 transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Header / Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/50 flex items-center justify-center p-1.5 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="w-full h-full rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none uppercase">DEVHUB</h1>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Your Personal AI hub</p>
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
                <h3 className="px-4 text-[10px] uppercase tracking-widest font-bold text-cyan-500/40">
                  {section.label}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href
                    const content = (
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-cyan-500/10 text-white border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                          : "text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5"
                      }`}>
                        <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-600 group-hover:text-cyan-400/60"}`} />
                        <span className="truncate">{item.label}</span>
                        {item.external && <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />}
                        {isActive && !item.external && <div className="ml-auto w-1 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
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

          {/* Manual Download Button */}
          <div className="px-4 py-2">
            <button
              onClick={() => exportOperatorManual(profile?.first_name || 'Operative')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-cyan-500/60 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all group border border-dashed border-cyan-500/10 hover:border-cyan-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Handbook (PDF)</span>
            </button>
          </div>
        </nav>

        {/* User Footer */}
        <div className="mt-auto p-4 border-t border-cyan-500/10">
          <div className="flex items-center justify-between group">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 border border-transparent group-hover:bg-cyan-500/5 group-hover:border-cyan-500/10 p-2 rounded-xl transition-all duration-200 flex-1 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                <User className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400/60" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile ? `${profile.first_name} ${profile.last_name}` : "Loading..."}
                </p>
                <p className="text-[10px] text-cyan-500/40 truncate font-bold uppercase tracking-widest">
                  {profile ? (isAdmin ? "Admin Plan" : "Free Plan") : ""}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-600 hover:text-cyan-400 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
