"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound,
  Eye,
  EyeOff,
  User,
  Save,
  Loader2
} from "lucide-react"
import { useProfile } from "@/components/providers/ProfileProvider"

export default function SettingsPage() {
  const supabase = createClient()
  const { profile, refresh } = useProfile()

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({ new: "", confirm: "" })
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
  })

  // Populate form once profile has loaded from context
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        position: profile.position ?? "",
      })
    }
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      return toast.error("First and last name are required")
    }

    setProfileLoading(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        position: profileForm.position.trim(),
      })
      .eq("id", profile.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Profile updated successfully")
      await refresh()
    }
    setProfileLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match")
    }
    if (passwords.new.length < 6) {
      return toast.error("Password must be at least 6 characters")
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.new })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password updated successfully")
      setPasswords({ new: "", confirm: "" })
    }
    setPasswordLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-12 h-screen overflow-auto custom-scrollbar bg-[#09090b]">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <Lock size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">Settings</h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] mt-2">
            Profile & Account Configuration
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <User size={20} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">First Name</label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                required
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">Last Name</label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                required
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">Position / Job Title</label>
            <input
              type="text"
              value={profileForm.position}
              onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="e.g. Senior Software Developer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">Role ID</label>
            <input
              type="text"
              value={profile?.role_id ?? ""}
              disabled
              className="w-full bg-[#0c0c0e] border border-[#1c1c1f] rounded-xl py-3 px-4 text-sm text-zinc-600 cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-zinc-700 ml-1">Role ID is managed by your administrator</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-[#18181b] hover:bg-blue-500/10 border border-[#27272a] hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 py-3 px-6 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>

        <div className="absolute top-0 right-0 p-8 text-blue-500/5 rotate-12 -z-0">
          <User size={180} />
        </div>
      </motion.div>

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Security Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-2xl p-6">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Active Protection</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Your account is monitored for suspicious activity. We recommend using a unique password that includes numbers and symbols.
            </p>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Password Policy</h4>
            <ul className="text-[9px] text-zinc-600 space-y-1.5 font-bold uppercase tracking-wider">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                Minimum 6 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                Case sensitive
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                Instant propagation
              </li>
            </ul>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0c0c0e] border border-[#1c1c1f] rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Change Password</h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">New Password</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        required
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-blue-600 hover:bg-white hover:text-black text-white py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {passwordLoading ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <>
                        Update Account Security
                        <Lock size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="absolute top-0 right-0 p-8 text-blue-500/5 rotate-12 -z-0">
              <ShieldCheck size={180} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
