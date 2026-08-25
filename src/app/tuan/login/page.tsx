'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldAlert, KeyRound, Eye, EyeOff, ArrowRight, Lock, AlertCircle, Terminal } from 'lucide-react'

export default function HiddenAdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      })

      const data = await res.json()

      if (res.status === 429) {
        setIsLocked(true)
        setErrorMessage(data.error || 'Akses dikunci sementara. Coba lagi nanti.')
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'Kredensial tidak valid.')
        setIsLoading(false)
        return
      }

      // Login berhasil — set fallback untuk admin guard
      if (typeof window !== 'undefined') {
        localStorage.setItem('mitra_muda_admin_logged_in', 'true')
        localStorage.setItem('mitra_muda_admin_session_time', new Date().toISOString())
        sessionStorage.setItem('admin_active_session', 'true')
      }

      router.push('/tuan')
    } catch {
      setErrorMessage('Koneksi ke server gagal. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyber grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,155,113,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,155,113,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF9B71]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-[440px] relative z-10">
        {/* Terminal-style header bar */}
        <div className="bg-[#0D1117] border border-[#FF9B71]/20 rounded-t-2xl px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-[#FF9B71]/60" />
            <span className="text-[10px] font-mono text-[#FF9B71]/50 tracking-widest">MITRA-MUDA://ADMIN — RESTRICTED</span>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-[#0D1117]/95 backdrop-blur-xl border border-[#FF9B71]/15 border-t-0 rounded-b-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(255,155,113,0.08), 0 25px 50px rgba(0,0,0,0.8)' }}
        >
          {/* Icon + badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9B71]/20 to-[#964825]/10 border border-[#FF9B71]/30 flex items-center justify-center"
                style={{ boxShadow: '0 0 30px rgba(255,155,113,0.15)' }}
              >
                <Lock className="w-7 h-7 text-[#FF9B71]" />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl border border-[#FF9B71]/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <ShieldAlert className="w-3 h-3" />
              <span>Akses Terbatas — Operator Resmi</span>
            </div>

            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Panel Kendali Mitra Muda
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Verifikasi akun · Deposit UMKM · Rekening Bersama
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className={`mb-5 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${isLocked
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4" autoComplete="off">
            {/* Username */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" htmlFor="admin-user">
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                required
                autoComplete="off"
                placeholder="Username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLocked}
                className="w-full h-11 bg-[#161B22] border border-slate-700/60 rounded-xl px-4 text-sm font-mono text-slate-200 placeholder:text-slate-600 outline-none focus:border-[#FF9B71]/50 focus:ring-1 focus:ring-[#FF9B71]/30 transition-all disabled:opacity-40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" htmlFor="admin-pass">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="w-full h-11 bg-[#161B22] border border-slate-700/60 rounded-xl pl-4 pr-12 text-sm font-mono text-slate-200 placeholder:text-slate-600 outline-none focus:border-[#FF9B71]/50 focus:ring-1 focus:ring-[#FF9B71]/30 transition-all disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 w-12 flex items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="relative w-full h-11 rounded-xl font-bold text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* Gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF9B71] to-[#F5865A] transition-opacity group-hover:opacity-90" />
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2 text-white">
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="font-mono text-xs tracking-widest">AUTHENTICATING...</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Akses Dikunci</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Buka Panel Kendali</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link href="/" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors font-mono">
              ← Kembali ke Platform Utama
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
