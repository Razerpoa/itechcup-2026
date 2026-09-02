'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Share2,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  Building2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Zap,
  Camera,
  Paperclip,
  Download,
  FileText
} from 'lucide-react'
import { formatRupiah, formatThousand, parseThousand } from '@/lib/utils'
import { useProjects, syncProjectsWithDB } from '@/lib/projects-store'
import { useAuthUser } from '@/lib/auth-client'
import { useAkadStore, submitLamaran, sendAkadChat, syncAkadWithDB, ChatAttachment } from '@/lib/akad-store'

export default function DetailProyekPage() {
  const params = useParams()
  const id = (params?.id as string) || '1'
  const allProjects = useProjects()
  const user = useAuthUser()
  const akadState = useAkadStore()

  useEffect(() => {
    syncProjectsWithDB()
    syncAkadWithDB()
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [justAppliedToast, setJustAppliedToast] = useState(false)
  const [pesan, setPesan] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)
  const chatImageInputRef = React.useRef<HTMLInputElement>(null)
  const chatFileInputRef = React.useRef<HTMLInputElement>(null)

  const foundProyek = allProjects.find((p) => p.id === id || String(p.id) === String(id))

  const mockProyek = {
    judul: foundProyek?.judul || 'Lowongan Proyek Kemitraan UMKM',
    namaUsaha: foundProyek?.namaUsaha || 'UMKM Mitra Muda',
    lokasi: 'Indonesia',
    rating: 5.0,
    proyekSelesai: 12,
    budgetMin: foundProyek?.budgetMin || 500000,
    budgetMax: foundProyek?.budgetMax || 1500000,
    dpPersen: foundProyek?.dpPersen || 30,
    durasi: foundProyek?.durasi || '7 Hari',
    deadline: foundProyek?.durasi || '7 Hari',
    deskripsi: foundProyek?.keteranganSingkat || 'Kami membutuhkan talenta pelajar bertalenta untuk membantu pengerjaan proyek digital dan kreatif sesuai dengan spesifikasi yang ditentukan.',
    ketentuan: [
      'Pengerjaan sesuai durasi yang disepakati',
      'Revisi maksimal 3 kali per item',
      'Source file & deliverable final diserahkan saat penyelesaian'
    ],
    tags: foundProyek?.tags && foundProyek.tags.length > 0 ? foundProyek.tags : ['Desain Grafis', 'Web Dev'],
    fotoUsaha: foundProyek?.fotoUsaha || '/logo.jpg',
    umkmId: foundProyek?.umkmId
  }

  const [hargaTawar, setHargaTawar] = useState(String(mockProyek.budgetMax))

  const isOwner = user?.role === 'umkm' && (user.namaUsaha === mockProyek.namaUsaha || (mockProyek.umkmId && user.id === mockProyek.umkmId))

  const existingLamaran = akadState.lamaranList.find(
    (l) => (l.proyekId === id || (foundProyek && l.proyekId === foundProyek.id)) && (l.pelajarId === user?.id || l.pelajarId === 'pelajar-active')
  )
  const hasApplied = Boolean(existingLamaran) || justAppliedToast

  const projectChats = akadState.chatMessages.filter((m) => m.proyekId === id || (foundProyek && m.proyekId === foundProyek.id))

  const handleDirectInstantApply = () => {
    const targetUmkmId = foundProyek?.umkmId || 'umkm-default'
    const targetNamaUsaha = foundProyek?.namaUsaha || mockProyek.namaUsaha || 'UMKM Mitra Muda'
    const targetJudul = foundProyek?.judul || mockProyek.judul || 'Lowongan Proyek Kemitraan UMKM'
    const targetBudget = parseThousand(hargaTawar) || foundProyek?.budgetMax || mockProyek.budgetMax || 1000000

    submitLamaran({
      proyekId: id,
      judulProyek: targetJudul,
      umkmId: targetUmkmId,
      namaUsaha: targetNamaUsaha,
      pelajarId: user?.id || 'pelajar-active',
      namaPelajar: user?.nama || 'Rizky Firmansyah (Siswa SMKN 1)',
      sekolahNama: user?.sekolah || 'SMKN 1 Jakarta',
      pesanMotivasi: 'Halo! Saya sangat tertarik dan siap mengerjakan proyek ini sesuai spesifikasi dan deadline dengan standar kualitas terbaik.',
      hargaTawar: targetBudget
    })

    setJustAppliedToast(true)
  }

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault()

    const targetUmkmId = foundProyek?.umkmId || 'umkm-default'
    const targetNamaUsaha = foundProyek?.namaUsaha || mockProyek.namaUsaha || 'UMKM Mitra Muda'
    const targetJudul = foundProyek?.judul || mockProyek.judul || 'Lowongan Proyek Kemitraan UMKM'
    const targetBudget = parseThousand(hargaTawar) || foundProyek?.budgetMax || 1000000

    submitLamaran({
      proyekId: id,
      judulProyek: targetJudul,
      umkmId: targetUmkmId,
      namaUsaha: targetNamaUsaha,
      pelajarId: user?.id || 'pelajar-active',
      namaPelajar: user?.nama || 'Rizky Firmansyah (Siswa SMKN 1)',
      sekolahNama: user?.sekolah || 'SMKN 1 Jakarta',
      pesanMotivasi: pesan || 'Halo! Saya sangat tertarik dan siap mengerjakan brief proyek ini secara optimal sesuai deadline.',
      hargaTawar: targetBudget
    })

    setIsSubmitted(true)
    setJustAppliedToast(true)
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
    if (!chatMessage.trim() && !chatAttachment) return

    const targetUmkmId = foundProyek?.umkmId || 'umkm-default'

    sendAkadChat({
      proyekId: id,
      judulProyek: foundProyek?.judul || 'Lowongan Proyek',
      namaUsaha: foundProyek?.namaUsaha || '',
      senderId: user?.id || 'pelajar-active',
      senderName: user?.nama || (user?.role === 'umkm' ? user?.namaUsaha || 'Pemilik Usaha' : 'Pelajar Siswa'),
      senderRole: user?.role === 'umkm' ? 'umkm' : 'pelajar',
      recipientId: user?.role === 'umkm' ? 'pelajar' : targetUmkmId,
      recipientName: user?.role === 'umkm' ? 'Pelajar Siswa' : foundProyek?.namaUsaha || 'Pemilik Usaha',
      text: chatMessage.trim(),
      attachment: chatAttachment || undefined
    })
    setChatMessage('')
    setChatAttachment(null)
    if (chatImageInputRef.current) chatImageInputRef.current.value = ''
    if (chatFileInputRef.current) chatFileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] flex justify-between items-center px-4 sm:px-8 h-16 shadow-xs">
        <Link href="/marketplace" className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight">Detail Proyek UMKM</h1>
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href)
              alert('Tautan lowongan disalin ke clipboard!')
            }
          }}
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Bagikan"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold text-xl overflow-hidden relative shrink-0">
                  <Image src={mockProyek.fotoUsaha} alt={mockProyek.namaUsaha} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#964825] uppercase tracking-wider">{mockProyek.namaUsaha}</span>
                    <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">{mockProyek.judul}</h2>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {mockProyek.lokasi}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Durasi: {mockProyek.durasi || '7 Hari'}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {mockProyek.tags.map((tag) => (
                  <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA]">
                    {tag}
                  </span>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">Deskripsi Kebutuhan Proyek</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{mockProyek.deskripsi}</p>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">Ketentuan & Syarat Kerja</h3>
                <ul className="space-y-2">
                  {mockProyek.ketentuan.map((k, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#964825] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"></span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <section className="space-y-6">
            <div className="bg-gradient-to-br from-[#FFF1EB] to-[#FFE5D9] rounded-3xl p-6 sm:p-8 border border-[#FFD9CA] shadow-xs space-y-6 sticky top-24">
              <div>
                <span className="text-xs text-[#964825] font-bold uppercase tracking-wider block">Anggaran Disediakan UMKM</span>
                <div className="text-2xl sm:text-3xl font-black text-[#964825] mt-1">
                  {formatRupiah(mockProyek.budgetMax)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[#964825] text-[11px] font-bold border border-[#FFD9CA]">
                    DP {mockProyek.dpPersen}% Escrow Terjamin
                  </span>
                </div>
              </div>

              <div className="border-t border-[#FFD9CA] pt-4 space-y-2.5 text-xs text-[#964825]">
                <div className="flex justify-between">
                  <span>Sistem Rekber Aman</span>
                  <span className="font-bold">Dana Terkunci di Master Escrow</span>
                </div>
                <div className="flex justify-between">
                  <span>Pencairan Siswa</span>
                  <span className="font-bold">100% Langsung ke E-Wallet Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span>Syarat Rekening / KTP</span>
                  <span className="font-bold text-emerald-700">Tanpa KTP & Bank</span>
                </div>
              </div>

              {isOwner ? (
                <Link
                  href="/umkm"
                  className="w-full bg-[#FF9B71] text-white rounded-full font-bold py-3.5 hover:bg-[#F5865A] transition-colors shadow-sm text-center text-sm flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Kelola Proyek di Dashboard</span>
                </Link>
              ) : user?.role === 'umkm' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white/70 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>Mode UMKM Aktif. Anda dapat langsung mencoba mengajukan lamaran simulasi atau membuka dashboard.</span>
                  </div>
                  <button
                    onClick={handleDirectInstantApply}
                    className="w-full bg-[#FF9B71] text-white rounded-full font-bold py-3.5 hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-sm cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Kirim Lamaran Langsung ke UMKM</span>
                  </button>
                  <Link
                    href="/umkm"
                    className="w-full bg-white text-[#964825] border border-[#FFD9CA] rounded-full font-bold py-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Buka Dashboard UMKM</span>
                  </Link>
                </div>
              ) : user?.role === 'sekolah' ? (
                <div className="space-y-2">
                  <div className="p-3 bg-white/70 rounded-2xl border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
                    <Building2 className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <span>Anda login sebagai Pihak Sekolah (Mode Pemantauan Proyek Siswa).</span>
                  </div>
                  <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="w-full bg-[#FF9B71] text-white rounded-full font-bold py-3.5 hover:bg-[#F5865A] transition-colors shadow-sm cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Tanya Mitra UMKM</span>
                  </button>
                </div>
              ) : hasApplied ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Lamaran Anda Berhasil Terkirim!</span>
                      <span className="text-[11px] text-emerald-700">
                        Status:{' '}
                        {existingLamaran?.status === 'ACCEPTED'
                          ? ' Diterima (Akad Aktif)'
                          : existingLamaran?.status === 'REJECTED'
                          ? 'Ditolak'
                          : 'Menunggu Persetujuan UMKM'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/pelajar"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold py-3.5 transition-colors shadow-sm text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Pantau di Dashboard Pelajar</span>
                  </Link>
                  <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="w-full bg-white text-[#964825] border border-[#FFD9CA] rounded-full font-bold py-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Pemilik UMKM</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {user?.role === 'pelajar' && user?.verificationStatus !== 'VERIFIED' && !user?.isVerified ? (
                    <div className="text-center space-y-2">
                      <button
                        disabled
                        className="w-full bg-[#FF9B71] text-white rounded-full font-bold py-3.5 shadow-sm text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                        title="Verifikasi akun terlebih dahulu untuk melamar proyek"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Lamar Langsung (Kirim ke UMKM)</span>
                      </button>
                      <button
                        disabled
                        className="w-full bg-white text-[#964825] border border-[#FFD9CA] rounded-full font-bold py-3 flex items-center justify-center gap-2 text-xs opacity-50 cursor-not-allowed"
                        title="Verifikasi akun terlebih dahulu untuk melamar proyek"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF9B71]" />
                        <span>Kustomisasi Tawaran Harga / Pesan</span>
                      </button>
                      <p className="text-xs text-amber-600 font-medium">Akun Anda perlu diverifikasi sekolah sebelum dapat melamar.</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleDirectInstantApply}
                        className="w-full bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white rounded-full font-bold py-3.5 transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Lamar Langsung (Kirim ke UMKM)</span>
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-white text-[#964825] border border-[#FFD9CA] rounded-full font-bold py-3 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF9B71]" />
                        <span>Kustomisasi Tawaran Harga / Pesan</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="w-full text-gray-600 hover:text-gray-900 font-bold py-2 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Pemilik UMKM Dulu</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsModalOpen(false)
                setIsSubmitted(false)
              }}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Proposal Berhasil Dikirim!</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pengajuan lamaranmu telah diteruskan ke pemilik {mockProyek.namaUsaha}. Pemilik UMKM akan segera mereview tawaranmu di dashboard mereka.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/pelajar"
                    className="w-full py-3 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Buka Dashboard Pelajar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      setIsSubmitted(false)
                    }}
                    className="w-full py-2.5 text-gray-500 font-bold text-xs hover:text-gray-700 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#964825] text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF9B71]" />
                    <span>Proposal Pelajar</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">Ajukan Penawaran Proyek</h3>
                  <p className="text-xs text-gray-500 mt-1">Tawarkan keahlian terbaikmu kepada {mockProyek.namaUsaha}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Harga Penawaran (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatThousand(hargaTawar)}
                      onChange={(e) => setHargaTawar(e.target.value.replace(/\D/g, ''))}
                      placeholder="800.000"
                      className="w-full h-12 bg-[#F5F5F5] rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pesan Singkat & Pengantar Portofolio</label>
                    <button
                      type="button"
                      onClick={() => {
                        const studentName = user?.nama || 'Saya'
                        const school = user?.sekolah || 'siswa vokasi terverifikasi'
                        setPesan(
                          `Halo Bapak/Ibu dari ${mockProyek.namaUsaha}! Perkenalkan, saya ${studentName} (${school}). Saya sangat tertarik dan siap membantu pengerjaan proyek "${mockProyek.judul}". Saya memiliki keterampilan yang relevan dan berkomitmen menyelesaikan pekerjaan secara disiplin, komunikatif, dan sesuai deadline dengan standar kualitas terbaik. Terima kasih atas kesempatannya!`
                        )
                      }}
                      className="text-[11px] font-bold text-[#964825] bg-[#FFF1EB] hover:bg-[#FFD9CA] border border-[#FFD9CA] px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF9B71]" />
                      <span>Template Sopan</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Ceritakan keahlianmu dan bagaimana kamu akan menyelesaikan proyek ini..."
                    className="w-full bg-[#F5F5F5] rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] resize-none"
                    required
                  />
                </div>

                {user?.role === 'pelajar' && user?.verificationStatus !== 'VERIFIED' && !user?.isVerified ? (
                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full h-12 bg-[#FF9B71] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm opacity-50 cursor-not-allowed"
                      title="Verifikasi akun terlebih dahulu untuk melamar proyek"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Lamaran Sekarang</span>
                    </button>
                    <p className="text-xs text-amber-600 font-medium">Akun Anda perlu diverifikasi sekolah sebelum dapat melamar.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Lamaran Sekarang</span>
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold overflow-hidden relative">
                  <Image src={mockProyek.fotoUsaha} alt={mockProyek.namaUsaha} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{mockProyek.namaUsaha}</h3>
                  <p className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Online • Pemilik Proyek</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20proyek%20di%20Mitra%20Muda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  title="Hubungi via WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsChatModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
              {projectChats.length > 0 ? (
                projectChats.map((msg) => {
                  const isMe = msg.senderId === user?.id
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
                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center h-full">
                  <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="font-bold text-gray-600">Belum Ada Percakapan</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Ketik pesan pertama Anda atau lampirkan foto/berkas untuk berdiskusi dengan pemilik UMKM seputar brief pengerjaan.
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
                  placeholder="Tulis pesan untuk pemilik proyek..."
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
