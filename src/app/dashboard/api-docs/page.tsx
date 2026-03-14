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
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check
} from "lucide-react"

// Type definitions
interface ScriptResult {
  success: boolean
  data?: unknown
  message?: string
  error?: string
  details?: unknown
}

interface ScriptExample {
  description: string
  method: string
  endpoint: string
  headers: Record<string, string>
  request: Record<string, unknown>
  successResponse: Record<string, unknown>
  errorResponse?: Record<string, unknown>
}

const externalAPIs = [
  {
    name: "SumSub KYC",
    icon: ShieldCheck,
    description: "Deep verification for SumSub customers. Handles AML, KYC and identity proofing protocols.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    status: "Active",
    endpoint: "https://api.sumsub.com/",
    docs: "https://developers.sumsub.com/"
  },
  {
    name: "TRUID Auth",
    icon: CreditCard,
    description: "Secure identity and access management. Provides specialized TRUID authentication layers.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    status: "Active",
    endpoint: "https://api.truid.com/",
    docs: "https://docs.truid.com/"
  },
  {
    name: "Experian Credit",
    icon: Building2,
    description: "Credit scoring and financial background checks via Experian's comprehensive registry.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    status: "Active",
    endpoint: "https://api.experian.com/",
    docs: "https://developer.experian.com/"
  },
  {
    name: "Iress Market",
    icon: BarChart3,
    description: "Real-time stock market data and financial service execution via the Iress infrastructure.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    status: "Active",
    endpoint: "https://api.iress.com/",
    docs: "https://developers.iress.com/"
  },
  {
    name: "Yahoo Finance",
    icon: Globe,
    description: "Fallback financial data source for global asset prices and historical market statistics.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    status: "Active",
    endpoint: "https://query1.finance.yahoo.com/",
    docs: "https://developer.yahoo.com/finance/"
  },
  {
    name: "Resend Mail",
    icon: Mail,
    description: "Transactional email service for system notifications, security alerts, and user communications.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    status: "Operational",
    endpoint: "https://api.resend.com/",
    docs: "https://resend.com/docs"
  },
  {
    name: "Alliance News",
    icon: Search,
    description: "Real-time financial news wire integration for sentiment analysis and market alerts.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    status: "Live",
    endpoint: "https://api.alliance-news.com/",
    docs: "https://developers.alliance-news.com/"
  }
]

const internalAPIs = [
  {
    name: "MINT Database API",
    icon: Database,
    description: "Core backend infrastructure. Handles MINT database operations, auth, and real-time sync.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    status: "Syncing",
    endpoint: "/api/mint",
    methods: ["POST", "PATCH", "DELETE"],
    docs: "Interactive below"
  },
  {
    name: "Script Runner API",
    icon: Code2,
    description: "Execute predefined database scripts for CRUD operations on profiles and tasks.",
    color: "text-orange-500",
    bg: "bg-orange-500/5",
    status: "Active",
    endpoint: "/api/scripts",
    methods: ["POST", "GET"],
    docs: "Interactive below"
  }
]

