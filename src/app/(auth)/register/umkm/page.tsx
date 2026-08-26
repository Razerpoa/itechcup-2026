'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, UploadCloud, ChevronDown, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { setCurrentUser } from '@/lib/auth-client'
import { useRedirectIfLoggedIn } from '@/hooks/use-auth-guard'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

export default function RegisterUMKMPage() {
  const router = useRouter()
  const { isChecking } = useRedirectIfLoggedIn()
  const [showPassword, setShowPassword] = useState(false)
  const [businessSize, setBusinessSize] = useState('Kecil')
  const [kategori, setKategori] = useState('Kuliner & F&B')
  const [fileName, setFileName] = useState<string | null>(null)
  const [buktiLegalitas, setBuktiLegalitas] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)

  const [formData, setFormData] = useState({
    namaPemilik: '',
    namaUsaha: '',
    email: '',
    password: '',
    nomorWa: '',
    alamat: '',
  })

  useEffect(() => {
    const draftEmail = sessionStorage.getItem('google_draft_email')
    const draftNama = sessionStorage.getItem('google_draft_nama')
    if (draftEmail) {
      setFormData((prev) => ({
        ...prev,
        email: draftEmail,
        namaPemilik: draftNama || prev.namaPemilik
      }))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileName(file.name)

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBuktiLegalitas(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    if (formData.password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.')
      setIsSubmitting(false)
      return
    }

    if (formData.password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok. Periksa kembali.')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/umkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPemilik: formData.namaPemilik,
          namaUsaha: formData.namaUsaha,
          email: formData.email,
          password: formData.password,
          nomorWa: formData.nomorWa,
          ukuranBisnis: businessSize.toUpperCase() as 'MIKRO' | 'KECIL' | 'MENENGAH',
          kategori: kategori,
          alamat: formData.alamat || undefined,
          buktiLegalitas: buktiLegalitas || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 || data.error?.includes('sudah terdaftar')) {
          setIsAlreadyRegistered(true)
          setIsSubmitting(false)
          return
        }
        setErrorMessage(data.error || 'Gagal mendaftarkan akun. Coba lagi.')
        setIsSubmitting(false)
        return
      }

      const userSession = {
        id: data.data?.id || 'u-' + Date.now(),
        nama: formData.namaPemilik,
        email: formData.email,
        role: 'umkm' as const,
        namaUsaha: formData.namaUsaha,
        nomorWa: formData.nomorWa,
        isVerified: false,
        buktiLegalitas: buktiLegalitas || undefined
      }

      if (typeof window !== 'undefined') {
        const existingList = JSON.parse(localStorage.getItem('mitra_muda_all_registered_users_v1') || '[]')
        existingList.push({
          ...userSession,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('mitra_muda_all_registered_users_v1', JSON.stringify(existingList))
      }

      setCurrentUser(userSession)
      router.push('/umkm')
    } catch {
      setErrorMessage('Koneksi bermasalah. Silakan coba lagi.')
      setIsSubmitting(false)
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24">
      <header className="px-4 sm:px-8 py-5 flex items-center justify-between border-b border-[#EAEAEA] bg-white sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Mitra Muda Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-cover shadow-xs border border-[#FFD9CA]"
              unoptimized
            />
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
                Registrasi Profil Bisnis UMKM
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Mulai posting proyek dan temukan talenta muda
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {isAlreadyRegistered ? (
            <div className="mb-6 p-5 bg-[#FFF7F3] border border-[#FFD9CA] rounded-3xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#964825] font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-[#FF9B71]" />
                <span>Akun UMKM Sudah Terdaftar!</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Alamat email <strong>{formData.email}</strong> sudah memiliki akun aktif di Mitra Muda. Anda dapat langsung masuk ke akun Anda.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/login?email=${encodeURIComponent(formData.email)}`}
                  className="px-5 py-2.5 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs rounded-full shadow-2xs transition-colors"
                >
                  Masuk ke Halaman Login
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser({
                      id: 'u-' + Date.now(),
                      nama: formData.namaPemilik,
                      namaUsaha: formData.namaUsaha,
                      email: formData.email,
                      role: 'umkm'
                    })
                    router.push('/umkm')
                  }}
                  className="px-5 py-2.5 bg-white border border-[#FFD9CA] text-[#964825] hover:bg-[#FFF1EB] font-bold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Masuk ke Dashboard UMKM
                </button>
              </div>
            </div>
          ) : errorMessage && (
            <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Nama Pemilik / Penanggung Jawab
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Pemilik Bisnis"
                  className="h-12 bg-[#F5F5F5] rounded-xl px-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={formData.namaPemilik}
                  onChange={(e) => setFormData({ ...formData, namaPemilik: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Nama Usaha / Brand
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Senja Abadi"
                  className="h-12 bg-[#F5F5F5] rounded-xl px-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={formData.namaUsaha}
                  onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Email Bisnis
                </label>
                <input
                  type="email"
                  required
                  placeholder="umkm@gmail.com"
                  className="h-12 bg-[#F5F5F5] rounded-xl px-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Nomor WhatsApp (+62)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  className="h-12 bg-[#F5F5F5] rounded-xl px-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={formData.nomorWa}
                  onChange={(e) => setFormData({ ...formData, nomorWa: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Password Akun
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 8 karakter"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-4 pr-12 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password yang sama"
                  className="h-12 w-full bg-[#F5F5F5] rounded-xl px-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Kategori Usaha
                </label>
                <div className="relative">
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl px-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] appearance-none cursor-pointer"
                  >
                    <option value="Kuliner & F&B">Kuliner & F&B</option>
                    <option value="Fashion & Konveksi">Fashion & Konveksi</option>
                    <option value="Jasa & Pariwisata">Jasa & Pariwisata</option>
                    <option value="Kerajinan & Seni">Kerajinan & Seni</option>
                    <option value="Teknologi & Digital">Teknologi & Digital</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Skala Bisnis
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Mikro', 'Kecil', 'Menengah'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBusinessSize(size)}
                      className={`h-11 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                        businessSize === size
                          ? 'bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs'
                          : 'bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Unggah Bukti Usaha (NIB / Foto Toko / Surat Izin)
                </label>
                <label className="border-2 border-dashed border-[#FFD9CA] bg-[#FFF7F3] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FFF1EB] transition-colors group min-h-[140px] relative">
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 bg-[#FFD9CA] rounded-full flex items-center justify-center text-[#964825] group-hover:scale-110 transition-transform mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {fileName ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-[#964825]">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-[240px]">{fileName}</span>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-xs text-[#964825] mb-0.5">
                        Klik untuk unggah atau seret file ke sini
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Format JPG, PNG, atau PDF (Maksimal 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[#964825] font-bold hover:text-[#FF9B71] transition-colors ml-1">
                  Masuk di sini
                </Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[240px] h-12 bg-[#FF9B71] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-sm cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Mendaftarkan Usaha...</span>
                ) : (
                  <>
                    <span>Daftar & Buat Lowongan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
