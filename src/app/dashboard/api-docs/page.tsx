"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
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
  Lock,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  Trash2,
  FlaskConical,
  Server
} from "lucide-react"

interface ScriptResult {
  success: boolean
  data?: unknown
  message?: string
  error?: string
  details?: unknown
  dry_run?: boolean
  deleted_count?: number
  deleted_records?: unknown[]
}

interface ScriptExample {
  description: string
  method: string
  endpoint: string
  db: "devhub" | "mint"
  headers: Record<string, string>
  request: Record<string, unknown>
  successResponse: Record<string, unknown>
  errorResponse?: Record<string, unknown>
}

const externalAPIs = [
  { id: "sumsub", name: "SumSub KYC", icon: ShieldCheck, description: "Deep verification for SumSub customers. Handles AML, KYC and identity proofing protocols.", color: "text-emerald-400", bg: "bg-emerald-500/10", status: "Active", endpoint: "https://api.sumsub.com/", docs: "https://developers.sumsub.com/" },
  { id: "truid", name: "TRUID Auth", icon: CreditCard, description: "Secure identity and access management. Provides specialised TRUID authentication layers.", color: "text-blue-400", bg: "bg-blue-500/10", status: "Active", endpoint: "https://api.truid.com/", docs: "https://docs.truid.com/" },
  { id: "experian", name: "Experian Credit", icon: Building2, description: "Credit scoring and financial background checks via Experian's comprehensive registry.", color: "text-purple-400", bg: "bg-purple-500/10", status: "Active", endpoint: "https://api.experian.com/", docs: "https://developer.experian.com/" },
  { id: "iress", name: "Iress Market", icon: BarChart3, description: "Real-time stock market data and financial service execution via the Iress infrastructure.", color: "text-amber-400", bg: "bg-amber-500/10", status: "Active", endpoint: "https://api.iress.com/", docs: "https://developers.iress.com/" },
  { id: "yahoo", name: "Yahoo Finance", icon: Globe, description: "Fallback financial data source for global asset prices and historical market statistics.", color: "text-red-400", bg: "bg-red-500/10", status: "Active", endpoint: "https://query1.finance.yahoo.com/", docs: "https://developer.yahoo.com/finance/" },
  { id: "resend", name: "SMTP Relay (Gmail)", icon: Mail, description: "Google SMTP integration for system notifications and user communications. Requires App Password.", color: "text-cyan-400", bg: "bg-cyan-500/10", status: "Active", endpoint: "smtp.gmail.com:465", docs: "https://support.google.com/accounts/answer/185833" },
  { id: "alliance", name: "Alliance News", icon: Search, description: "Real-time financial news wire integration for sentiment analysis and market alerts.", color: "text-indigo-400", bg: "bg-indigo-500/10", status: "Live", endpoint: "https://api.alliance-news.com/", docs: "https://developers.alliance-news.com/" },
]

const internalAPIs = [
  { id: "mint-db", name: "MINT Database API", icon: Database, description: "Core backend infrastructure. Handles DevHub database operations, auth, and real-time sync.", color: "text-emerald-500", bg: "bg-emerald-500/5", status: "Syncing", endpoint: "/api/mint", methods: ["POST", "PATCH", "DELETE"], docs: "Interactive below" },
  { id: "script-runner", name: "Script Runner API", icon: Code2, description: "Execute predefined scripts for CRUD operations on DevHub profiles, tasks, and the external MINT database.", color: "text-orange-500", bg: "bg-orange-500/5", status: "Active", endpoint: "/api/scripts", methods: ["POST", "GET"], docs: "Interactive below" },
  { id: "directives", name: "Directives API", icon: Mail, description: "Automated Mission Directive system. Sends cinematic task assignment emails with leadership CCs.", color: "text-cyan-400", bg: "bg-cyan-500/5", status: "Live", endpoint: "/api/notifications/task-assigned", methods: ["POST"], docs: "Requires Google SMTP" },
  { id: "success-directives", name: "Success Directives API", icon: CheckCircle2, description: "Mission Success reporting system. Sends emerald-themed victory emails upon task completion.", color: "text-emerald-400", bg: "bg-emerald-500/5", status: "Live", endpoint: "/api/notifications/task-completed", methods: ["POST"], docs: "Requires Google SMTP" },
  { id: "mint-supabase", name: "External MINT DB", icon: Server, description: "Direct connection to the external MINT Supabase project. Supports table reads, writes, deletes, and test-data removal.", color: "text-violet-400", bg: "bg-violet-500/5", status: "Connected", endpoint: "https://mfxnghmuccevsxwcetej.supabase.co", methods: ["POST"], docs: "Interactive below" },
]

