'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Info,
  Copy,
  Share2,
  Star,
  Send,
  X,
  MessageCircle,
  Camera,
  Paperclip,
  Download,
  FileText
} from 'lucide-react'
import { formatRupiah, formatDate, formatRelativeTime } from '@/lib/utils'
import { useAuthUser, useRealtimeVerificationSync, setCurrentUser } from '@/lib/auth-client'
import { useEscrowStore, syncEscrowWithDB } from '@/lib/escrow-store'
import { useAkadStore, syncAkadWithDB, sendAkadChat, ChatAttachment } from '@/lib/akad-store'
import { useJasaStore } from '@/lib/jasa-store'

interface StudentChatThread {
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
}

export default function PelajarDashboard() {
  const user = useAuthUser()
  useRealtimeVerificationSync()
  const [copiedRegId, setCopiedRegId] = useState(false)
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()
  const jasaList = useJasaStore()

  const [activeChatThread, setActiveChatThread] = useState<StudentChatThread | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)
  const chatImageInputRef = React.useRef<HTMLInputElement>(null)
  const chatFileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    syncAkadWithDB()
    syncEscrowWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
      syncEscrowWithDB()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchPelajarProfile() {
      if (!user) return
      if (user.sekolah && user.nama) return

      try {
        const res = await fetch('/api/pelajar')
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          const match = json.data.find(
            (p: any) =>
              (user.id && p.id === user.id) ||
              (user.email && p.email.toLowerCase() === user.email.toLowerCase())
          )
          if (match) {
            setCurrentUser({
              ...user,
              nama: match.namaLengkap || user.nama,
              sekolah: match.sekolah?.namaSekolah || match.kelas || user.sekolah,
              nisn: match.nis || user.nisn,
              registrationId: match.nis || user.registrationId,
              isVerified: match.verificationStatus === 'VERIFIED',
              verificationStatus: match.verificationStatus || user.verificationStatus
            })
          }
        }
      } catch {
      }
    }

    fetchPelajarProfile()
  }, [user?.id, user?.email, user?.sekolah, user?.nama])

  const isDemoPelajar = user?.id === 'pelajar-active' || user?.email === 'pelajar.google@gmail.com'
  const pelajarId = user?.id || 'pelajar-default'
  const namaSiswa = user?.nama || 'Pelajar Mitra Muda'

  const myJasaList = jasaList.filter((j) => {
    if (!user?.id && !user?.nama) return false
    const matchId = user?.id && j.pelajarId === user.id
    const matchNama =
      user?.nama &&
      j.namaPelajar &&
      j.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const isVerifiedAccount = Boolean(
    user?.isVerified || user?.verificationStatus === 'VERIFIED'
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
    const matchNama =
      user?.nama &&
      a.namaPelajar &&
      a.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const ongoingAkad = myAkadList.filter((a) => a.step < 4)
  const completedAkad = myAkadList.filter((a) => a.step === 4)

  const myLamaranList = akadState.lamaranList.filter((l) => {
    if (isDemoPelajar) return true
    if (!user?.id && !user?.nama) return false
    const matchId = user?.id && l.pelajarId === user.id
    const matchNama =
      user?.nama &&
      l.namaPelajar &&
      l.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const pendingLamaran = myLamaranList.filter((l) => l.status === 'PENDING')

  const completedEarnings = completedAkad.reduce((acc, a) => acc + (a.nominalTotal || 500000), 0)
  const myWithdrawals = escrowState.withdrawals.filter(
    (w) => w.pelajarId === pelajarId || (isDemoPelajar && w.pelajarId === 'pelajar-active')
  )
  const totalWithdrawn = myWithdrawals
    .filter((w) => w.status !== 'REJECTED')
    .reduce((acc, curr) => acc + curr.nominal, 0)
  const directBal = escrowState.pelajarBalances[pelajarId] || 0
  const activeBal = isDemoPelajar ? (escrowState.pelajarBalances['pelajar-active'] || 0) : 0
  const totalPendapatan = Math.max(directBal, activeBal, Math.max(0, completedEarnings - totalWithdrawn))
  const activeEscrowAmount = ongoingAkad.reduce((acc, a) => acc + (a.nominalTotal || 500000), 0)

  const avgRating =
    completedAkad.length > 0
      ? (
          completedAkad.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
          completedAkad.length
        ).toFixed(1)
      : '5.0'

  const handleCopyRegId = () => {
    const textToCopy = user?.registrationId || user?.nisn || 'NIS-REG-2026'
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
      setCopiedRegId(true)
      setTimeout(() => setCopiedRegId(false), 2000)
    }
  }

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMB = file.size / (1024 * 1024)
    const sizeStr = sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      setChatAttachment({
        name: file.name,
        size: sizeStr,
        type: 'image',
        dataUrl: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMB = file.size / (1024 * 1024)
    const sizeStr = sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      setChatAttachment({
        name: file.name,
        size: sizeStr,
        type: 'file',
        dataUrl: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!chatMessage.trim() && !chatAttachment) || !activeChatThread) return

    sendAkadChat({
      proyekId: activeChatThread.proyekId,
      judulProyek: activeChatThread.judulProyek,
      senderId: user?.id || 'pelajar-active',
      senderName: user?.nama || 'Pelajar Siswa',
      senderRole: 'pelajar',
      recipientId: activeChatThread.umkmId || 'umkm-default',
      recipientName: activeChatThread.namaUsaha,
      namaUsaha: activeChatThread.namaUsaha,
      text: chatMessage.trim(),
      attachment: chatAttachment || undefined
    })
    setChatMessage('')
    setChatAttachment(null)
    if (chatImageInputRef.current) chatImageInputRef.current.value = ''
    if (chatFileInputRef.current) chatFileInputRef.current.value = ''
  }

  const activeChatMessages = useMemo(() => {
    if (!activeChatThread) return []
    return akadState.chatMessages.filter(
      (m) =>
        m.proyekId === activeChatThread.proyekId ||
        (m.senderRole === 'umkm' && m.recipientId === (user?.id || 'pelajar-active')) ||
        (m.senderRole === 'pelajar' && m.senderId === (user?.id || 'pelajar-active') && m.proyekId === activeChatThread.proyekId)
    )
  }, [activeChatThread, akadState.chatMessages, user?.id])

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            {isVerifiedAccount ? (
              <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Pelajar Terverifikasi Sekolah ({user?.sekolah || 'SMK Terdaftar'})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Menunggu Konfirmasi Operator Sekolah</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Semangat Pagi, {namaSiswa}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pantau tawaran proyek, ruang akad DP Escrow, dan kelola dompet hasil karyamu di sini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRegId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:border-[#FFD9CA] hover:bg-[#FFF1EB] text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Salin ID Registrasi untuk Sekolah"
          >
            {copiedRegId ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-400" />
                <span>ID: {user?.registrationId || user?.nisn || 'NIS-REG-2026'}</span>
              </>
            )}
          </button>
          <Link
            href={`/profil/${user?.id || 'demo'}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FF9B71] text-white text-xs font-bold hover:bg-[#F5865A] transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Lihat Profil Publik</span>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe5d9] rounded-2xl p-5 sm:p-6 border border-[#FFD9CA] shadow-xs">
          <div className="text-2xl sm:text-3xl font-black text-[#964825] mb-1">
            {formatRupiah(totalPendapatan)}
          </div>
          <div className="text-xs text-[#964825] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>Saldo Dompet Cair</span>
            <Wallet className="w-4 h-4 text-[#FF9B71]" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mb-1">
            {formatRupiah(activeEscrowAmount)}
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dana Terkunci di Escrow</div>
        </div>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1">{myLamaranList.length}</div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lamaran Terkirim</div>
        </div>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs hover:border-[#FF9B71] transition-colors">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mb-1 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>{avgRating}</span>
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
                  <button
                    onClick={() =>
                      setActiveChatThread({
                        proyekId: lamaran.proyekId,
                        judulProyek: lamaran.judulProyek,
                        umkmId: lamaran.umkmId,
                        namaUsaha: lamaran.namaUsaha
                      })
                    }
                    className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF9B71]" />
                    <span>Chat UMKM</span>
                  </button>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActiveChatThread({
                        proyekId: akad.proyekId,
                        judulProyek: akad.judulProyek,
                        umkmId: akad.umkmId,
                        namaUsaha: akad.namaUsaha
                      })
                    }
                    className="px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#FF9B71]" />
                    <span>Chat Klien</span>
                  </button>
                  <Link
                    href={`/pelajar/transaksi/${akad.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Buka Ruang Akad & Kirim Karya</span>
                  </Link>
                </div>
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
                      Selesai & Dana Cair
                    </span>
                    <span className="text-xs text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {akad.rating || 5}.0
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
                    <span className="text-[11px] text-gray-400 font-semibold block">Total Diterima Siswa</span>
                    <span className="text-lg font-extrabold text-emerald-600">{formatRupiah(akad.nominalTotal)}</span>
                  </div>

                  <Link
                    href={`/pelajar/transaksi/${akad.id}`}
                    className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Lihat Sertifikat & Riwayat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {activeChatThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold text-sm">
                  {activeChatThread.namaUsaha.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{activeChatThread.namaUsaha}</h3>
                  <p className="text-[11px] text-[#964825] font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{activeChatThread.judulProyek}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveChatThread(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
              {activeChatMessages.length > 0 ? (
                activeChatMessages.map((msg) => {
                  const isMe = msg.senderRole === 'pelajar'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-gray-500 mb-0.5 px-1">{msg.senderName}</span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed ${
                          isMe
                            ? 'bg-[#FF9B71] text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.attachment && (
                          <div className="mb-2">
                            {msg.attachment.type === 'image' && msg.attachment.dataUrl ? (
                              <div
                                onClick={() => setSelectedPreviewImage(msg.attachment?.dataUrl || null)}
                                className="rounded-xl overflow-hidden cursor-pointer relative max-w-xs border border-black/10 hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={msg.attachment.dataUrl}
                                  alt={msg.attachment.name}
                                  className="max-h-52 w-full object-cover rounded-xl"
                                />
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md">
                                  {msg.attachment.size}
                                </div>
                              </div>
                            ) : (
                              <div className={`p-2 rounded-xl border flex items-center justify-between gap-3 ${
                                isMe ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                              }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-xs truncate">{msg.attachment.name}</p>
                                    <p className="text-[10px] opacity-80">{msg.attachment.size}</p>
                                  </div>
                                </div>
                                {msg.attachment.dataUrl && (
                                  <a
                                    href={msg.attachment.dataUrl}
                                    download={msg.attachment.name}
                                    className={`p-1 rounded-lg shrink-0 ${
                                      isMe ? 'bg-white/30 hover:bg-white/40 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                                    title="Unduh Berkas"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-gray-400 text-xs flex flex-col items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="font-bold text-gray-600">Mulai Obrolan dengan Klien UMKM</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Diskusikan ide karya, kirim foto/dokumen, atau tanyakan detail proyek langsung kepada pemilik usaha.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-[#EAEAEA] flex flex-col gap-2">
              {chatAttachment && (
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {chatAttachment.type === 'image' && chatAttachment.dataUrl ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-gray-300 shrink-0">
                        <img src={chatAttachment.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText className="w-4 h-4 text-[#964825] shrink-0" />
                    )}
                    <p className="font-bold text-xs text-gray-900 truncate">{chatAttachment.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setChatAttachment(null)
                      if (chatImageInputRef.current) chatImageInputRef.current.value = ''
                      if (chatFileInputRef.current) chatFileInputRef.current.value = ''
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendChat} className="flex items-center gap-1.5">
                <input
                  type="file"
                  ref={chatImageInputRef}
                  onChange={handleChatImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleChatFileSelect}
                  accept="*/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => chatImageInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Pilih Foto dari Galeri / Kamera"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Pilih Berkas dari Folder"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Tulis pesan untuk UMKM..."
                  className="flex-1 h-10 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() && !chatAttachment}
                  className="w-10 h-10 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedPreviewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-extrabold text-sm text-gray-900">Pratinjau Foto</h4>
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={selectedPreviewImage}
                alt="Preview"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
