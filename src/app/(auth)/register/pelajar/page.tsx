'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  UploadCloud,
  Check,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Copy,
  CheckCircle2,
  Share2,
  School,
  Search
} from 'lucide-react'
import { setCurrentUser } from '@/lib/auth-client'
import { useRedirectIfLoggedIn } from '@/hooks/use-auth-guard'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

export default function RegisterPelajarPage() {
  const router = useRouter()
  const { isChecking } = useRedirectIfLoggedIn()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [gender, setGender] = useState('Laki-laki')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['UI/UX', 'Web Dev'])
  const [fileName, setFileName] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [schools, setSchools] = useState<Array<{ id: string; namaSekolah: string; npsn: string }>>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [schoolSearch, setSchoolSearch] = useState<string>('')
  const [isCustomSchool, setIsCustomSchool] = useState(false)
  const [registrationId, setRegistrationId] = useState<string>('')
  const [copiedId, setCopiedId] = useState(false)

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    tempatLahir: '',
    tanggalLahir: '',
    password: '',
    sekolah: '',
    nisn: '',
    nomorWa: '',
  })

  useEffect(() => {
    fetch('/api/sekolah')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setSchools(data.data)
        }
      })
      .catch(() => {})

    const draftEmail = sessionStorage.getItem('google_draft_email')
    const draftNama = sessionStorage.getItem('google_draft_nama')
    if (draftEmail) {
      setFormData((prev) => ({
        ...prev,
        email: draftEmail,
        nama: draftNama || prev.nama
      }))
    }
  }, [])

  const skillOptions = [
    'Web Dev',
    'UI/UX',
    'Desain Grafis',
    'Video Editor',
    'Copywriting',
    'Mobile App',
    '3D Illustration',
    'Digital Marketing'
  ]

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal 5MB.')
        return
      }
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFilePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (formData.password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.')
      return
    }

    if (formData.password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok. Periksa kembali.')
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    const finalSchoolName = isCustomSchool
      ? schoolSearch.trim()
      : (schools.find((s) => s.id === selectedSchoolId)?.namaSekolah || schoolSearch.trim() || formData.sekolah.trim())
    const finalSchoolId = isCustomSchool ? undefined : (selectedSchoolId || undefined)

    if (!finalSchoolName) {
      setErrorMessage('Silakan pilih atau masukkan asal sekolah Anda.')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/pelajar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap: formData.nama,
          email: formData.email,
          password: formData.password,
          jenisKelamin: gender === 'Laki-laki' ? 'LAKI_LAKI' : 'PEREMPUAN',
          tempatLahir: formData.tempatLahir || undefined,
          tanggalLahir: formData.tanggalLahir || undefined,
          nisn: formData.nisn || undefined,
          sekolah: finalSchoolName,
          sekolahId: finalSchoolId,
          nomorWa: formData.nomorWa,
          bidangKeahlian: selectedSkills,
          fotoKartuPelajar: filePreview || undefined
        }),
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

      if (data.data) {
        setCurrentUser(data.data)
      }
      const regId = data.registrationId || data.data?.registrationId || data.data?.nisn || 'MM-2026-REG'
      setRegistrationId(regId)
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
    const waText = encodeURIComponent(
      `Halo Bapak/Ibu Guru, saya ${formData.nama} telah mendaftar di Mitra Muda dengan ID Registrasi: ${registrationId}. Mohon persetujuan verifikasi akun saya melalui portal sekolah. Terima kasih!`
    )

    return (
      <div className="min-h-screen bg-[#F6F3EE] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-[#E6DFD5] max-w-lg w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
              Pendaftaran Berhasil & Aktif
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Selamat Bergabung, {formData.nama}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Akun Anda telah berhasil dibuat. Simpan <strong>ID Registrasi</strong> Anda berikut untuk proses verifikasi oleh guru/sekolah Anda:
            </p>
          </div>

          <div className="p-4 bg-[#FAF8F5] border-2 border-dashed border-[#FF9B71]/40 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#964825]">
              ID Registrasi Siswa Anda
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-black text-gray-900 tracking-wider">
                {registrationId}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(registrationId)
                  setCopiedId(true)
                  setTimeout(() => setCopiedId(false), 2500)
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#FF9B71] text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#FF9B71]" />
                    <span>Salin ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Guru/pihak sekolah Anda memerlukan ID ini untuk menyetujui akun Anda di Portal Sekolah.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/pelajar')}
              className="w-full h-12 bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Masuk ke Dashboard Siswa Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#25D366]" />
              <span>Kirim ID Registrasi ke Guru via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col pb-16">
      <header className="bg-white w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#EAEAEA] sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1)
              } else {
                router.push('/')
              }
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#FF9B71] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Mitra Muda Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-cover border border-[#FFD9CA]"
              unoptimized
            />
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">
                Pendaftaran Akun Pelajar
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {step === 1 ? 'Langkah 1: Identitas & Keamanan' : 'Langkah 2: Profil Sekolah & Keahlian'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFF1EB] px-4 py-1.5 rounded-full border border-[#FFD9CA] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9B71] animate-pulse" />
            <span className="font-bold text-xs text-[#964825]">
              Langkah {step}/2
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-10">
          {isAlreadyRegistered ? (
            <div className="mb-6 p-5 bg-[#FFF7F3] border border-[#FFD9CA] rounded-3xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#964825] font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-[#FF9B71]" />
                <span>Akun Pelajar Sudah Terdaftar!</span>
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
                      id: 'p-' + Date.now(),
                      email: formData.email,
                      nama: formData.nama,
                      role: 'pelajar',
                      sekolah: formData.sekolah,
                      nisn: formData.nisn,
                      skills: selectedSkills,
                      proyekSelesai: 0,
                      totalPendapatan: 0,
                      onTimeRate: 100,
                      verificationStatus: 'PENDING',
                      isVerified: false
                    })
                    router.push('/pelajar')
                  }}
                  className="px-5 py-2.5 bg-white border border-[#FFD9CA] text-[#964825] hover:bg-[#FFF1EB] font-bold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Masuk ke Dashboard Pelajar
                </button>
              </div>
            </div>
          ) : errorMessage && (
            <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <div>
              <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 text-[#964825] font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-[#FF9B71]" />
                  Tahap Pertama
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Lengkapi Data Diri & Akun
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Mulai berkarya dan hasilkan pendapatan tanpa perlu syarat KTP atau rekening bank.
                </p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="nama">
                      Nama Lengkap
                    </label>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="nama"
                      placeholder="Masukkan nama lengkap sesuai identitas"
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="email">
                      Email Aktif
                    </label>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="email"
                      placeholder="nama@gmail.com"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="nomorWa">
                      Nomor WhatsApp (Aktif)
                    </label>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="nomorWa"
                      placeholder="081234567890"
                      type="tel"
                      required
                      value={formData.nomorWa}
                      onChange={(e) => setFormData({ ...formData, nomorWa: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      Jenis Kelamin
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('Laki-laki')}
                        className={`flex-1 h-12 flex items-center justify-center rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          gender === 'Laki-laki'
                            ? 'bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs'
                            : 'bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Perempuan')}
                        className={`flex-1 h-12 flex items-center justify-center rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          gender === 'Perempuan'
                            ? 'bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs'
                            : 'bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="tempatLahir">
                      Tempat Lahir
                    </label>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="tempatLahir"
                      placeholder="Kota kelahiran"
                      type="text"
                      required
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="tanggalLahir">
                      Tanggal Lahir
                    </label>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all"
                      id="tanggalLahir"
                      type="date"
                      required
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    />
                  </div>


                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="password">
                      Buat Password
                    </label>
                    <div className="relative">
                      <input
                        className="h-12 w-full bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl pl-4 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                        id="password"
                        placeholder="Minimal 8 karakter"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={formData.password} />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="confirmPassword">
                      Konfirmasi Password
                    </label>
                    <input
                      className="h-12 w-full bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="confirmPassword"
                      placeholder="Ulangi password yang sama"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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
                    className="w-full sm:w-auto min-w-[200px] h-12 bg-[#FF9B71] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Lanjut ke Langkah 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 text-[#964825] font-bold text-xs uppercase tracking-wider mb-1">
                  <GraduationCap className="w-4 h-4 text-[#FF9B71]" />
                  Tahap Kedua
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Asal Sekolah & Bidang Keahlian
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Informasi ini akan ditampilkan pada profil dan diverifikasi oleh pihak sekolah.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="sekolah">
                        Asal Sekolah / Institusi
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSchool(!isCustomSchool)
                          if (!isCustomSchool) {
                            setSelectedSchoolId('')
                          }
                        }}
                        className="text-[11px] font-bold text-[#964825] hover:text-[#FF9B71] underline cursor-pointer"
                      >
                        {isCustomSchool ? '← Pilih dari Sekolah Terdaftar di Database' : '+ Sekolah Belum Terdaftar? Ketik Manual'}
                      </button>
                    </div>

                    {!isCustomSchool && schools.length > 0 ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            id="sekolah"
                            value={selectedSchoolId}
                            onChange={(e) => {
                              setSelectedSchoolId(e.target.value)
                              const sch = schools.find((s) => s.id === e.target.value)
                              if (sch) setFormData({ ...formData, sekolah: sch.namaSekolah })
                            }}
                            className="h-12 w-full bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Sekolah Terdaftar di Database Mitra Muda --</option>
                            {schools.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.namaSekolah} (NPSN: {s.npsn})
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedSchoolId ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Terverifikasi di Database — Akun Anda otomatis terhubung ke portal sekolah ini</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-500">
                            Pilih sekolah Anda agar guru / admin sekolah dapat langsung menyetujui akun Anda.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                          id="sekolah"
                          placeholder="Masukkan nama lengkap sekolah (misal: SMKN 2 Tasikmalaya)"
                          type="text"
                          required
                          value={schoolSearch || formData.sekolah}
                          onChange={(e) => {
                            setSchoolSearch(e.target.value)
                            setFormData({ ...formData, sekolah: e.target.value })
                          }}
                        />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium">
                          <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Sekolah ini belum terdaftar di database. Anda tetap bisa mendaftar dan akun dapat diverifikasi admin pusat.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-gray-700 uppercase tracking-wider" htmlFor="nisn">
                        NIS / NISN Siswa <span className="text-gray-400 font-normal text-[11px]">(Opsional)</span>
                      </label>
                      <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-[#964825]" />
                        <span className="text-[10px] text-gray-600 font-bold">Privat</span>
                      </div>
                    </div>
                    <input
                      className="h-12 bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white focus:ring-2 focus:ring-[#FFD9CA] rounded-xl px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      id="nisn"
                      placeholder="Kosongkan jika belum tahu (ID Registrasi dibuat otomatis)"
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      Bidang Keahlian Utama (Pilih min. 1 yang dikuasai)
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {skillOptions.map((skill) => {
                        const isSelected = selectedSkills.includes(skill)
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#FF9B71] text-white shadow-xs'
                                : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{skill}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                      Unggah Foto Kartu Pelajar (Opsional / Sementara)
                    </label>
                    <label className="border-2 border-dashed border-[#FFD9CA] bg-[#FFF7F3] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FFF1EB] transition-colors group min-h-[140px] relative overflow-hidden">
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {filePreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#FFD9CA] shadow-xs relative bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={filePreview} alt="Preview Kartu" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#964825]">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="truncate max-w-[200px]">{fileName}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium underline hover:text-[#964825]">
                            Klik untuk ganti foto
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-[#FFD9CA] rounded-full flex items-center justify-center text-[#964825] group-hover:scale-110 transition-transform mb-2">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-xs text-[#964825] mb-0.5">
                            Klik untuk unggah foto kartu pelajar
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Format JPG, PNG, atau WEBP (Maksimal 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-6 h-12 rounded-full border border-[#EAEAEA] hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Langkah 1</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[260px] h-12 bg-[#FF9B71] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-sm cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span>Menyimpan Akun...</span>
                    ) : (
                      <>
                        <span>Daftar & Buat Portofolio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
