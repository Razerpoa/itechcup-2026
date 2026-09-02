'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Check,
  Wallet,
  Users,
  MessageSquare,
  CheckCircle2,
  FileText,
  Sparkles,
  XCircle,
  ArrowRight,
  Send,
  X,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Star,
  Folder,
  MessageCircle,
  Clock,
  Camera,
  Paperclip,
  Download
} from 'lucide-react'
import TwoFactorModal from '@/components/two-factor-modal'
import { formatRupiah, formatRelativeTime, formatDate } from '@/lib/utils'
import { useAuthUser, useRealtimeVerificationSync, setCurrentUser } from '@/lib/auth-client'
import { useProjects, syncProjectsWithDB, removeProject } from '@/lib/projects-store'
import { useEscrowStore } from '@/lib/escrow-store'
import {
  useAkadStore,
  acceptLamaranAndCreateAkad,
  rejectLamaran,
  syncAkadWithDB,
  sendAkadChat,
  LamaranItem,
  ChatMsgItem,
  ChatAttachment
} from '@/lib/akad-store'

interface ActiveChatThread {
  proyekId: string
  judulProyek: string
  pelajarId: string
  namaPelajar: string
  sekolahNama?: string
  initialNote?: string
}

export default function UmkmDashboard() {
  const router = useRouter()
  const user = useAuthUser()
  useRealtimeVerificationSync()
  const allProjects = useProjects()
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()
  const [activeTab, setActiveTab] = useState<'berjalan' | 'pelamar' | 'pesan' | 'riwayat'>('berjalan')
  const [activeThread, setActiveThread] = useState<ActiveChatThread | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)
  const chatImageInputRef = React.useRef<HTMLInputElement>(null)
  const chatFileInputRef = React.useRef<HTMLInputElement>(null)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)

  useEffect(() => {
    async function fetchUmkmProfile() {
      if (!user) return
      if (user.namaUsaha && user.nama) return

      try {
        const res = await fetch('/api/umkm')
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          const match = json.data.find(
            (u: any) =>
              (user.id && u.id === user.id) ||
              (user.email && u.email.toLowerCase() === user.email.toLowerCase())
          )
          if (match) {
            setCurrentUser({
              ...user,
              namaUsaha: match.namaUsaha || user.namaUsaha,
              nama: match.namaPemilik || user.nama,
              nomorWa: match.nomorWa || user.nomorWa,
              isVerified: Boolean(match.isVerified)
            })
          }
        }
      } catch {
      }
    }

    fetchUmkmProfile()
  }, [user?.id, user?.email, user?.namaUsaha, user?.nama])

  useEffect(() => {
    syncProjectsWithDB()
    syncAkadWithDB()

    const interval = setInterval(() => {
      syncAkadWithDB()
      syncProjectsWithDB()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const umkmId = user?.id || 'umkm-default'
  const namaUsaha = user?.namaUsaha || 'Usaha UMKM Anda'
  const saldoAktif = escrowState.umkmBalances[umkmId] || 0

  const myProjects = allProjects.filter((p) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && p.umkmId === user.id
    const matchNama =
      user?.namaUsaha &&
      p.namaUsaha &&
      p.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    return Boolean(matchId || matchNama)
  })

  const myProjectIds = useMemo(() => new Set(myProjects.map((p) => p.id)), [myProjects])

  const completedProyekIds = new Set(
    akadState.akadList.filter((a) => a.step === 4).map((a) => a.proyekId)
  )

  const activeProjects = myProjects.filter((p) => !completedProyekIds.has(p.id))
  const totalProyek = activeProjects.length

  const incomingLamaran = akadState.lamaranList.filter((l) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && l.umkmId === user.id
    const matchNama =
      user?.namaUsaha &&
      l.namaUsaha &&
      l.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    const matchProject = myProjects.some((p) => p.id === l.proyekId)
    return Boolean(matchId || matchNama || matchProject)
  })

  const pendingLamaran = incomingLamaran.filter((l) => l.status === 'PENDING')

  const myAkadList = akadState.akadList.filter((a) => {
    if (!user?.id && !user?.namaUsaha) return false
    const matchId = user?.id && a.umkmId === user.id
    const matchNama =
      user?.namaUsaha &&
      a.namaUsaha &&
      a.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
    const matchProject = myProjects.some((p) => p.id === a.proyekId)
    return Boolean(matchId || matchNama || matchProject)
  })

  const relevantChats = useMemo(() => {
    return akadState.chatMessages.filter((m) => {
      if (myProjectIds.has(m.proyekId)) return true
      if (user?.id && (m.recipientId === user.id || m.recipientId === 'umkm-default')) return true
      if (
        user?.namaUsaha &&
        m.namaUsaha &&
        m.namaUsaha.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
      )
        return true
      if (
        user?.namaUsaha &&
        m.recipientName &&
        m.recipientName.toLowerCase().trim() === user.namaUsaha.toLowerCase().trim()
      )
        return true
      return false
    })
  }, [akadState.chatMessages, myProjectIds, user?.id, user?.namaUsaha])

  const chatThreads = useMemo(() => {
    const threadMap = new Map<string, {
      threadKey: string
      proyekId: string
      judulProyek: string
      pelajarId: string
      namaPelajar: string
      sekolahNama?: string
      lastMessage: string
      lastTime: string
      messageCount: number
    }>()

    for (const msg of relevantChats) {
      const isStudentSender = msg.senderRole === 'pelajar'
      const studentId = isStudentSender ? msg.senderId : msg.recipientId
      const studentName = isStudentSender ? msg.senderName : msg.recipientName || 'Pelajar Siswa'
      const key = `${msg.proyekId}-${studentId}`

      const current = threadMap.get(key)
      if (!current) {
        const foundProj = myProjects.find((p) => p.id === msg.proyekId)
        threadMap.set(key, {
          threadKey: key,
          proyekId: msg.proyekId,
          judulProyek: msg.judulProyek || foundProj?.judul || 'Lowongan Proyek',
          pelajarId: studentId,
          namaPelajar: studentName,
          sekolahNama: 'Siswa Mitra Muda',
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          messageCount: 1
        })
      } else {
        current.lastMessage = msg.text
        current.lastTime = msg.createdAt
        current.messageCount += 1
      }
    }

    return Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
    )
  }, [relevantChats, myProjects])

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
    if ((!chatMessage.trim() && !chatAttachment) || !activeThread) return

    sendAkadChat({
      proyekId: activeThread.proyekId,
      judulProyek: activeThread.judulProyek,
      senderId: user?.id || 'umkm-default',
      senderName: user?.namaUsaha || user?.nama || 'Pemilik Usaha',
      senderRole: 'umkm',
      recipientId: activeThread.pelajarId,
      recipientName: activeThread.namaPelajar,
      namaUsaha: user?.namaUsaha || '',
      text: chatMessage.trim(),
      attachment: chatAttachment || undefined
    })
    setChatMessage('')
    setChatAttachment(null)
    if (chatImageInputRef.current) chatImageInputRef.current.value = ''
    if (chatFileInputRef.current) chatFileInputRef.current.value = ''
  }

  const activeChatMessages = useMemo(() => {
    if (!activeThread) return []
    return akadState.chatMessages.filter(
      (m) =>
        m.proyekId === activeThread.proyekId &&
        (m.senderId === activeThread.pelajarId || m.recipientId === activeThread.pelajarId)
    )
  }, [activeThread, akadState.chatMessages])

  const isVerified = user?.isVerified === true

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            {isVerified ? (
              <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Mitra Usaha UMKM Terverifikasi</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Menunggu Verifikasi Dokumen Usaha</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang, {user?.nama || user?.namaPemilik || namaUsaha}!
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-bold text-[#964825] bg-[#FFF1EB] border border-[#FFD9CA] px-2.5 py-0.5 rounded-full">
              {namaUsaha}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">• Kelola proyek, pantau pelamar siswa, dan transaksi aman via Escrow</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIs2FAModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-bold text-xs hover:bg-[#FFF1EB] hover:text-[#964825] hover:border-[#FFD9CA] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
            <span>2FA Keamanan</span>
          </button>
          {!isVerified ? (
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
          {!isVerified ? (
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

      {!isVerified && (
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
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Pesan Diskusi</span>
            <MessageSquare className="w-4 h-4 text-[#FF9B71]" />
          </div>
          <div className="text-2xl font-black text-[#964825] mt-2">{chatThreads.length}</div>
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
            onClick={() => setActiveTab('pesan')}
            className={`pb-2 text-xs sm:text-sm font-extrabold transition-all relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pesan' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Pesan & Diskusi Siswa</span>
            {chatThreads.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FFF1EB] text-[#964825] text-[10px] font-extrabold border border-[#FFD9CA]">
                {chatThreads.length}
              </span>
            )}
            {activeTab === 'pesan' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9B71] rounded-full" />}
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
                const projectChats = chatThreads.filter((t) => t.proyekId === p.id)
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
                      
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          onClick={() => setActiveTab('pelamar')}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1EB] text-[#964825] text-xs font-bold hover:bg-[#FFD9CA] transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{projectApplicants.length} Pelamar Menunggu</span>
                        </button>
                        {projectChats.length > 0 && (
                          <button
                            onClick={() => setActiveTab('pesan')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{projectChats.length} Diskusi Chat Masuk</span>
                          </button>
                        )}
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
                      <span className="font-bold text-gray-900 block mb-0.5">Pesan Proposal Awal Siswa:</span>
                      &ldquo;{lamaran.pesanMotivasi}&rdquo;
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span>Proyek: <strong className="text-gray-900">{lamaran.judulProyek}</strong></span>
                      <span>Tawaran Biaya: <strong className="text-[#964825] font-bold">{formatRupiah(lamaran.hargaTawar)}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActiveThread({
                            proyekId: lamaran.proyekId,
                            judulProyek: lamaran.judulProyek,
                            pelajarId: lamaran.pelajarId,
                            namaPelajar: lamaran.namaPelajar,
                            sekolahNama: lamaran.sekolahNama,
                            initialNote: lamaran.pesanMotivasi
                          })
                        }
                        className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#FF9B71]" />
                        <span>Chat & Diskusi</span>
                      </button>
                      <button
                        onClick={() => handleRejectProposal(lamaran.id)}
                        className="px-3 py-2 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>

                    <button
                      onClick={() => handleAcceptProposal(lamaran.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Terima & Buka Akad DP</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 font-bold">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Pelamar Baru</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Saat siswa mengajukan proposal ke lowongan proyek tokomu, data pelamar akan muncul di sini untuk kamu review.
              </p>
            </div>
          )
        )}

        {activeTab === 'pesan' && (
          chatThreads.length > 0 ? (
            <div className="space-y-4">
              {chatThreads.map((thread) => (
                <div
                  key={thread.threadKey}
                  className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FF9B71]/40 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-extrabold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-600" />
                        <span>Diskusi Siswa Marketplace</span>
                      </span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(thread.lastTime)}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{thread.namaPelajar}</h4>
                      <p className="text-xs text-[#964825] font-semibold">Proyek: {thread.judulProyek}</p>
                    </div>

                    <div className="bg-[#FAFAFA] p-3 rounded-2xl border border-gray-100 text-xs text-gray-700 line-clamp-2">
                      <span className="font-bold text-gray-900">Pesan Terakhir: </span>
                      &ldquo;{thread.lastMessage}&rdquo;
                    </div>
                  </div>

                  <div className="flex items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                    <button
                      onClick={() =>
                        setActiveThread({
                          proyekId: thread.proyekId,
                          judulProyek: thread.judulProyek,
                          pelajarId: thread.pelajarId,
                          namaPelajar: thread.namaPelajar,
                          sekolahNama: thread.sekolahNama
                        })
                      }
                      className="px-5 py-2.5 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Buka Chat & Balas Pesan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 font-bold">
                <MessageSquare className="w-8 h-8 text-[#FF9B71]" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Pesan Masuk</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Saat siswa bertanya atau mengirim pesan seputar lowongan proyek dari marketplace, seluruh diskusi akan terkumpul rapi di sini dan Anda dapat langsung membalasnya.
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
                    className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#FF9B71]/40 transition-all"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isDone ? 'Selesai & Dana Cair' : 'Akad Berjalan'}
                        </span>
                        {isDone && akad.rating && (
                          <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {akad.rating}.0
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
                        <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl w-fit inline-flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{akad.deliverables.length} Deliverable karya siswa siap ditinjau di ruang akad</span>
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

      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative overflow-hidden flex flex-col h-[540px] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold text-sm">
                  {activeThread.namaPelajar.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{activeThread.namaPelajar}</h3>
                  <p className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>{activeThread.judulProyek}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveThread(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
              {activeThread.initialNote && (
                <div className="p-3 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] text-xs text-[#964825]">
                  <span className="font-bold block">Pesan Proposal Awal Siswa:</span>
                  &ldquo;{activeThread.initialNote}&rdquo;
                </div>
              )}

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
                  <p className="font-bold text-gray-600">Mulai Obrolan dengan Siswa</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Kirim pesan, bagikan foto/dokumen, atau diskusikan langsung seputar detail pengerjaan proyek.
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
                  placeholder="Tulis balasan pesan untuk siswa..."
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
