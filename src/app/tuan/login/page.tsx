'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff, ArrowRight, Lock, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F6F3EE] flex relative overflow-hidden">
      
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#FF9B71]/[0.07] blur-[100px]" />
      <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-[#964825]/[0.04] blur-[120px]" />

      
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Mitra Muda" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-[#2D2319] text-lg tracking-tight">Mitra Muda</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold text-[#2D2319] leading-[1.15] tracking-tight mb-5">
              Kelola platform
              <br />
              <span className="text-[#964825]">dengan aman.</span>
            </h2>
            <p className="text-[#8B7E74] text-[15px] leading-relaxed">
              Panel administrasi untuk memverifikasi akun pelajar, mengelola data sekolah & UMKM, serta memantau transaksi platform secara real-time.
            </p>
          </div>
        </div>

        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FF9B71]/20 border-2 border-[#F6F3EE] flex items-center justify-center text-[10px] font-bold text-[#964825]">R</div>
            <div className="w-8 h-8 rounded-full bg-[#964825]/15 border-2 border-[#F6F3EE] flex items-center justify-center text-[10px] font-bold text-[#964825]">A</div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D2319]">Tim Operator</p>
            <p className="text-[11px] text-[#8B7E74]">Akses terbatas untuk admin resmi</p>
          </div>
        </div>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Mitra Muda" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-[#2D2319] tracking-tight">Mitra Muda</span>
          </div>

          
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.06)] border border-[#E8E2DA]/60">
            
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9B71]/10 flex items-center justify-center mb-5">
                <KeyRound className="w-5 h-5 text-[#964825]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#2D2319] tracking-tight mb-1">
                Masuk Admin
              </h1>
              <p className="text-sm text-[#8B7E74]">
                Masukkan kredensial untuk mengakses panel kendali.
              </p>
            </div>

            
            {errorMessage && (
              <div className={`mb-6 p-3.5 rounded-2xl text-[13px] font-medium flex items-start gap-2.5 ${isLocked
                ? 'bg-[#FFF4EC] text-[#964825] border border-[#FFD9CA]'
                : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            
            <form onSubmit={handleAdminLogin} className="space-y-5" autoComplete="off">
              <div>
                <label className="text-[13px] font-semibold text-[#2D2319] block mb-2" htmlFor="admin-user">
                  Username
                </label>
                <input
                  id="admin-user"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLocked}
                  className="w-full h-12 bg-[#FAFAF8] border border-[#E0DAD2] rounded-2xl px-4 text-sm text-[#2D2319] placeholder:text-[#B5ADA4] outline-none focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FF9B71]/15 transition-all disabled:opacity-40"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#2D2319] block mb-2" htmlFor="admin-pass">
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
                    className="w-full h-12 bg-[#FAFAF8] border border-[#E0DAD2] rounded-2xl pl-4 pr-12 text-sm text-[#2D2319] placeholder:text-[#B5ADA4] outline-none focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FF9B71]/15 transition-all disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-[#B5ADA4] hover:text-[#964825] cursor-pointer transition-colors"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isLocked}
                  className="w-full h-12 rounded-2xl font-bold text-[14px] bg-[#2D2319] text-white hover:bg-[#3D3229] active:bg-[#1D1309] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Akses Dikunci</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Panel</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            
            <div className="mt-8 pt-6 border-t border-[#F0EBE4] text-center">
              <Link href="/" className="text-[13px] text-[#8B7E74] hover:text-[#964825] transition-colors font-medium">
                ← Kembali ke beranda
              </Link>
            </div>
          </div>

          
          <p className="text-center text-[11px] text-[#B5ADA4] mt-6">
            Dilindungi oleh rate limiter server-side · 5 percobaan / 10 menit
          </p>
        </div>
      </div>
    </div>
  )
}
