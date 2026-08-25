'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Check, Wallet, Users, MessageSquare, CheckCircle2, FileText, Sparkles, XCircle, ArrowRight, Send, X, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react'
import TwoFactorModal from '@/components/two-factor-modal'
import { formatRupiah, formatRelativeTime, formatDate } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useProjects, syncProjectsWithDB, removeProject } from '@/lib/projects-store'
import { useEscrowStore } from '@/lib/escrow-store'
import { useAkadStore, acceptLamaranAndCreateAkad, rejectLamaran, syncAkadWithDB, sendAkadChat, LamaranItem } from '@/lib/akad-store'

export default function UmkmDashboard() {
  const router = useRouter()
  const user = useAuthUser()
  const allProjects = useProjects()
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()
  const [activeTab, setActiveTab] = useState<'pelamar' | 'berjalan' | 'riwayat'>('berjalan')
  const [chatLamaran, setChatLamaran] = useState<LamaranItem | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)

  useEffect(() => {
    syncProjectsWithDB()
    syncAkadWithDB()

    const interval = setInterval(() => {
      syncAkadWithDB()
      syncProjectsWithDB()
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const umkmId = user?.id || 'umkm-default'
  const namaUsaha = user?.namaUsaha || 'Usaha UMKM Anda'
  const saldoAktif = escrowState.umkmBalances[umkmId] || 0

  const isDemoUmkm = user?.id === 'umkm-active' || user?.email === 'umkm@mitramuda.id'

  const myProjects = allProjects.filter((p) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && p.umkmId === user.id
    const matchNama = user?.namaUsaha && p.namaUsaha && p.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const completedProyekIds = new Set(
    akadState.akadList.filter((a) => a.step === 4).map((a) => a.proyekId)
  )

  const activeProjects = myProjects.filter((p) => !completedProyekIds.has(p.id))
  const totalProyek = activeProjects.length

  const incomingLamaran = akadState.lamaranList.filter((l) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && l.umkmId === user.id
    const matchNama = user?.namaUsaha && l.namaUsaha && l.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    const matchProject = myProjects.some((p) => p.id === l.proyekId)
    return Boolean(matchId || matchNama || matchProject)
  })

  const pendingLamaran = incomingLamaran.filter((l) => l.status === 'PENDING')

  const myAkadList = akadState.akadList.filter((a) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && a.umkmId === user.id
    const matchNama = user?.namaUsaha && a.namaUsaha && a.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    const matchProject = myProjects.some((p) => p.id === a.proyekId)
    return Boolean(matchId || matchNama || matchProject)
  })

  const handleAcceptProposal = (lamaranId: string) => {
    const res = acceptLamaranAndCreateAkad(lamaranId)
    if (res.success && res.akad) {
      router.push(`/umkm/transaksi/${res.akad.id}`)
    } else {
      router.push(`/umkm/transaksi/${lamaranId}`)
    }
  }

  const handleRejectProposal = (lamaranId: string) => {
    if (confirm('Tolak lamaran dari siswa ini?')) {
      rejectLamaran(lamaranId)
    }
  }

  const handleDeleteProject = (proyekId: string, judul: string) => {
    if (confirm(`Hapus lowongan proyek "${judul}"? Lowongan akan langsung ditarik dari marketplace.`)) {
      removeProject(proyekId)
    }
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || !chatLamaran) return

    sendAkadChat({
      proyekId: chatLamaran.proyekId,
      senderId: user?.id || 'umkm-default',
      senderName: user?.namaUsaha || user?.nama || 'Pemilik Usaha',
      senderRole: 'umkm',
      recipientId: chatLamaran.pelajarId,
      text: chatMessage.trim()
    })
    setChatMessage('')
  }

  const activeChatMessages = chatLamaran
    ? akadState.chatMessages.filter(
        (m) =>
          m.proyekId === chatLamaran.proyekId ||
          m.proyekId === chatLamaran.id ||
          m.recipientId === chatLamaran.pelajarId ||
          m.senderId === chatLamaran.pelajarId
      )
    : []

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{namaUsaha}</h1>
            <span className="w-5 h-5 rounded-full bg-orange-100 text-[#964825] flex items-center justify-center text-xs font-bold" title="Terverifikasi">
              <Check className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola proyek, pantau pelamar, dan bertransaksi aman dengan sistem DP escrow</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIs2FAModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-bold text-xs hover:bg-[#FFF1EB] hover:text-[#964825] hover:border-[#FFD9CA] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
            <span>2FA Keamanan</span>
          </button>
          {user?.isVerified === false ? (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] font-bold text-xs opacity-50 cursor-not-allowed pointer-events-none"
            >
              <Wallet className="w-4 h-4" />
              <span>Top Up Saldo</span>
            </button>
          ) : (
            <Link
              href="/umkm/deposit"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Top Up Saldo</span>
            </Link>
          )}
          {user?.isVerified === false ? (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF9B71] text-white font-bold text-xs shadow-xs opacity-50 cursor-not-allowed pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Proyek</span>
            </button>
          ) : (
            <Link
              href="/umkm/proyek/buat"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Proyek</span>
            </Link>
          )}
        </div>
      </div>

      {user?.isVerified === false && (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-amber-600 w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-amber-900">Akun UMKM Belum Terverifikasi</h3>
              <p className="text-xs text-amber-700 mt-1">
                Verifikasi oleh admin Mitra Muda sedang dalam proses. Fitur buat proyek dan deposit rekber akan aktif setelah terverifikasi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href="/panduan"
              className="text-xs font-bold bg-amber-600 text-white px-3.5 py-2 rounded-full hover:bg-amber-700 shrink-0"
            >
              Panduan Legalitas
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe5d9] rounded-3xl p-6 border border-[#FFD9CA] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-[#964825] uppercase tracking-wider">Saldo Deposit Rekber</span>
            <Wallet className="w-4 h-4 text-[#FF9B71]" />
          </div>
          <div className="text-2xl font-black text-[#964825] mt-2">{formatRupiah(saldoAktif)}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Proyek Aktif</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalProyek}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Pelamar Masuk</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{pendingLamaran.length}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Riwayat & Akad</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{myAkadList.length}</div>
        </div>
      </div>

      {pendingLamaran.length > 0 && (
        <div className="bg-gradient-to-r from-[#FFF1EB] to-orange-50 rounded-3xl p-6 border border-[#FFD9CA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF9B71] text-white flex items-center justify-center font-black text-sm shrink-0">
              {pendingLamaran.length}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Ada {pendingLamaran.length} Lamaran Siswa Baru Menunggu Konfirmasi!</h3>
              <p className="text-xs text-gray-600 mt-0.5">Siswa telah mengajukan proposal ke proyek lowongan tokomu. Segera review untuk memulai akad.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pelamar')}
            className="px-5 py-2.5 rounded-full bg-[#964825] hover:bg-[#7D3B1E] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <span>Review Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-100 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('berjalan')}
            className={`pb-2 text-xs sm:text-sm font-extrabold transition-all relative shrink-0 ${
              activeTab === 'berjalan' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Proyek Lowongan Anda ({totalProyek})
            {activeTab === 'berjalan' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9B71] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('pelamar')}
            className={`pb-2 text-xs sm:text-sm font-extrabold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pelamar' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Pelamar Masuk</span>
            {pendingLamaran.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FF9B71] text-white text-[11px] font-extrabold flex items-center justify-center">
                {pendingLamaran.length}
              </span>
            )}
            {activeTab === 'pelamar' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9B71] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('riwayat')}
            className={`pb-2 text-xs sm:text-sm font-extrabold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'riwayat' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Riwayat & Akad Transaksi</span>
            {myAkadList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                {myAkadList.length}
              </span>
            )}
            {activeTab === 'riwayat' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9B71] rounded-full" />}
          </button>
        </div>

        {activeTab === 'berjalan' && (
          myProjects.length > 0 ? (
            <div className="space-y-4">
              {myProjects.map((p) => {
                const projectApplicants = pendingLamaran.filter(
                  (l) => l.proyekId === p.id || l.judulProyek.toLowerCase().trim() === p.judul.toLowerCase().trim()
                )
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#FF9B71]/40 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
                          Lowongan Aktif
                        </span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(p.createdAt)}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-gray-900">{p.judul}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.keteranganSingkat}</p>
                      
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => setActiveTab('pelamar')}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1EB] text-[#964825] text-xs font-bold hover:bg-[#FFD9CA] transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{projectApplicants.length} Pelamar Menunggu</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                      <div className="sm:text-right">
                        <span className="text-[11px] text-gray-400 font-semibold block">Anggaran Proyek</span>
                        <span className="text-lg font-extrabold text-[#964825]">{formatRupiah(p.budgetMax)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/marketplace/${p.id}`}
                          className="px-3.5 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors"
                        >
                          Lihat Listing
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.judul)}
                          className="p-1.5 rounded-full border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          title="Hapus Lowongan Proyek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 font-bold">
                <Plus className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Proyek Dibuat</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                Mulai posting kebutuhan pekerjaan tokomu untuk merekrut talenta siswa dengan sistem DP escrow aman.
              </p>
              <Link
                href="/umkm/proyek/buat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Lowongan Proyek Sekarang</span>
              </Link>
            </div>
          )
        )}

        {activeTab === 'pelamar' && (
          pendingLamaran.length > 0 ? (
            <div className="space-y-4">
              {pendingLamaran.map((lamaran) => (
                <div
                  key={lamaran.id}
                  className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#FF9B71]/40 transition-all"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold border bg-amber-50 text-amber-800 border-amber-200">
                        Menunggu Review Anda
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(lamaran.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{lamaran.namaPelajar}</h4>
                      <p className="text-xs text-[#964825] font-semibold">{lamaran.sekolahNama}</p>
                    </div>

                    <div className="bg-[#FAFAFA] p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900 block mb-0.5">Pesan Motivasi Pelajar:</span>
                      &ldquo;{lamaran.pesanMotivasi}&rdquo;
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                    <div className="sm:text-right">
                      <span className="text-[11px] text-gray-400 font-semibold block">Tawaran Harga Siswa</span>
                      <span className="text-lg font-extrabold text-[#964825]">{formatRupiah(lamaran.hargaTawar)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChatLamaran(lamaran)}
                        className="px-3.5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectProposal(lamaran.id)}
                          className="px-3.5 py-2 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Tolak Lamaran"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                        <button
                          onClick={() => handleAcceptProposal(lamaran.id)}
                          className="px-4 py-2 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terima & Buka Akad</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4 font-bold">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Pelamar</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                Saat siswa mengajukan proposal lamaran untuk lowongan proyek toko Anda, daftarnya akan langsung muncul di sini.
              </p>
            </div>
          )
        )}

        {activeTab === 'riwayat' && (
          myAkadList.length > 0 ? (
            <div className="space-y-4">
              {myAkadList.map((akad) => {
                const isDone = akad.step === 4
                return (
                  <div
                    key={akad.id}
                    className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all ${
                      isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-[#EAEAEA] hover:border-[#FF9B71]/40'
                    }`}
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isDone ? '✓ Selesai & Dana Cair' : '• Akad Berjalan'}
                        </span>
                        {isDone && akad.rating && (
                          <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ⭐ {akad.rating}.0
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {akad.completedAt ? formatDate(akad.completedAt) : formatDate(akad.createdAt)}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base text-gray-900">{akad.judulProyek}</h4>
                        <p className="text-xs text-gray-500">
                          Pelaksana: <strong className="text-gray-900">{akad.namaPelajar}</strong> ({akad.sekolahNama || 'Siswa Terverifikasi'})
                        </p>
                      </div>

                      {isDone && akad.ulasan && (
                        <div className="bg-[#FFF1EB] p-3 rounded-2xl border border-[#FFD9CA] text-xs text-[#964825]">
                          <span className="font-bold block mb-0.5">Ulasan Toko Anda:</span>
                          &ldquo;{akad.ulasan}&rdquo;
                        </div>
                      )}

                      {!isDone && akad.deliverables && akad.deliverables.length > 0 && (
                        <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl w-fit">
                          📁 {akad.deliverables.length} Deliverable karya siswa siap ditinjau di ruang akad
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                      <div className="sm:text-right">
                        <span className="text-[11px] text-gray-400 font-semibold block">Total Kontrak</span>
                        <span className="text-lg font-extrabold text-[#964825]">{formatRupiah(akad.nominalTotal)}</span>
                      </div>

                      <Link
                        href={`/umkm/transaksi/${akad.id}`}
                        className={`px-4 py-2 rounded-full font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs ${
                          isDone
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Lihat Arsip Transaksi' : 'Buka Ruang Akad'}</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4 font-bold">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Riwayat Akad</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                Saat proposal pelamar diterima, ruang akad dan riwayat transaksi akan tercatat otomatis di sini.
              </p>
            </div>
          )
        )}
      </section>

      {chatLamaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold text-sm">
                  {chatLamaran.namaPelajar.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{chatLamaran.namaPelajar}</h3>
                  <p className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>{chatLamaran.sekolahNama || 'Siswa Pelajar'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatLamaran(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
              <div className="p-3 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] text-xs text-[#964825]">
                <span className="font-bold block">Pesan Proposal Awal Siswa:</span>
                &ldquo;{chatLamaran.pesanMotivasi}&rdquo;
              </div>

              {activeChatMessages.length > 0 ? (
                activeChatMessages.map((msg) => {
                  const isMe = msg.senderRole === 'umkm'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-gray-500 mb-0.5 px-1">{msg.senderName}</span>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                          isMe
                            ? 'bg-[#FF9B71] text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
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
                  <p className="font-bold text-gray-600">Mulai Obrolan dengan Siswa</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Kirim pesan untuk berdiskusi langsung seputar detail pengerjaan proyek.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-[#EAEAEA] flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Tulis pesan untuk siswa..."
                className="flex-1 h-11 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
              />
              <button
                type="submit"
                className="w-11 h-11 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
      {/* 2FA Modal */}
      <TwoFactorModal
        userId={user?.id || 'umkm-active'}
        userName={namaUsaha}
        userRole="umkm"
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  )
}