const scriptExamples: Record<string, ScriptExample> = {
  create_profile: {
    description: "Create a new profile in the MINT database",
    method: "POST",
    endpoint: "/api/scripts",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <user-session-token>"
    },
    request: {
      script: "create_profile",
      data: {
        email: "john.doe@mint.co.za",
        first_name: "John",
        last_name: "Doe",
        role: "junior",
        role_id: "MINT-JSD-005",
        position: "Junior Software Developer"
      }
    },
    successResponse: {
      success: true,
      data: [{ id: "uuid-generated", email: "john.doe@mint.co.za", first_name: "John", last_name: "Doe" }],
      message: "Profile created successfully"
    },
    errorResponse: {
      error: "Validation error: Email already exists",
      success: false
    }
  },
  update_profile: {
    description: "Update an existing profile",
    method: "POST",
    endpoint: "/api/scripts",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <user-session-token>"
    },
    request: {
      script: "update_profile",
      data: {
        id: "profile-uuid-here",
        position: "Senior Software Developer",
        role: "senior"
      }
    },
    successResponse: {
      success: true,
      data: [{ id: "profile-uuid", position: "Senior Software Developer", role: "senior" }],
      message: "Profile updated successfully"
    }
  },
  get_profiles: {
    description: "Fetch all profiles",
    method: "POST",
    endpoint: "/api/scripts",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <user-session-token>"
    },
    request: {
      script: "get_profiles"
    },
    successResponse: {
      success: true,
      data: [
        { id: "uuid1", email: "user1@mint.co.za", first_name: "User", last_name: "One", role: "junior" },
        { id: "uuid2", email: "user2@mint.co.za", first_name: "User", last_name: "Two", role: "senior" }
      ],
      message: "Found 2 profiles"
    }
  },
  create_task: {
    description: "Create a new task",
    method: "POST",
    endpoint: "/api/scripts",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <user-session-token>"
    },
    request: {
      script: "create_task",
      data: {
        title: "Implement user authentication",
        description: "Add login/logout functionality to the dashboard",
        status: "in_progress",
        assigned_to: "profile-uuid-here",
        priority: "high",
        due_date: "2024-12-31"
      }
    },
    successResponse: {
      success: true,
      data: [{ id: "task-uuid", title: "Implement user authentication", status: "in_progress", priority: "high" }],
      message: "Task created successfully"
    }
  }
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'external' | 'internal' | 'scripts'>('internal')
  const [selectedScript, setSelectedScript] = useState<string>('create_profile')
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const copyToClipboard = async (text: string, scriptName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const runScript = async (scriptName: string) => {
    setIsRunning(true)
    setScriptResult(null)

    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptExamples[scriptName as keyof typeof scriptExamples].request)
      })

      const result = await response.json()
      setScriptResult(result)
    } catch (error) {
      setScriptResult({ success: false, error: 'Failed to execute script', details: error })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12 h-screen overflow-auto custom-scrollbar bg-[#09090b]">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest uppercase">API Documentation</h1>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] mt-2">
              System Integration & Technical Resource Ledger</p>
          </div>
        </div>
      </div>

      {/* Authentication Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <Lock className="text-amber-400 mt-0.5" size={20} />
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Authentication Required</h3>
            <p className="text-zinc-300 text-sm mb-3">
              All internal API endpoints require authentication. You must be logged in to the DEVHUB system to execute scripts.
            </p>
            <div className="text-xs text-zinc-500 space-y-1">
              <div>• Rate Limit: 100 requests per minute per user</div>
              <div>• Session tokens are automatically included in requests</div>
              <div>• Unauthorized requests return 401 status codes</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'external', label: 'External APIs', count: externalAPIs.length },
          { id: 'internal', label: 'Internal APIs', count: internalAPIs.length },
          { id: 'scripts', label: 'Script Runner', count: Object.keys(scriptExamples).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'external' | 'internal' | 'scripts')}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-600 border-transparent hover:text-zinc-400'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* External APIs Tab */}
      {activeTab === 'external' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalAPIs.map((api) => (
            <div
              key={api.name}
              className={`${api.bg} border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${api.bg} border border-zinc-700 rounded-lg flex items-center justify-center ${api.color} group-hover:scale-110 transition-transform`}>
                  <api.icon size={20} />
                </div>
                <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${api.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {api.status}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{api.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{api.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Globe size={12} />
                  <span className="font-mono">{api.endpoint}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={api.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                  >
                    <ExternalLink size={12} />
                    Docs
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internal APIs Tab */}
      {activeTab === 'internal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {internalAPIs.map((api, index) => (
            <motion.div
              key={api.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${api.bg} border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${api.bg} border border-zinc-700 rounded-lg flex items-center justify-center ${api.color} group-hover:scale-110 transition-transform`}>
                  <api.icon size={20} />
                </div>
                <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${api.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {api.status}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{api.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{api.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Globe size={12} />
                  <span className="font-mono">{api.endpoint}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {api.methods?.map(method => (
                    <span key={method} className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 rounded">
                      {method}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('scripts')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                  <Code2 size={12} />
                  Try Interactive
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Script Runner Tab */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Script Selector */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Available Scripts</h3>
              <div className="space-y-2">
                {Object.entries(scriptExamples).map(([scriptName, script]) => (
                  <button
                    key={scriptName}
                    onClick={() => setSelectedScript(scriptName)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedScript === scriptName
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-sm uppercase tracking-wider mb-1">
                      {scriptName.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-zinc-500">{script.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Script Details & Runner */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Script Details</h3>

              {selectedScript && (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2">
                      {selectedScript.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-zinc-400 mb-4">
                      {scriptExamples[selectedScript as keyof typeof scriptExamples].description}
                    </div>

                    {/* Method & Endpoint */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-2 py-1 bg-zinc-800 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded">
                        {scriptExamples[selectedScript as keyof typeof scriptExamples].method}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {scriptExamples[selectedScript as keyof typeof scriptExamples].endpoint}
                      </span>
                    </div>
                  </div>

                  {/* Headers */}
                  <div>
                    <div className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Headers
                    </div>
                    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                      {JSON.stringify(scriptExamples[selectedScript as keyof typeof scriptExamples].headers, null, 2)}
                    </pre>
                  </div>

                  {/* Request Payload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                        Request Payload
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(scriptExamples[selectedScript as keyof typeof scriptExamples].request, null, 2), selectedScript)}
                        className="flex items-center gap-2 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
                      >
                        {copiedScript === selectedScript ? <Check size={12} /> : <Copy size={12} />}
                        {copiedScript === selectedScript ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                      {JSON.stringify(scriptExamples[selectedScript as keyof typeof scriptExamples].request, null, 2)}
                    </pre>
                  </div>

                  {/* Success Response */}
                  <div>
                    <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Success Response (200)
                    </div>
                    <pre className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
                      {JSON.stringify(scriptExamples[selectedScript as keyof typeof scriptExamples].successResponse, null, 2)}
                    </pre>
                  </div>

                  {/* Error Response */}
                  {scriptExamples[selectedScript]?.errorResponse && (
                    <div>
                      <div className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">
                        Error Response (400/500)
                      </div>
                      <pre className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-xs font-mono text-red-300 overflow-x-auto">
                        {JSON.stringify(scriptExamples[selectedScript]?.errorResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  <button
                    onClick={() => runScript(selectedScript)}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    {isRunning ? 'Running...' : 'Execute Script'}
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            {scriptResult && (
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Execution Result</h4>
                <div className={`border rounded-lg p-4 ${
                  scriptResult.success
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-red-500/50 bg-red-500/10'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scriptResult.success ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : (
                      <XCircle size={16} className="text-red-400" />
                    )}
                    <span className={`text-sm font-bold uppercase tracking-wider ${
                      scriptResult.success ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {scriptResult.success ? 'Success' : 'Error'}
                    </span>
                  </div>

                  {scriptResult.message && (
                    <div className="text-sm text-zinc-300 mb-2">{scriptResult.message}</div>
                  )}

                  {scriptResult.error && (
                    <div className="text-sm text-red-300 mb-2">{scriptResult.error}</div>
                  )}

                  {scriptResult.data ? (
                    <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(scriptResult.data, null, 2)}
                    </pre>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
