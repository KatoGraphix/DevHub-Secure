"use client"

import { motion } from "framer-motion"
import { 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  BarChart3, 
  Mail, 
  Globe, 
  Search,
  Database,
  ExternalLink,
  BookOpen,
  Code2,
  Lock
} from "lucide-react"

const apiResources = [
  {
    name: "SumSub KYC",
    icon: ShieldCheck,
    description: "Deep verification for SumSub customers. Handles AML, KYC and identity proofing protocols.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    status: "Active"
  },
  {
    name: "TRUID Auth",
    icon: CreditCard,
    description: "Secure identity and access management. Provides specialized TRUID authentication layers.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    status: "Active"
  },
  {
    name: "Experian Credit",
    icon: Building2,
    description: "Credit scoring and financial background checks via Experian's comprehensive registry.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    status: "Active"
  },
  {
    name: "Iress Market",
    icon: BarChart3,
    description: "Real-time stock market data and financial service execution via the Iress infrastructure.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    status: "Active"
  },
  {
    name: "Yahoo Finance",
    icon: Globe,
    description: "Fallback financial data source for global asset prices and historical market statistics.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    status: "Active"
  },
  {
    name: "Resend Mail",
    icon: Mail,
    description: "Transactional email service for system notifications, security alerts, and user communications.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    status: "Operational"
  },
  {
    name: "Alliance News",
    icon: Search,
    description: "Real-time financial news wire integration for sentiment analysis and market alerts.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    status: "Live"
  },
  {
    name: "Supabase DB",
    icon: Database,
    description: "Core backend infrastructure. Handles MINT database operations, auth, and real-time sync.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    status: "Syncing"
  }
]

export default function ApiDocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-12 h-screen overflow-auto custom-scrollbar bg-[#09090b]">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">API Documentation</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] mt-2">
              System Integration & Technical Resource Ledger
            </p>
          </div>
        </div>
        
        <div className="bg-[#18181b] border border-[#27272a] px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">End-to-End Secure</span>
        </div>
      </div>

      {/* API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiResources.map((api, i) => (
          <motion.div
            key={api.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className={`p-3 rounded-xl ${api.bg} ${api.color} w-fit mb-6 group-hover:scale-110 transition-transform`}>
              <api.icon size={24} />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                {api.name}
              </h3>
              <div className="flex items-center gap-1.5 bg-[#18181b] px-2 py-0.5 rounded text-[8px] font-black uppercase text-zinc-500">
                <span>{api.status}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed font-medium mb-6">
              {api.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#1c1c1f]">
              <div className="flex items-center gap-2 text-zinc-600">
                <Code2 size={12} />
                <span className="text-[8px] font-bold uppercase tracking-widest">REST_API_V2.0</span>
              </div>
              <button className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                Explore <ExternalLink size={10} />
              </button>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* MINT Database CRUD Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0c0c0e]/80 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 text-blue-500/5 rotate-12">
            <Lock size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Database size={32} />
            </div>
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase">MINT_DATABASE_CRUD_API</h2>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em]">Secure_Endpoint</span>
                </div>
                <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
                    This endpoint allows authenticated administrators to programmatically Interface with the Mihle-Matimba database. 
                    Full support for <span className="text-blue-400">POST</span> (Insert), <span className="text-amber-400">PATCH</span> (Update), and <span className="text-red-400">DELETE</span> (Hard Delete) operations.
                </p>
                <div className="flex gap-4">
                    <code className="bg-black/50 border border-[#27272a] px-3 py-1.5 rounded-lg text-xs text-blue-400 font-mono">
                        /api/mint
                    </code>
                    <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                        Copy Endpoints
                    </button>
                </div>
            </div>
            <button className="bg-blue-600 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)]">
                Access Token Explorer
            </button>
        </div>
      </motion.div>
    </div>
  )
}