const devhubScriptExamples: Record<string, ScriptExample> = {
  create_profile: {
    description: "Create a new profile in the DevHub database",
    method: "POST", endpoint: "/api/scripts", db: "devhub",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "devhub", script: "create_profile", data: { email: "john.doe@mint.co.za", first_name: "John", last_name: "Doe", role: "junior", role_id: "MINT-JSD-005", position: "Junior Software Developer" } },
    successResponse: { success: true, data: [{ id: "uuid", email: "john.doe@mint.co.za" }], message: "Profile created successfully" },
    errorResponse: { error: "Validation error: Email already exists", success: false },
  },
  update_profile: {
    description: "Update an existing DevHub profile",
    method: "POST", endpoint: "/api/scripts", db: "devhub",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "devhub", script: "update_profile", data: { id: "profile-uuid", position: "Senior Software Developer", role: "senior" } },
    successResponse: { success: true, data: [{ id: "profile-uuid", position: "Senior Software Developer" }], message: "Profile updated successfully" },
  },
  get_profiles: {
    description: "Fetch all profiles from DevHub",
    method: "POST", endpoint: "/api/scripts", db: "devhub",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "devhub", script: "get_profiles" },
    successResponse: { success: true, data: [{ id: "uuid1", email: "user@mint.co.za" }], message: "Found 1 profiles" },
  },
  create_task: {
    description: "Create a new task in DevHub",
    method: "POST", endpoint: "/api/scripts", db: "devhub",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "devhub", script: "create_task", data: { title: "Implement authentication", status: "in_progress", priority: "high", due_date: "2025-12-31" } },
    successResponse: { success: true, data: [{ id: "task-uuid", title: "Implement authentication" }], message: "Task created successfully" },
  },
}

const mintScriptExamples: Record<string, ScriptExample> = {
  get_records: {
    description: "Fetch records from any table in the MINT database",
    method: "POST", endpoint: "/api/scripts", db: "mint",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "mint", script: "get_records", data: { table: "users", limit: 20 } },
    successResponse: { success: true, data: [{ id: 1, email: "user@example.com" }], message: "Found 1 records in users" },
    errorResponse: { success: false, error: "relation \"users\" does not exist" },
  },
  create_record: {
    description: "Insert a new record into a MINT table",
    method: "POST", endpoint: "/api/scripts", db: "mint",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "mint", script: "create_record", data: { table: "users", record: { email: "new@example.com", name: "New User" } } },
    successResponse: { success: true, data: [{ id: 2, email: "new@example.com" }], message: "Record created in users" },
  },
  update_record: {
    description: "Update a record by ID in a MINT table",
    method: "POST", endpoint: "/api/scripts", db: "mint",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "mint", script: "update_record", data: { table: "users", id: "record-id", updates: { name: "Updated Name" } } },
    successResponse: { success: true, data: [{ id: "record-id", name: "Updated Name" }], message: "Record record-id updated in users" },
  },
  delete_record: {
    description: "Delete a record by ID from a MINT table",
    method: "POST", endpoint: "/api/scripts", db: "mint",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: { db: "mint", script: "delete_record", data: { table: "users", id: "record-id" } },
    successResponse: { success: true, message: "Record record-id deleted from users" },
  },
  remove_test_cases: {
    description: "Delete test/dummy records from a MINT table by pattern matching a field value",
    method: "POST", endpoint: "/api/scripts", db: "mint",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer <session-token>" },
    request: {
      db: "mint", script: "remove_test_cases",
      data: { table: "users", field: "email", pattern: "test", mode: "contains", dry_run: true }
    },
    successResponse: {
      success: true, dry_run: true,
      data: [{ id: 1, email: "test.user@example.com" }],
      message: "DRY RUN: Would delete 1 record(s) from users where email contains \"test\""
    },
    errorResponse: { success: false, error: "table, field, and pattern are required" },
  },
}

