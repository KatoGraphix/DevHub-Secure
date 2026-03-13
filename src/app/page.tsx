"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Activity, 
  Lock, 
  Zap, 
  ArrowRight,
  Globe,
  Database,
  BarChart3
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-[#020617]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="text-cyan-400 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter">
              DEV<span className="text-cyan-400">HUB</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Infrastructure</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Monitoring</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
          </div>
          <Link href="/login">
            <button className="px-4 py-2 border border-cyan-500/30 rounded-sm text-[10px] uppercase tracking-widest font-black hover:bg-cyan-500/10 transition-all flex items-center gap-2">
              <Lock size={12} className="text-cyan-400" />
              Access Console
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-full mb-6 text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400">
              <Zap size={12} className="fill-cyan-400" />
              Next-Gen Infrastructure
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6">
              SECURE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DEVELOPER</span> <br />
              ECOSYSTEM
            </h1>
            <p className="text-zinc-400 text-lg mb-10 max-w-lg leading-relaxed font-sans">
              Internal mission-control for AlgoHive engineers. Manage deployments, monitor API health, 
              and track development sprints within a unified high-security environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <button className="bg-cyan-500 text-[#020617] px-8 py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all group">
                  Initialize Session
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="border border-white/10 px-8 py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                System Docs
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/5">
              <div>
                <div className="text-2xl font-black text-white">99.9%</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">256-AES</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Security</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">&lt;40ms</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Latency</div>
              </div>
            </div>
          </motion.div>

          {/* Graphical Element / Terminal UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {/* Window Header */}
              <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-500">
                  root@devhub: /usr/local/bin
                </div>
                <div className="w-8" />
              </div>
              
              {/* Terminal Body */}
              <div className="p-6 font-mono text-xs space-y-4">
                <div className="flex gap-3">
                  <span className="text-green-400">➜</span>
                  <span className="text-zinc-300">devhub status --verbose</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Cpu size={14} className="text-cyan-400" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Clusters</span>
                    </div>
                    <div className="text-xl font-bold">12 Active</div>
                    <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 w-[65%] h-full" />
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Globe size={14} className="text-blue-400" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Traffic</span>
                    </div>
                    <div className="text-xl font-bold">1.2M req/s</div>
                    <Activity size={32} className="text-blue-500/50 mt-1" />
                  </div>
                </div>
                <div className="text-zinc-500 text-[10px] mt-4 leading-relaxed">
                  [SYSTEM] Authenticated as OPERATOR_K1<br />
                  [SYSTEM] Establishing multi-threaded bridge to Supabase VPC...<br />
                  [SYSTEM] Latency: 12ms | Encryption: 256-bit AES<br />
                  <span className="text-cyan-400 animate-pulse">_</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 p-4 rounded-lg shadow-xl"
            >
              <ShieldCheck className="text-cyan-400 w-8 h-8" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 p-4 rounded-lg shadow-xl"
            >
              <Database className="text-blue-400 w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 text-center md:text-left">
            ALGOHIVE SECURE INFRASTRUCTURE © 2026
          </div>
          <div className="flex gap-8">
            <BarChart3 className="w-5 h-5 text-zinc-700" />
            <Activity className="w-5 h-5 text-zinc-700" />
            <Globe className="w-5 h-5 text-zinc-700" />
            <Cpu className="w-5 h-5 text-zinc-700" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500">
            v2.0.4-STABLE
          </div>
        </div>
      </footer>
    </div>
  )
}
