'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Tag, MapPin, Mail, Lock, Phone, User, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { setCurrentUser } from '@/lib/auth-client'
import { useRedirectIfLoggedIn } from '@/hooks/use-auth-guard'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

export default function RegisterSekolahPage() {
  const router = useRouter()
  const { isChecking } = useRedirectIfLoggedIn()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false)

  const [formData, setFormData] = useState({
    namaSekolah: '',
    npsn: '',
    emailResmi: '',
    password: '',
    namaPenanggungJawab: '',
    jabatanAdmin: 'Kepala Sekolah / Waka Hubin',
    alamatLengkap: '',
    kontakSekolah: ''
  })

  useEffect(() => {
    const draftEmail = sessionStorage.getItem('google_draft_email')
    const draftNama = sessionStorage.getItem('google_draft_nama')
    if (draftEmail) {
      setFormData((prev) => ({
        ...prev,
        emailResmi: draftEmail,
        namaPenanggungJawab: draftNama || prev.namaPenanggungJawab
      }))
    }
  }, [])

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
      const res = await fetch('/api/sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 || data.error?.includes('sudah terdaftar')) {
          setIsAlreadyRegistered(true)
          setIsSubmitting(false)
          return
        }
        setErrorMessage(data.error || 'Gagal mendaftarkan akun sekolah. Coba lagi.')
        setIsSubmitting(false)
        return
      }

      if (data.data) {
        setCurrentUser({
          id: data.data.id,
          nama: data.data.nama || data.data.namaPenanggungJawab || formData.namaPenanggungJawab,
          namaSekolah: data.data.namaSekolah || data.data.nama_sekolah || formData.namaSekolah,
          email: data.data.email || data.data.emailResmi || formData.emailResmi,
          npsn: data.data.npsn || formData.npsn,
          role: 'sekolah',
          isVerified: Boolean(data.data.isVerified || data.data.is_verified),
          verificationStatus: data.data.verificationStatus || 'PENDING'
        })
      }

      setIsSubmitting(false)
      setIsRegisteredSuccess(true)
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

  if (isRegisteredSuccess) {
    return (
      <div className="min-h-screen bg-[#F6F3EE] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-[#E6DFD5] max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
              Pendaftaran Berhasil
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang, {formData.namaSekolah}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Akun lembaga sekolah Anda telah terdaftar. Anda dapat langsung masuk ke dashboard kemitraan sekolah untuk memantau siswa Anda.
            </p>
          </div>

          <div className="p-4 bg-[#FFF7F3] border border-[#FFD9CA] rounded-2xl text-left space-y-2">
            <p className="text-xs text-[#964825] leading-relaxed">
              <strong>Info Verifikasi:</strong> Akun sekolah Anda berstatus awal <em>Menunggu Verifikasi</em>. Siswa Anda sudah dapat memilih sekolah ini saat mendaftar dan memberikan ID Registrasi mereka.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push('/sekolah')}
              className="w-full h-12 bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Masuk ke Dashboard Sekolah Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/login"
              className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-bold text-xs flex items-center justify-center transition-colors"
            >
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-24">
      <header className="w-full pt-10 pb-6 px-6 flex flex-col items-center justify-center relative">
        <Link
          href="/"
          className="absolute left-6 top-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#EAEAEA] text-gray-700 hover:text-[#FF9B71] transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Image
          src="/logo.jpg"
          alt="Mitra Muda Logo"
          width={64}
          height={64}
          className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-[#FFD9CA] mb-4"
          unoptimized
        />
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Halo, <span className="italic text-[#FF9B71]">Sekolah!</span>
          </h1>
          <p className="text-xs uppercase font-bold tracking-widest text-[#964825] mt-2">
            Portal Kemitraan & Verifikasi Sekolah Terverifikasi Kemendikdasmen
          </p>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 flex-1">
        <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10">
          
          <div className="mb-6 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">Proteksi Keamanan Sekolah RI</h4>
              <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                Setiap pendaftaran sekolah wajib mencantumkan <strong>NPSN 8-digit valid</strong> dan email penanggung jawab resmi. Sistem secara otomatis memvalidasi nama & akreditasi sekolah ke database Kemendikdasmen RI untuk mencegah penyamaran pihak luar.
              </p>
            </div>
          </div>

          {isAlreadyRegistered ? (
            <div className="mb-6 p-5 bg-[#FFF7F3] border border-[#FFD9CA] rounded-3xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#964825] font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-[#FF9B71]" />
                <span>Akun Sekolah Sudah Terdaftar!</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Alamat email <strong>{formData.emailResmi}</strong> sudah memiliki akun aktif di Mitra Muda. Anda dapat langsung masuk ke akun Anda.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/login?email=${encodeURIComponent(formData.emailResmi)}`}
                  className="px-5 py-2.5 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs rounded-full shadow-2xs transition-colors"
                >
                  Masuk ke Halaman Login
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser({
                      id: 's-' + Date.now(),
                      nama: formData.namaPenanggungJawab,
                      namaSekolah: formData.namaSekolah,
                      npsn: formData.npsn,
                      email: formData.emailResmi,
                      role: 'sekolah'
                    })
                    router.push('/sekolah')
                  }}
                  className="px-5 py-2.5 bg-white border border-[#FFD9CA] text-[#964825] hover:bg-[#FFF1EB] font-bold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Masuk ke Dashboard Sekolah
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
                  Nama Resmi Sekolah
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMKN 2 Tasikmalaya"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.namaSekolah}
                    onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  />
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  NPSN (Nomor Pokok Sekolah Nasional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="8 Digit NPSN (cth: 20224512)"
                    maxLength={8}
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.npsn}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  />
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Email Resmi Sekolah
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="admin@smkn2tasik.sch.id"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.emailResmi}
                    onChange={(e) => setFormData({ ...formData, emailResmi: e.target.value })}
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
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
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-12 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Ulangi password yang sama"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Nama Penanggung Jawab
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap & Gelar"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.namaPenanggungJawab}
                    onChange={(e) => setFormData({ ...formData, namaPenanggungJawab: e.target.value })}
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Kontak / Nomor Telepon Sekolah
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="0265-xxxxxx / 0812xxxx"
                    className="h-12 w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    value={formData.kontakSekolah}
                    onChange={(e) => setFormData({ ...formData, kontakSekolah: e.target.value })}
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Alamat Lengkap Sekolah
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    required
                    placeholder="Jalan, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                    className="w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] resize-none"
                    value={formData.alamatLengkap}
                    onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
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
                  <span>Mendaftarkan Sekolah...</span>
                ) : (
                  <>
                    <span>Daftar Portal Sekolah</span>
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
