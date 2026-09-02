'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap, Store, Building2, X, ArrowRight, AlertCircle, Key, CheckCircle2, Mail, Sparkles, ShieldCheck } from 'lucide-react'
import { setCurrentUser } from '@/lib/auth-client'
import { getUser2FAConfig, verifyOTPCode } from '@/lib/two-factor-store'
import { useRedirectIfLoggedIn } from '@/hooks/use-auth-guard'

export default function LoginPage() {
  const router = useRouter()
  const { isChecking } = useRedirectIfLoggedIn()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetSuccess, setIsResetSuccess] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [googleDraftEmail, setGoogleDraftEmail] = useState<string | null>(null)


  const [pendingUser, setPendingUser] = useState<any | null>(null)
  const [is2FAChallengeOpen, setIs2FAChallengeOpen] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [inputGoogleEmail, setInputGoogleEmail] = useState('')
  const [googleCheckError, setGoogleCheckError] = useState<string | null>(null)
  const [isGoogleChecking, setIsGoogleChecking] = useState(false)

  useEffect(() => {
    const checkEmailRegistrationStatus = async () => {
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get('email')
      const draftEmail = sessionStorage.getItem('google_draft_email')
      const targetEmail = emailParam || draftEmail

      if (targetEmail) {
        setEmail(targetEmail)
        
        
        try {
          const res = await fetch('/api/auth/google-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail })
          })
          const data = await res.json()
          if (data.exists && data.user) {
            sessionStorage.removeItem('google_draft_email')
            sessionStorage.removeItem('google_draft_nama')
            window.history.replaceState({}, document.title, window.location.pathname)
            finalizeLogin(data.user)
            return
          }
          
          if (!data.exists) {
            sessionStorage.setItem('google_draft_email', data.email || targetEmail)
            sessionStorage.setItem('google_draft_nama', data.nama || '')
            window.history.replaceState({}, document.title, window.location.pathname)
            router.push('/?google_new=1')
            return
          }
        } catch {
        }
      }
    }

    checkEmailRegistrationStatus()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Mohon isi alamat email/username dan password Anda.')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Email atau password yang Anda masukkan salah. Periksa kembali data Anda.')
        setIsLoading(false)
        return
      }

      if (data.user) {
        const config = getUser2FAConfig(data.user.id)
        if (config.isEnabled) {
          setPendingUser(data.user)
          setIs2FAChallengeOpen(true)
          setIsLoading(false)
          return
        }

        finalizeLogin(data.user)
      }
    } catch {
      setErrorMessage('Koneksi internet atau server bermasalah. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  const finalizeLogin = (userObj: any) => {
    setCurrentUser(userObj)
    if (userObj.role === 'sekolah') {
      router.push('/sekolah')
    } else if (userObj.role === 'umkm') {
      router.push('/umkm')
    } else {
      router.push('/pelajar')
    }
  }

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError(null)

    if (!pendingUser) return

    const isValid = verifyOTPCode(otpInput, pendingUser.id)
    if (isValid) {
      setIs2FAChallengeOpen(false)
      finalizeLogin(pendingUser)
    } else {
      setOtpError('Kode OTP tidak valid atau kadaluarsa. Coba lagi.')
    }
  }

  const [resetError, setResetError] = useState<string | null>(null)

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) return
    setIsResetLoading(true)
    setResetError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setResetError(data.error || 'Gagal memproses pemulihan. Periksa alamat email Anda.')
        setIsResetLoading(false)
        return
      }

      setIsResetLoading(false)
      setIsResetSuccess(true)
    } catch {
      setResetError('Gagal terhubung ke server. Silakan coba lagi.')
      setIsResetLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    sessionStorage.removeItem('google_draft_email')
    sessionStorage.removeItem('google_draft_nama')
    setGoogleDraftEmail(null)
    setIsRegisterModalOpen(false)

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setIsLoading(false)
        setErrorMessage('Gagal membuka otentikasi Google. Silakan periksa koneksi Anda.')
      }
    } catch {
      setIsLoading(false)
      setErrorMessage('Gagal terhubung ke server otentikasi Google.')
    }
  }

  const handleVerifyGoogleEmailDB = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) return
    setIsGoogleChecking(true)
    setGoogleCheckError(null)

    try {
      const res = await fetch('/api/auth/google-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck.trim() })
      })

      const data = await res.json()
      setIsGoogleChecking(false)

      const foundUser = data.exists && data.user ? data.user : null

      if (foundUser) {
        sessionStorage.removeItem('google_draft_email')
        sessionStorage.removeItem('google_draft_nama')
        setGoogleDraftEmail(null)
        setIsGoogleModalOpen(false)
        setIsRegisterModalOpen(false)
        
        const config = getUser2FAConfig(foundUser.id)
        if (config.isEnabled) {
          setPendingUser(foundUser)
          setIs2FAChallengeOpen(true)
          return
        }

        finalizeLogin(foundUser)
      } else {
        
        sessionStorage.setItem('google_draft_email', data.email || emailToCheck.trim())
        sessionStorage.setItem('google_draft_nama', data.nama || emailToCheck.trim().split('@')[0])
        setIsGoogleModalOpen(false)
        setIsRegisterModalOpen(false)
        router.push('/?google_new=1')
      }
    } catch {
      setIsGoogleChecking(false)
      
      sessionStorage.setItem('google_draft_email', emailToCheck.trim())
      setIsGoogleModalOpen(false)
      setIsRegisterModalOpen(false)
      router.push('/?google_new=1')
    }
  }



  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FF9B71] border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Memeriksa sesi...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#FAFAFA]">
      <main className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAEAEA] p-8 md:p-10 relative z-10">
        <header className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/logo.jpg"
            alt="Mitra Muda Logo"
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-sm border border-[#FFD9CA]"
            unoptimized
          />
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Masuk ke Akunmu
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Mulai kolaborasi dan kembangkan potensimu bersama kami.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-2xl text-xs font-semibold shadow-xs animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-red-800 text-xs mb-0.5">Gagal Masuk</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div>
            <label className="sr-only" htmlFor="email">Email / Username</label>
            <input
              className={`w-full h-12 px-4 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none transition-all text-sm font-medium ${
                errorMessage
                  ? 'bg-red-50/50 border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA]'
              }`}
              id="email"
              name="email"
              placeholder="Email / Username (cth: pelajar@gmail.com)"
              required
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
            />
          </div>

          <div className="relative">
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              className={`w-full h-12 pl-4 pr-12 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none transition-all text-sm font-medium ${
                errorMessage
                  ? 'bg-red-50/50 border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA]'
              }`}
              id="password"
              name="password"
              placeholder="Password"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
            />
            <button
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-1 mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
              <input
                className="w-4 h-4 rounded border-gray-300 text-[#FF9B71] focus:ring-[#FF9B71]"
                id="remember"
                name="remember"
                type="checkbox"
              />
              <span>Ingat saya</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email)
                setIsResetSuccess(false)
                setIsForgotModalOpen(true)
              }}
              className="text-sm text-[#964825] hover:text-[#FF9B71] transition-colors font-semibold cursor-pointer hover:underline"
            >
              Lupa Password?
            </button>
          </div>

          <button
            className="w-full h-12 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white font-bold text-sm transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500 font-medium">atau masuk dengan</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-12 flex items-center justify-center gap-3 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors duration-200 font-semibold text-sm text-gray-700 shadow-xs cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.72 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.58C14.74 18.24 13.48 18.66 12 18.66C9.13999 18.66 6.71999 16.73 5.85999 14.12H2.18999V16.97C3.99999 20.57 7.69999 23 12 23Z" fill="#34A853" />
            <path d="M5.85999 14.12C5.63999 13.46 5.50999 12.75 5.50999 12C5.50999 11.25 5.63999 10.54 5.85999 9.88V7.03H2.18999C1.45999 8.48 1.03999 10.18 1.03999 12C1.03999 13.82 1.45999 15.52 2.18999 16.97L5.85999 14.12Z" fill="#FBBC05" />
            <path d="M12 5.34C13.62 5.34 15.06 5.9 16.2 6.98L19.36 3.82C17.45 2.04 14.96 1 12 1C7.69999 1 3.99999 3.43 2.18999 7.03L5.85999 9.88C6.71999 7.27 9.13999 5.34 12 5.34Z" fill="#EA4335" />
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>

        <div className="mt-8 text-center flex flex-col gap-2">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-[#964825] font-bold hover:text-[#FF9B71] transition-colors ml-1 cursor-pointer underline"
            >
              Daftar di sini
            </button>
          </p>
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
            ← Kembali ke Pilihan Peran
          </Link>
        </div>
      </main>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] mx-auto mb-3">
                <Image
                  src="/logo.jpg"
                  alt="Mitra Muda"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover"
                  unoptimized
                />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {googleDraftEmail ? 'Akun Google Belum Terdaftar' : 'Pilih Jenis Pendaftaran'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {googleDraftEmail
                  ? `Email ${googleDraftEmail} belum terdaftar. Silakan pilih peran Anda untuk mendaftar.`
                  : 'Daftarkan akun sesuai peran Anda di ekosistem Mitra Muda'}
              </p>
            </div>

            {googleDraftEmail ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col gap-1">
                <span className="font-extrabold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Email Google Belum Terdaftar!</span>
                </span>
                <span>
                  Email <strong>{googleDraftEmail}</strong> belum pernah terdaftar di database Mitra Muda. Silakan pilih peranan Anda di bawah ini untuk menyelesaikan pendaftaran awal:
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-6">
                Pilih jenis akun yang ingin Anda daftarkan di platform Mitra Muda:
              </p>
            )}

            <div className="space-y-3">
              <Link
                href="/register/pelajar"
                className="flex items-center gap-4 p-4 rounded-2xl border border-[#EAEAEA] hover:border-[#FF9B71] hover:bg-[#FFF7F3] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">Saya Pelajar / Mahasiswa</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Dapatkan penghasilan dari karya tanpa syarat KTP/Bank</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
              </Link>

              <Link
                href="/register/umkm"
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#FFD9CA] bg-[#FFF7F3] hover:border-[#FF9B71] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF9B71] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">Saya Pemilik UMKM</h4>
                    <span className="text-[10px] font-bold text-white bg-[#FF9B71] px-2 py-0.5 rounded-full">Populer</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Rekrut talenta muda dengan sistem DP escrow aman</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
              </Link>

              <Link
                href="/register/sekolah"
                className="flex items-center gap-4 p-4 rounded-2xl border border-[#EAEAEA] hover:border-[#FF9B71] hover:bg-[#FFF7F3] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-900">Saya Pihak Sekolah</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Pantau portofolio, verifikasi siswa, & kemitraan</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isResetSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Email Pemulihan Terkirim!</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Kami telah menginstruksikan langkah pemulihan kata sandi ke <strong className="text-gray-900">{resetEmail || 'email Anda'}</strong>.
                  </p>
                </div>
                <div className="bg-[#FFF1EB] p-4 rounded-2xl border border-[#FFD9CA] text-xs text-[#964825] text-left space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Mail className="w-4 h-4 shrink-0" /> Cek Kotak Masuk / Spam
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Buka pesan dari Mitra Muda untuk mengatur ulang kata sandi baru Anda.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false)
                      setIsResetSuccess(false)
                    }}
                    className="w-full py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Kembali ke Halaman Login
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] mx-auto mb-3">
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">Lupa Kata Sandi?</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan email terdaftar Anda untuk menerima tautan pemulihan password.
                  </p>
                </div>

                {resetError && (
                  <div className="mb-4 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Terdaftar</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="contoh: pelajar@gmail.com"
                      className="w-full h-11 px-4 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] text-gray-900 placeholder:text-gray-400 outline-none transition-all text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="w-full h-11 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-70"
                  >
                    {isResetLoading ? 'Mengirim Instruksi...' : 'Kirim Link Pemulihan'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      
      {is2FAChallengeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 border border-[#FFD9CA]">
              <ShieldCheck className="w-7 h-7 text-[#FF9B71]" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Verifikasi Autentikasi 2FA</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Akun Anda ({pendingUser?.email}) dilindungi Autentikasi 2-Langkah. Masukkan 6-digit kode verifikasi dari aplikasi Authenticator Anda.
            </p>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <input
                type="text"
                required
                maxLength={7}
                placeholder="123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full h-14 bg-[#F5F5F5] rounded-2xl px-4 text-center font-mono text-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all tracking-widest"
              />

              {otpError && (
                <p className="text-xs text-red-600 font-medium">{otpError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIs2FAChallengeOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs rounded-full shadow-2xs transition-colors cursor-pointer"
                >
                  Verifikasi & Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  )
}
