"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Shield, Eye, EyeOff, Terminal } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have the access token from the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }, [searchParams, supabase])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password updated successfully!")
      router.push("/dashboard")
    } catch {
      toast.error("Failed to update password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#020617] font-mono selection:bg-cyan-500/30">

      {/* Matrix-like Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-[10px] leading-none text-cyan-500 break-all whitespace-normal">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="mb-1">
            {Math.random().toString(36).substring(2).repeat(10)}
          </div>
        ))}
      </div>

      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Logo Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10 z-10"
      >
        <div className="text-cyan-400 text-3xl">
          <Terminal strokeWidth={3} size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center">
          DEV<span className="text-cyan-400">HUB</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <div className="bg-[#020617]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] overflow-hidden">

          {/* Header Status Bar */}
          <div className="bg-cyan-500/5 border-b border-cyan-500/20 px-4 py-2 flex items-center justify-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-cyan-400"
            >
              <Shield size={14} />
            </motion.div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-400/80">
              Password Reset Required
            </span>
          </div>

          <div className="p-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">
                New Password
              </h2>
              <p className="text-cyan-500/60 text-[10px] uppercase tracking-widest font-bold">
                Enter a secure password for your account
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyan-500/60 text-[10px] uppercase tracking-[0.2em] font-black">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border border-cyan-500/20 rounded-sm text-cyan-100 placeholder:text-cyan-900/50 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 text-xs h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-900 hover:text-cyan-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-cyan-500/60 text-[10px] uppercase tracking-[0.2em] font-black">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border border-cyan-500/20 rounded-sm text-cyan-100 placeholder:text-cyan-900/50 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 text-xs h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all duration-300 font-bold text-xs uppercase tracking-[0.2em] rounded-sm group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/0 transition-colors" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Shield size={16} />
                      Update Password
                    </>
                  )}
                </span>
              </Button>
            </form>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-cyan-500/10 p-4 flex justify-between items-center bg-cyan-500/[0.02]">
            <span className="text-[8px] text-cyan-700 font-bold uppercase tracking-widest">
              DevHub v2.0
            </span>
            <div className="flex gap-2">
              <span className="text-[8px] text-cyan-700 font-bold uppercase tracking-widest">
                AlgoHive Internal
              </span>
              <span className="text-[8px] text-cyan-700 font-bold uppercase tracking-widest opacity-40">
                •
              </span>
              <span className="text-[8px] text-cyan-700 font-bold uppercase tracking-widest">
                Restricted
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}