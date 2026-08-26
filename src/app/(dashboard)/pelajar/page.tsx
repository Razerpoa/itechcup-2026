'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Wallet,
  Sparkles,
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Clock,
  MessageSquare,
  CheckCircle2,
  Info
} from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { useAuthUser, useRealtimeVerificationSync } from '@/lib/auth-client'
import { useEscrowStore } from '@/lib/escrow-store'
import { useAkadStore, syncAkadWithDB } from '@/lib/akad-store'
import { useJasaStore } from '@/lib/jasa-store'

export default function PelajarDashboard() {
  const user = useAuthUser()
  useRealtimeVerificationSync()
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()
  const jasaList = useJasaStore()

  const isDemoPelajar = user?.id === 'pelajar-active' || user?.email === 'pelajar.google@gmail.com'
  const pelajarId = user?.id || 'pelajar-default'
  const namaSiswa = user?.nama || 'Pelajar Mitra Muda'

  const myJasaList = jasaList.filter((j) => {
    if (!user?.id && !user?.nama) return false
    const matchId = user?.id && j.pelajarId === user.id
    const matchNama = user?.nama && j.namaPelajar && j.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const isVerifiedAccount = Boolean(
    user?.isVerified ||
    user?.verificationStatus === 'VERIFIED'
  )

  useEffect(() => {
    syncAkadWithDB()

    const interval = setInterval(() => {
      syncAkadWithDB()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const myAkadList = akadState.akadList.filter((a) => {
    if (isDemoPelajar) return true
    if (!user?.id && !user?.nama) return false
    const matchId = user?.id && a.pelajarId === user.id
    const matchNama = user?.nama && a.namaPelajar && a.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const ongoingAkad = myAkadList.filter((a) => a.step < 4)
  const completedAkad = myAkadList.filter((a) => a.step === 4)

  const myLamaranList = akadState.lamaranList.filter((l) => {
    if (isDemoPelajar) return true
    if (!user?.id && !user?.nama) return false
    const matchId = user?.id && l.pelajarId === user.id
    const matchNama = user?.nama && l.namaPelajar && l.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const pendingLamaran = myLamaranList.filter((l) => l.status === 'PENDING')

  const walletBalance = escrowState.pelajarBalances[pelajarId]
  const totalPendapatan = typeof walletBalance === 'number' ? walletBalance : (user?.totalPendapatan || 0)
  const proyekBerjalan = ongoingAkad.length
  const avgRating = completedAkad.length > 0
    ? (completedAkad.reduce((acc, a) => acc + (a.rating || 5), 0) / completedAkad.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            {isVerifiedAccount ? (
              <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Akun Talenta Pelajar Terverifikasi</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Menunggu Verifikasi Sekolah ({user?.sekolah || 'Sekolah Terdaftar'})</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang, {namaSiswa}!
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Mulai eksplorasi peluang proyek UMKM, kembangkan portofolio, dan hasilkan karya nyata.
          </p>
        </div>
        <Link
          href="/marketplace"
          className="bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors w-fit shadow-xs"
        >
          <Store className="w-4 h-4" />
          <span>Cari Proyek Baru</span>
        </Link>
      </div>

      {!isVerifiedAccount && user && (
        <div className="border border-blue-200 bg-blue-50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-blue-900">Akun Menunggu Verifikasi Sekolah</h3>
              <p className="text-xs text-blue-700 mt-1">
                Verifikasi sekolah memastikan keaslian status pelajar (tanpa perlu KTP/bank). Sekolah Anda or Admin Mitra Muda dapat menyetujui akun Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href="/panduan"
              className="text-xs font-bold bg-blue-600 text-white px-3.5 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Panduan Verifikasi
            </Link>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/pelajar/dompet" className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe5d9] rounded-2xl p-5 sm:p-6 border border-[#FFD9CA] shadow-xs hover:border-[#FF9B71] transition-all group">
          <div className="flex items-center justify-between mb-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#964825]">{formatRupiah(totalPendapatan)}</div>
            <Wallet className="w-4 h-4 text-[#FF9B71] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xs text-[#964825] font-bold uppercase tracking-wider">Saldo Dompet Siswa</div>
        </Link>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#964825] mb-1">{proyekBerjalan}</div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Proyek Berjalan</div>
        </div>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1">{myLamaranList.length}</div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lamaran Terkirim</div>
        </div>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mb-1 flex items-center gap-1">
            <span>⭐ {avgRating}</span>
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {completedAkad.length > 0 ? `${completedAkad.length} Proyek Selesai` : 'Belum Ada Ulasan'}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/marketplace" className="bg-[#FF9B71] text-white rounded-2xl p-6 border border-transparent hover:bg-[#F5865A] transition-colors flex flex-col items-center justify-center gap-2 text-center h-full shadow-xs">
          <Store className="w-8 h-8" />
          <span className="font-bold text-sm">Lihat Marketplace Proyek</span>
        </Link>
        <Link href="/pelajar/jasa/buat" className="bg-[#FFF1EB] text-[#964825] rounded-2xl p-6 border border-[#FFD9CA] hover:bg-[#FFD9CA] transition-colors flex flex-col items-center justify-center gap-2 text-center h-full shadow-xs">
          <Plus className="w-8 h-8 text-[#FF9B71]" />
          <span className="font-bold text-sm">Buat Listing Jasa Pelajar</span>
        </Link>
        <Link href="/pelajar/dompet" className="bg-white text-[#964825] rounded-2xl p-6 border border-[#EAEAEA] hover:border-[#FFD9CA] transition-colors flex flex-col items-center justify-center gap-2 text-center h-full shadow-xs">
          <Wallet className="w-8 h-8 text-gray-500" />
          <span className="font-bold text-sm">Dompet & Tarik Saldo</span>
        </Link>
      </section>

      {pendingLamaran.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Lamaran Menunggu Konfirmasi UMKM</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                {pendingLamaran.length} Menunggu
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            {pendingLamaran.map((lamaran) => (
              <div
                key={lamaran.id}
                className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FF9B71]/50 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Menunggu Respon UMKM</span>
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(lamaran.createdAt)}</span>
                  </div>
                  <h4 className="font-extrabold text-lg text-gray-900">{lamaran.judulProyek}</h4>
                  <p className="text-xs text-gray-500">
                    Ditujukan ke: <strong className="text-gray-900">{lamaran.namaUsaha}</strong> • Tawaran Anda:{' '}
                    <strong className="text-[#964825]">{formatRupiah(lamaran.hargaTawar)}</strong>
                  </p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic line-clamp-2">
                    &ldquo;{lamaran.pesanMotivasi}&rdquo;
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                  <Link
                    href={`/marketplace/${lamaran.proyekId}`}
                    className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat UMKM</span>
                  </Link>
                  <Link
                    href={`/marketplace/${lamaran.proyekId}`}
                    className="px-4 py-2 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
                  >
                    Lihat Proyek
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <span>Proyek Aktif Saya (Akad Berjalan)</span>
          {ongoingAkad.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              {ongoingAkad.length} Aktif
            </span>
          )}
        </h3>

        {ongoingAkad.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">
              Belum Ada Akad Aktif
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Saat pemilik UMKM menerima proposal lamaranmu, ruang akad kesepakatan akan otomatis terbentuk di sini.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
            >
              <span>Jelajahi Lowongan di Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ongoingAkad.map((akad) => (
              <div key={akad.id} className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Akad Berjalan (DP Escrow Aman)</span>
                    </span>
                    <span className="text-xs text-gray-400">Penyelenggara: {akad.namaUsaha}</span>
                  </div>
                  <h4 className="font-extrabold text-lg text-gray-900">{akad.judulProyek}</h4>
                  <p className="text-xs text-gray-500">Nilai Kontrak: <strong className="text-[#964825]">{formatRupiah(akad.nominalTotal)}</strong></p>
                </div>
                <Link
                  href={`/pelajar/transaksi/${akad.id}`}
                  className="px-5 py-2.5 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Buka Ruang Akad & Kirim Karya</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {completedAkad.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Riwayat Proyek Selesai & Testimoni Klien</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                {completedAkad.length} Selesai
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            {completedAkad.map((akad) => (
              <div
                key={akad.id}
                className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
                      ✓ Selesai & Dana Cair
                    </span>
                    <span className="text-xs text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ⭐ {akad.rating || 5}.0
                    </span>
                    <span className="text-xs text-gray-400">
                      {akad.completedAt ? formatDate(akad.completedAt) : formatDate(akad.createdAt)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-gray-900">{akad.judulProyek}</h4>
                  <p className="text-xs text-gray-500">
                    Klien: <strong className="text-gray-900">{akad.namaUsaha}</strong>
                  </p>

                  <div className="bg-[#FFF1EB] p-3.5 rounded-2xl border border-[#FFD9CA] text-xs text-[#964825] leading-relaxed">
                    <span className="font-bold block mb-0.5">Ulasan dari {akad.namaUsaha}:</span>
                    &ldquo;{akad.ulasan || 'Pekerjaan diselesaikan dengan sangat baik sesuai spesifikasi.'}&rdquo;
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                  <div className="sm:text-right">
                    <span className="text-[11px] text-gray-400 font-semibold block">Pendapatan Diterima</span>
                    <span className="text-lg font-extrabold text-emerald-600">+{formatRupiah(akad.nominalTotal)}</span>
                  </div>
                  <Link
                    href={`/pelajar/transaksi/${akad.id}`}
                    className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Lihat Bukti Akad</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section: Katalog Jasa Saya */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Katalog Jasa Keahlian Saya</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#964825] text-xs font-extrabold border border-[#FFD9CA]">
              {myJasaList.length} Jasa Tayang
            </span>
          </h3>
          <Link
            href="/pelajar/jasa/buat"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Jasa Baru</span>
          </Link>
        </div>

        {myJasaList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto border border-[#FFD9CA]">
              <Store className="w-7 h-7 text-[#FF9B71]" />
            </div>
            <h4 className="font-extrabold text-base text-gray-900">Belum Ada Listing Jasa</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Tampilkan keahlianmu (desain, web dev, video editor) di Marketplace agar pemilik UMKM bisa langsung memesan jasamu!
            </p>
            <Link
              href="/pelajar/jasa/buat"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#964825] text-white rounded-full font-bold text-xs hover:bg-[#7a391c] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publikasikan Jasa Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJasaList.map((jasa) => (
              <div key={jasa.id} className="bg-white rounded-3xl p-5 border border-[#EAEAEA] shadow-xs flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative shrink-0 bg-gray-100 border border-gray-200">
                  <Image src={jasa.foto || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop'} alt={jasa.judul} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold bg-[#FFF1EB] text-[#964825] px-2 py-0.5 rounded-full border border-[#FFD9CA]">
                    {jasa.kategori}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 truncate mt-1">{jasa.judul}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{jasa.keteranganSingkat}</p>
                  <p className="text-xs font-extrabold text-[#964825] mt-1">{formatRupiah(jasa.hargaBasic)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