import { useSearchParams } from "next/navigation"

export default function ApiDocsPage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as "external" | "internal" | "scripts") || "internal"
  
  const [activeTab, setActiveTab] = useState<"external" | "internal" | "scripts">(initialTab)
  const [selectedDb, setSelectedDb] = useState<"devhub" | "mint">("mint")
  const [selectedScript, setSelectedScript] = useState<string>("remove_test_cases")
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const currentExamples = selectedDb === "mint" ? mintScriptExamples : devhubScriptExamples

  const copyToClipboard = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedScript(key); setTimeout(() => setCopiedScript(null), 2000) }
    catch { /* ignore */ }
  }

  const runScript = async (scriptName: string) => {
    setIsRunning(true)
    setScriptResult(null)
    try {
      const example = currentExamples[scriptName]
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(example.request),
      })
      const result = await res.json()
      setScriptResult(result)
    } catch (error) {
      setScriptResult({ success: false, error: "Failed to execute script", details: error })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12 h-screen overflow-auto custom-scrollbar bg-[#09090b]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase italic">API Documentation</h1>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Secure Protocol Integration Ledger</p>
        </div>
      </div>

      {/* Auth Notice */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lock className="text-amber-400 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Authentication Required</h3>
            <p className="text-zinc-300 text-sm mb-3">All internal endpoints require an active session. Pass <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono">db: "devhub"</code> or <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono">db: "mint"</code> in the request body to select the target database.</p>
            <div className="text-xs text-zinc-500 space-y-1">
              <div>• Rate Limit: 100 requests per minute per user</div>
              <div>• Unauthorized requests return 401 status codes</div>
              <div>• MINT database uses the external Supabase project credentials</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "external", label: "External APIs", count: externalAPIs.length },
          { id: "internal", label: "Internal APIs", count: internalAPIs.length },
          { id: "scripts", label: "Script Runner", count: Object.keys(devhubScriptExamples).length + Object.keys(mintScriptExamples).length },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as "external" | "internal" | "scripts")}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab.id ? "text-cyan-400 border-cyan-400" : "text-zinc-600 border-transparent hover:text-zinc-400"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* External APIs */}
      {activeTab === "external" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalAPIs.map((api) => (
            <div key={api.name} id={api.id} className={`${api.bg} border border-zinc-900 rounded-xl p-6 hover:border-cyan-500/20 transition-all group scroll-mt-24`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${api.bg} border border-zinc-700 rounded-lg flex items-center justify-center ${api.color} group-hover:scale-110 transition-transform`}>
                  <api.icon size={20} />
                </div>
                <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${api.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>{api.status}</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{api.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{api.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500"><Globe size={12} /><span className="font-mono truncate">{api.endpoint}</span></div>
                <a href={api.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
                  <ExternalLink size={12} />Docs
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internal APIs */}
      {activeTab === "internal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {internalAPIs.map((api, index) => (
            <motion.div key={api.name} id={api.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className={`${api.bg} border border-zinc-900 rounded-xl p-6 hover:border-cyan-500/20 transition-all group scroll-mt-24`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${api.bg} border border-zinc-700 rounded-lg flex items-center justify-center ${api.color} group-hover:scale-110 transition-transform`}>
                  <api.icon size={20} />
                </div>
                <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                  api.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                  api.status === "Connected" ? "bg-violet-500/20 text-violet-400" :
                  "bg-orange-500/20 text-orange-400"}`}>{api.status}</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{api.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{api.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500"><Globe size={12} /><span className="font-mono truncate text-[10px]">{api.endpoint}</span></div>
                <div className="flex flex-wrap gap-2">
                  {api.methods?.map(m => <span key={m} className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 rounded">{m}</span>)}
                </div>
                <button onClick={() => setActiveTab("scripts")} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors">
                  <Code2 size={12} />Try Interactive
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Script Runner */}
      {activeTab === "scripts" && (
        <div className="space-y-6">
          {/* Database Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Database:</span>
            <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1">
              <button onClick={() => { setSelectedDb("devhub"); setSelectedScript("get_profiles") }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${selectedDb === "devhub" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                <Database size={14} className={selectedDb === "devhub" ? "text-emerald-400" : ""} />
                DevHub DB
              </button>
              <button onClick={() => { setSelectedDb("mint"); setSelectedScript("remove_test_cases") }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${selectedDb === "mint" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                <Server size={14} className={selectedDb === "mint" ? "text-violet-400" : ""} />
                MINT DB
              </button>
            </div>
            {selectedDb === "mint" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-400 font-bold">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                mfxnghmuccevsxwcetej.supabase.co
              </motion.div>
            )}
          </div>

          {/* Script Runner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Script Selector */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                {selectedDb === "mint" ? "MINT Database Scripts" : "DevHub Scripts"}
              </h3>
              <div className="space-y-2">
                {Object.entries(currentExamples).map(([scriptName, script]) => (
                  <button key={scriptName} onClick={() => { setSelectedScript(scriptName); setScriptResult(null) }}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedScript === scriptName ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"}`}>
                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider mb-1">
                      {scriptName === "remove_test_cases" && <Trash2 size={14} className="text-red-400" />}
                      {scriptName === "get_records" && <Database size={14} />}
                      {scriptName === "list_tables" && <FlaskConical size={14} />}
                      {scriptName.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-zinc-500">{script.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Script Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Script Details</h3>

              {selectedScript && currentExamples[selectedScript] && (() => {
                const example = currentExamples[selectedScript]
                return (
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
                        {selectedScript.replace(/_/g, " ")}
                      </div>
                      <div className="text-sm text-zinc-400 mb-4">{example.description}</div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-2 py-1 bg-zinc-800 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded">{example.method}</span>
                        <span className="text-xs text-zinc-500 font-mono">{example.endpoint}</span>
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${example.db === "mint" ? "bg-violet-500/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                          {example.db}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Request Payload</div>
                      <div className="relative">
                        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                          {JSON.stringify(example.request, null, 2)}
                        </pre>
                        <button onClick={() => copyToClipboard(JSON.stringify(example.request, null, 2), selectedScript)}
                          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors">
                          {copiedScript === selectedScript ? <Check size={12} /> : <Copy size={12} />}
                          {copiedScript === selectedScript ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Success Response (200)</div>
                      <pre className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
                        {JSON.stringify(example.successResponse, null, 2)}
                      </pre>
                    </div>

                    {example.errorResponse && (
                      <div>
                        <div className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Error Response (400/500)</div>
                        <pre className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-xs font-mono text-red-300 overflow-x-auto">
                          {JSON.stringify(example.errorResponse, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Remove Test Cases special callout */}
                    {selectedScript === "remove_test_cases" && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest">
                          <Trash2 size={14} />
                          Test Data Removal
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Set <code className="bg-zinc-800 px-1 rounded font-mono">dry_run: true</code> first to preview which records will be deleted without actually removing them. Once confirmed, set <code className="bg-zinc-800 px-1 rounded font-mono">dry_run: false</code> to execute.
                        </p>
                        <div className="text-xs text-zinc-600 space-y-1 pt-1">
                          <div><span className="text-zinc-400">mode options:</span> <code className="font-mono">"contains"</code> · <code className="font-mono">"starts_with"</code> · <code className="font-mono">"equals"</code></div>
                        </div>
                      </div>
                    )}

                    <button onClick={() => runScript(selectedScript)} disabled={isRunning}
                      className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedDb === "mint" ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-cyan-500 hover:bg-cyan-400 text-white"}`}>
                      {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                      {isRunning ? "Running..." : "Execute Script"}
                    </button>
                  </div>
                )
              })()}

              {/* Results */}
              {scriptResult && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Execution Result</h4>
                  <div className={`border rounded-lg p-4 ${scriptResult.success ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {scriptResult.success ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                      <span className={`text-sm font-bold uppercase tracking-wider ${scriptResult.success ? "text-emerald-400" : "text-red-400"}`}>
                        {scriptResult.success ? (scriptResult.dry_run ? "Dry Run Complete" : "Success") : "Error"}
                      </span>
                    </div>
                    {scriptResult.message && <div className="text-sm text-zinc-300 mb-3">{scriptResult.message}</div>}
                    {scriptResult.error && <div className="text-sm text-red-300 mb-3">{scriptResult.error}</div>}
                    {(scriptResult.data || scriptResult.deleted_records) && (
                      <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(scriptResult.data ?? scriptResult.deleted_records, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
