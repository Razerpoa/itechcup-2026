'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Store, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useRedirectIfLoggedIn } from '@/hooks/use-auth-guard'

type RoleType = 'pelajar' | 'umkm' | 'sekolah'

export default function OnboardingPage() {
  const router = useRouter()
  const { isChecking } = useRedirectIfLoggedIn()
  const [selectedRole, setSelectedRole] = useState<RoleType>('pelajar')

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FF9B71] border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Memuat Mitra Muda...</span>
        </div>
      </div>
    )
  }

  const handleContinue = () => {
    if (selectedRole === 'pelajar') router.push('/register/pelajar')
    else if (selectedRole === 'umkm') router.push('/register/umkm')
    else router.push('/register/sekolah')
  }

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between py-8 px-4 sm:px-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Mitra Muda Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl shadow-xs object-cover border border-[#FF9B71]"
            unoptimized
          />
          <span className="font-extrabold text-xl tracking-tight text-gray-900">
            Mitra<span className="text-[#FF9B71]">Muda</span>
          </span>
        </div>
      </header>

      {/* Main Choice Section (Upwork Style) */}
      <main className="max-w-4xl w-full mx-auto my-auto py-10 flex flex-col items-center">
        <div className="text-center mb-10 max-w-xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Bergabung sebagai Pelajar, Klien UMKM, atau Sekolah
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Pilih peran Anda untuk memulai kolaborasi karya dan proyek nyata.
          </p>
        </div>

        {/* Interactive Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-8">
          {/* Card 1: Pelajar */}
          <div
            onClick={() => setSelectedRole('pelajar')}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
              selectedRole === 'pelajar'
                ? 'border-[#FF9B71] shadow-[0_10px_30px_rgba(255,155,113,0.18)] ring-2 ring-[#FFD9CA]'
                : 'border-[#EAEAEA] hover:border-gray-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                selectedRole === 'pelajar' ? 'bg-[#FF9B71] text-white' : 'bg-[#FFF1EB] text-[#964825]'
              }`}>
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'pelajar' ? 'border-[#FF9B71] bg-[#FF9B71] text-white' : 'border-gray-300'
              }`}>
                {selectedRole === 'pelajar' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">
                Saya Pelajar / Talenta
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Ingin berkarya, menawarkan jasa keahlian, dan menghasilkan pendapatan tanpa syarat KTP/rekening.
              </p>
            </div>
          </div>

          {/* Card 2: UMKM */}
          <div
            onClick={() => setSelectedRole('umkm')}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
              selectedRole === 'umkm'
                ? 'border-[#FF9B71] shadow-[0_10px_30px_rgba(255,155,113,0.18)] ring-2 ring-[#FFD9CA]'
                : 'border-[#EAEAEA] hover:border-gray-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                selectedRole === 'umkm' ? 'bg-[#FF9B71] text-white' : 'bg-[#FFF1EB] text-[#964825]'
              }`}>
                <Store className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'umkm' ? 'border-[#FF9B71] bg-[#FF9B71] text-white' : 'border-gray-300'
              }`}>
                {selectedRole === 'umkm' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-lg font-bold text-gray-900">
                  Saya Klien / UMKM
                </h2>
                <span className="text-[10px] font-extrabold bg-[#FFF1EB] text-[#964825] px-2 py-0.5 rounded-full">
                  Populer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Ingin merekrut talenta muda, membuat lowongan proyek, dan transaksi aman dengan DP escrow.
              </p>
            </div>
          </div>

          {/* Card 3: Sekolah */}
          <div
            onClick={() => setSelectedRole('sekolah')}
            className={`bg-white rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
              selectedRole === 'sekolah'
                ? 'border-[#FF9B71] shadow-[0_10px_30px_rgba(255,155,113,0.18)] ring-2 ring-[#FFD9CA]'
                : 'border-[#EAEAEA] hover:border-gray-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                selectedRole === 'sekolah' ? 'bg-[#FF9B71] text-white' : 'bg-[#FFF1EB] text-[#964825]'
              }`}>
                <Building2 className="w-7 h-7" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'sekolah' ? 'border-[#FF9B71] bg-[#FF9B71] text-white' : 'border-gray-300'
              }`}>
                {selectedRole === 'sekolah' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">
                Saya Pihak Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Institusi pendidikan yang ingin memverifikasi portofolio siswa aktif & menjalin kemitraan industri.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Action Button (Upwork Style) */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleContinue}
            className="w-full h-13 bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>
              {selectedRole === 'pelajar' && 'Daftar sebagai Pelajar'}
              {selectedRole === 'umkm' && 'Daftar sebagai Klien UMKM'}
              {selectedRole === 'sekolah' && 'Daftar sebagai Institusi Sekolah'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-sm text-gray-500 mt-2 text-center">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#964825] font-bold hover:text-[#FF9B71] transition-colors ml-1">
              Masuk
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <p>© 2026 Mitra Muda Indonesia. Hak Cipta Dilindungi.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/panduan" className="hover:text-gray-600 transition-colors">Panduan Sistem</Link>
          <Link href="/marketplace" className="hover:text-gray-600 transition-colors">Marketplace Jasa</Link>
          <Link href="/syarat-ketentuan" className="hover:text-gray-600 transition-colors">Syarat & Ketentuan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-gray-600 transition-colors">Kebijakan Privasi</Link>
          <Link href="/perlindungan-pelajar" className="hover:text-[#964825] font-semibold transition-colors">Perlindungan Pelajar</Link>
        </div>
      </footer>
    </div>
  )
}
