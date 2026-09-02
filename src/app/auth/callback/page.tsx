'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setCurrentUser, getCurrentUser } from '@/lib/auth-client'
import { Loader2, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [statusText, setStatusText] = useState('Memproses verifikasi akun...')
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null)
  const [isInvalidToken, setIsInvalidToken] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        let email: string | undefined = undefined
        let nama: string | undefined = undefined
        let authType: string | null = null

        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          authType = hashParams.get('type')

          if (accessToken) {
            try {
              const base64Url = accessToken.split('.')[1]
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              )
              const parsedToken = JSON.parse(jsonPayload)
              email = parsedToken.email || parsedToken.user_metadata?.email
              nama = parsedToken.user_metadata?.full_name || parsedToken.user_metadata?.name || parsedToken.name
            } catch {
            }
          }
        }

        if (typeof window !== 'undefined' && !authType) {
          const searchParams = new URLSearchParams(window.location.search)
          authType = searchParams.get('type')
        }

        if (!email) {
          const { data: { session } } = await supabase.auth.getSession()
          email = session?.user?.email
          nama = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name
        }

        if (authType === 'recovery') {
          const searchParams = new URLSearchParams(window.location.search)
          const token = searchParams.get('token')

          if (!token) {
            setIsInvalidToken(true)
            return
          }

          try {
            const res = await fetch('/api/auth/verify-reset-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            })
            const data = await res.json()

            if (!res.ok || !data.valid) {
              setIsInvalidToken(true)
              return
            }

            setRecoveryToken(token)
            setUserEmail(data.email)
            setIsRecoveryMode(true)
          } catch {
            setIsInvalidToken(true)
          }
          return
        }

        if (!email) {
          const activeUser = getCurrentUser()
          if (activeUser) {
            if (activeUser.role === 'sekolah') router.push('/sekolah')
            else if (activeUser.role === 'umkm') router.push('/umkm')
            else router.push('/pelajar')
            return
          }
        }

        if (!email) {
          router.push('/login')
          return
        }

        setStatusText('Verifikasi berhasil! Mengalihkan ke dashboard...')

        const res = await fetch('/api/auth/google-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nama }),
        })

        const data = await res.json()
        let targetUser = data.user

        if (!targetUser) {
          targetUser = {
            id: 'p-user-' + Date.now(),
            email: email,
            nama: nama || email.split('@')[0],
            role: 'pelajar',
            sekolah: 'SMK Terdaftar',
            skills: ['Web Dev', 'UI/UX'],
            proyekSelesai: 0,
            totalPendapatan: 0,
            isVerified: false,
            verificationStatus: 'PENDING'
          }
        }

        setCurrentUser(targetUser)
        if (targetUser.role === 'sekolah') {
          router.push('/sekolah')
        } else if (targetUser.role === 'umkm') {
          router.push('/umkm')
        } else {
          router.push('/pelajar')
        }
      } catch {
        const activeUser = getCurrentUser()
        if (activeUser) {
          if (activeUser.role === 'sekolah') router.push('/sekolah')
          else if (activeUser.role === 'umkm') router.push('/umkm')
          else router.push('/pelajar')
        } else {
          router.push('/login')
        }
      }
    }

    handleAuthCallback()
  }, [router])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    if (newPassword.length < 8) {
      setErrorMsg('Password baru minimal 8 karakter.')
      setIsSubmitting(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.')
      setIsSubmitting(false)
      return
    }

    if (!recoveryToken) {
      setErrorMsg('Token pemulihan tidak ditemukan. Silakan minta ulang link pemulihan dari halaman login.')
      setIsSubmitting(false)
      return
    }

    try {
      try {
        await supabase.auth.updateUser({ password: newPassword })
      } catch {
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: recoveryToken,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengubah password. Silakan coba lagi.')
        setIsSubmitting(false)
        return
      }

      setSuccessMsg('Kata sandi berhasil diperbarui! Mengalihkan ke dashboard...')

      if (data.user) {
        setCurrentUser(data.user)
      }

      setTimeout(() => {
        if (data.role === 'sekolah') router.push('/sekolah')
        else if (data.role === 'umkm') router.push('/umkm')
        else router.push('/pelajar')
      }, 1500)
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan. Coba lagi.')
      setIsSubmitting(false)
    }
  }

  if (isInvalidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#EAEAEA] max-w-md w-full space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Link Pemulihan Tidak Valid
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Link pemulihan kata sandi ini tidak valid atau sudah kadaluarsa. Silakan minta ulang link pemulihan melalui halaman login.
            </p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-11 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Kembali ke Halaman Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#EAEAEA] max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Atur Kata Sandi Baru
            </h2>
            <p className="text-xs text-gray-500">
              {userEmail ? `Untuk akun: ${userEmail}` : 'Masukkan kata sandi baru untuk akun Mitra Muda Anda'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 8 karakter"
                  className="h-11 w-full bg-[#F5F5F5] rounded-xl pl-4 pr-11 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                placeholder="Konfirmasi kata sandi"
                className="h-11 w-full bg-[#F5F5F5] rounded-xl px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMsg)}
              className="w-full h-11 bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <span>Simpan & Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-[#EAEAEA] max-w-sm w-full space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-lg text-gray-900">Memverifikasi Akun</h3>
        <p className="text-xs text-gray-500">{statusText}</p>
      </div>
    </div>
  )
}
