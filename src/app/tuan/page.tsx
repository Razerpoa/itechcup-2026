'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu, X, Search, LogOut, ExternalLink, Activity, 
  Building2, Store, Wallet, ArrowUpRight, 
  ShieldAlert, AlertTriangle, CheckCircle2, 
  GraduationCap, MessageCircle, ShieldCheck
} from 'lucide-react'
import TwoFactorModal from '@/components/two-factor-modal'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  useEscrowStore,
  syncEscrowWithDB,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  releaseProjectCompletionToPelajar
} from '@/lib/escrow-store'
import {
  useAdminVerifications,
  syncAdminUsersFromDB,
  adminVerifyPelajar,
  adminRejectPelajar,
  adminVerifySekolah,
  adminRejectSekolah,
  adminVerifyUMKM,
  adminRevokeUMKM
} from '@/lib/admin-verification-store'

export default function MasterAdminEscrowPage() {
  const router = useRouter()
  const escrowState = useEscrowStore()
  const adminVerifs = useAdminVerifications()

  const [activeTab, setActiveTab] = useState<'overview' | 'pelajar' | 'sekolah' | 'umkm' | 'deposits' | 'withdrawals' | 'escrows'>('overview')
  const [selectedProofImg, setSelectedProofImg] = useState<{ url: string; title: string } | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('mitra_muda_admin_logged_in')
      const sessionTime = localStorage.getItem('mitra_muda_admin_session_time')
      const activeSession = sessionStorage.getItem('admin_active_session')

      if (isAuth !== 'true' || !activeSession) {
        router.replace('/tuan/login')
        return
      }

      if (sessionTime) {
        const loginTime = new Date(sessionTime).getTime()
        const now = Date.now()
        const SESSION_TTL_MS = 24 * 60 * 60 * 1000
        if (now - loginTime > SESSION_TTL_MS) {
          localStorage.removeItem('mitra_muda_admin_logged_in')
          localStorage.removeItem('mitra_muda_admin_session_time')
          localStorage.removeItem('mitra_muda_admin_token')
          sessionStorage.removeItem('admin_active_session')
          router.replace('/tuan/login')
          return
        }
      }
    }
    syncAdminUsersFromDB()
    syncEscrowWithDB()

    const interval = setInterval(() => {
      syncAdminUsersFromDB()
      syncEscrowWithDB()
    }, 2000)

    return () => clearInterval(interval)
  }, [router])

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mitra_muda_admin_logged_in')
      localStorage.removeItem('mitra_muda_admin_session_time')
      localStorage.removeItem('mitra_muda_admin_token')
      sessionStorage.removeItem('admin_active_session')
    }
    router.push('/tuan/login')
  }

  const pendingPelajar = adminVerifs.pelajarList.filter((p) => p.verificationStatus === 'PENDING')
  const pendingSekolah = adminVerifs.sekolahList.filter((s) => s.verificationStatus === 'PENDING_REVIEW' || s.verificationStatus === 'UNVERIFIED')
  const unverifiedUMKM = adminVerifs.umkmList.filter((u) => !u.isVerified)

  const pendingDeposits = escrowState.deposits.filter((d) => d.status === 'PENDING')
  const pendingWithdrawals = escrowState.withdrawals.filter((w) => w.status === 'PENDING')

  const totalDanaEscrow = escrowState.escrows
    .filter((e) => e.dpStatus === 'HELD_IN_ESCROW')
    .reduce((acc, curr) => acc + curr.nominalDP, 0)

  const handleApproveDeposit = (id: string, namaUsaha: string, nominal: number) => {
    const ok = adminApproveDeposit(id)
    if (ok) {
      setActionSuccess(`Deposit sebesar ${formatRupiah(nominal)} untuk ${namaUsaha} telah disetujui! Saldo UMKM bertambah.`)
      setTimeout(() => setActionSuccess(null), 4000)
    }
  }

  const handleRejectDeposit = (id: string) => {
    const reason = prompt('Masukkan alasan penolakan deposit:', 'Bukti transfer tidak valid atau dana belum masuk')
    if (reason !== null) {
      adminRejectDeposit(id, reason)
      setActionSuccess('Deposit telah ditolak.')
      setTimeout(() => setActionSuccess(null), 3000)
    }
  }

  const handleApproveWithdrawal = (id: string, namaPelajar: string, nominal: number, eWallet: string) => {
    const ok = adminApproveWithdrawal(id)
    if (ok) {
      setActionSuccess(`Penarikan ${formatRupiah(nominal)} oleh ${namaPelajar} ke ${eWallet} telah disetujui & dicairkan!`)
      setTimeout(() => setActionSuccess(null), 4000)
    }
  }

  const handleRejectWithdrawal = (id: string) => {
    const reason = prompt('Masukkan alasan penolakan penarikan:', 'Nomor e-wallet tidak aktif atau batas penarikan tercapai')
    if (reason !== null) {
      adminRejectWithdrawal(id, reason)
      setActionSuccess('Permintaan penarikan telah ditolak dan saldo dikembalikan ke dompet siswa.')
      setTimeout(() => setActionSuccess(null), 3000)
    }
  }

  const handleReleaseEscrow = (escrowId: string, namaPelajar: string, nominal: number) => {
    if (confirm(`Rilis dana escrow proyek sebesar ${formatRupiah(nominal)} langsung ke dompet ${namaPelajar}?`)) {
      releaseProjectCompletionToPelajar(escrowId)
      setActionSuccess(`Dana escrow proyek sebesar ${formatRupiah(nominal)} berhasil dicairkan ke saldo siswa ${namaPelajar}!`)
      setTimeout(() => setActionSuccess(null), 4000)
    }
  }

  // Filter Search
  const filteredPelajar = adminVerifs.pelajarList.filter((p) =>
    p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.asalSekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nis && p.nis.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredSekolah = adminVerifs.sekolahList.filter((s) =>
    s.namaSekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.npsn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.emailResmi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.namaPenanggungJawab.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUMKM = adminVerifs.umkmList.filter((u) =>
    u.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.namaPemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nomorWa.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDeposits = escrowState.deposits.filter((d) => 
    d.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.namaPemilik.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredWithdrawals = escrowState.withdrawals.filter((w) => 
    w.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.eWalletType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEscrows = escrowState.escrows.filter((e) => 
    e.judulProyek.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase())
  )

  type NavItem = {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  };

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Ringkasan', icon: Activity },
    { id: 'pelajar', label: 'Verifikasi Pelajar', icon: GraduationCap, badge: pendingPelajar.length },
    { id: 'sekolah', label: 'Verifikasi Sekolah', icon: Building2, badge: pendingSekolah.length },
    { id: 'umkm', label: 'Verifikasi UMKM', icon: Store, badge: unverifiedUMKM.length },
    { id: 'deposits', label: 'Deposit UMKM', icon: Wallet, badge: pendingDeposits.length },
    { id: 'withdrawals', label: 'Penarikan Siswa', icon: ArrowUpRight, badge: pendingWithdrawals.length },
    { id: 'escrows', label: 'Escrow Vault', icon: ShieldAlert }
  ]

  return (
    <div className="min-h-screen bg-[#0A0F1A] flex font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-60 bg-[#0D1117] border-r border-[#FF9B71]/10 z-50 transform transition-transform duration-200 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-[60px] flex items-center px-5 border-b border-[#FF9B71]/10 shrink-0 gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 ring-1 ring-[#FF9B71]/30">
            <Image src="/logo.png" alt="Mitra Muda" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-sm leading-tight tracking-tight">Mitra Muda</span>
            <span className="text-[10px] text-[#FF9B71]/60 font-medium leading-tight font-mono">ADMIN PORTAL</span>
          </div>
        </div>

        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Menu</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-[#FF9B71]/10 text-[#FF9B71] font-semibold border border-[#FF9B71]/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === item.id ? 'text-[#FF9B71]' : 'text-slate-600'
              }`} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  activeTab === item.id 
                    ? 'bg-[#FF9B71]/20 text-[#FF9B71]' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-[#FF9B71]/10 space-y-0.5 shrink-0">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-600" />
            <span>Lihat Website</span>
          </Link>
          <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0">
        <header className="bg-[#0D1117]/95 backdrop-blur border-b border-[#FF9B71]/10 h-[60px] flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-white/5 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-white text-sm">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block font-mono">mitra-muda://admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 h-8 pl-8 pr-3 bg-[#161B22] border border-slate-700/50 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#FF9B71]/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setIs2FAModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF9B71]/10 hover:bg-[#FF9B71]/15 text-[#FF9B71] border border-[#FF9B71]/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2FA</span>
            </button>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-medium">Live</span>
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 bg-[#0A0F1A]">
          {actionSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Ringkasan Platform</h2>
                <p className="text-xs text-slate-500">Data real-time dari seluruh aktivitas Mitra Muda</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF1EB] flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-[#FF9B71]" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pelajar</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{pendingPelajar.length}</div>
                  <div className="text-xs text-gray-400 mt-1">Menunggu validasi</div>
                  {pendingPelajar.length > 0 && (
                    <button onClick={() => setActiveTab('pelajar')} className="mt-3 text-[11px] text-[#FF9B71] font-semibold hover:underline cursor-pointer">Tinjau sekarang</button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sekolah</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{pendingSekolah.length}</div>
                  <div className="text-xs text-gray-400 mt-1">NPSN perlu validasi</div>
                  {pendingSekolah.length > 0 && (
                    <button onClick={() => setActiveTab('sekolah')} className="mt-3 text-[11px] text-emerald-600 font-semibold hover:underline cursor-pointer">Tinjau sekarang</button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escrow</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">{formatRupiah(totalDanaEscrow)}</div>
                  <div className="text-xs text-gray-400 mt-1">Tertahan di rekening bersama</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finansial</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{pendingDeposits.length + pendingWithdrawals.length}</div>
                  <div className="text-xs text-gray-400 mt-1">{pendingDeposits.length} deposit · {pendingWithdrawals.length} pencairan</div>
                  {(pendingDeposits.length + pendingWithdrawals.length) > 0 && (
                    <button onClick={() => setActiveTab('deposits')} className="mt-3 text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer">Tinjau sekarang</button>
                  )}
                </div>
              </div>

              {pendingDeposits.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pendingDeposits.length} deposit membutuhkan verifikasi</p>
                      <p className="text-xs text-gray-400">Cek bukti transfer sebelum menyetujui penambahan saldo UMKM</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('deposits')}
                    className="px-4 py-2 bg-[#FF9B71] hover:bg-[#F5865A] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Tinjau Deposit
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pelajar' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Verifikasi Pelajar</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredPelajar.length} Siswa</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nama & Email</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">NIS</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Asal Sekolah & Kelas</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Data Lahir & Nama Ibu</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Kartu Pelajar</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPelajar.length > 0 ? filteredPelajar.map(p => {
                        const waNumber = p.nomorWa || ''
                        const cleanWa = waNumber.replace(/^0/, '62').replace(/\D/g, '')
                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 align-top">
                              <div className="font-medium text-gray-900">{p.namaLengkap}</div>
                              <div className="text-xs text-gray-500">{p.email}</div>
                              {waNumber ? (
                                <a
                                  href={`https://wa.me/${cleanWa}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>WA: {waNumber}</span>
                                </a>
                              ) : (
                                <div className="text-[11px] text-gray-400 mt-1">WA: Belum Diisi</div>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top text-gray-900">{p.nis || '-'}</td>
                            <td className="px-4 py-4 align-top">
                              <div className="text-gray-900">{p.asalSekolah}</div>
                              <div className="text-xs text-gray-500">{p.kelas || '-'}</div>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="text-gray-900">{p.tempatLahir || '-'}</div>
                              <div className="text-xs text-gray-500">Ibu: {p.namaIbu || '-'}</div>
                            </td>
                            <td className="px-4 py-4 align-top">
                              {p.fotoKartuPelajar ? (
                                <button onClick={() => setSelectedProofImg({url: p.fotoKartuPelajar!, title: `Kartu Pelajar: ${p.namaLengkap}`})} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap">Lihat Dokumen</button>
                              ) : (
                                <span className="text-xs text-gray-400">Tidak ada</span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              {p.verificationStatus === 'VERIFIED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Terverifikasi</span>}
                              {p.verificationStatus === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Ditolak</span>}
                              {p.verificationStatus === 'PENDING' && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Menunggu</span>}
                            </td>
                            <td className="px-4 py-4 align-top text-xs text-gray-500 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                            <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                              {p.verificationStatus === 'PENDING' ? (
                                <>
                                  <button onClick={() => { adminVerifyPelajar(p.id); setActionSuccess('Pelajar terverifikasi langsung oleh Admin System'); setTimeout(()=>setActionSuccess(null),3000); }} className="border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">Setujui Langsung</button>
                                  <button onClick={() => { const r = prompt('Alasan?'); if(r){ adminRejectPelajar(p.id, r); setActionSuccess('Pelajar ditolak'); setTimeout(()=>setActionSuccess(null),3000); } }} className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Tolak</button>
                                </>
                              ) : (
                                <button onClick={() => { const r = prompt('Alasan tolak/cabut?'); if(r){ adminRejectPelajar(p.id, r); setActionSuccess('Status diubah'); setTimeout(()=>setActionSuccess(null),3000); } }} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Cabut</button>
                              )}
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <GraduationCap className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Verifikasi Sekolah</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredSekolah.length} Sekolah</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nama Sekolah & NPSN</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Penanggung Jawab</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Email & Kontak</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Alamat</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSekolah.length > 0 ? filteredSekolah.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium text-gray-900">{s.namaSekolah}</div>
                            <div className="text-xs text-gray-500 mt-0.5">NPSN: {s.npsn}</div>
                          </td>
                          <td className="px-4 py-4 align-top text-gray-900">{s.namaPenanggungJawab}</td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900">{s.emailResmi}</div>
                            <div className="text-xs text-gray-500">{s.kontakSekolah || '-'}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900 text-xs">{s.alamatLengkap || '-'}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {s.verificationStatus === 'VERIFIED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Terverifikasi</span>}
                            {s.verificationStatus === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Ditolak</span>}
                            {(s.verificationStatus === 'PENDING_REVIEW' || s.verificationStatus === 'UNVERIFIED') && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {s.verificationStatus !== 'VERIFIED' ? (
                              <>
                                <button onClick={() => { adminVerifySekolah(s.id); setActionSuccess('Sekolah terverifikasi'); setTimeout(()=>setActionSuccess(null),3000); }} className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Setujui</button>
                                <button onClick={() => { const r = prompt('Alasan?'); if(r){ adminRejectSekolah(s.id); setActionSuccess('Sekolah ditolak'); setTimeout(()=>setActionSuccess(null),3000); } }} className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Tolak</button>
                              </>
                            ) : (
                              <button onClick={() => { const r = prompt('Alasan?'); if(r){ adminRejectSekolah(s.id); setActionSuccess('Status diubah'); setTimeout(()=>setActionSuccess(null),3000); } }} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Cabut</button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'umkm' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Verifikasi UMKM</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredUMKM.length} UMKM</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nama Usaha & Kategori</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pemilik & WA</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Email & Alamat</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Legalitas</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUMKM.length > 0 ? filteredUMKM.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium text-gray-900">{u.namaUsaha}</div>
                            <div className="text-xs text-gray-500">{u.kategori || '-'}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900">{u.namaPemilik}</div>
                            <div className="text-xs text-gray-500">{u.nomorWa}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900">{u.email}</div>
                            <div className="text-xs text-gray-500">{u.alamat || '-'}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {u.buktiLegalitas ? (
                              <button onClick={() => setSelectedProofImg({url: u.buktiLegalitas!, title: `Legalitas: ${u.namaUsaha}`})} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap">Lihat Dokumen</button>
                            ) : (
                              <span className="text-xs text-gray-400">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            {u.isVerified ? (
                              <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Terverifikasi</span>
                            ) : (
                              <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Menunggu</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {!u.isVerified ? (
                              <button onClick={() => { adminVerifyUMKM(u.id); setActionSuccess('UMKM terverifikasi'); setTimeout(()=>setActionSuccess(null),3000); }} className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Setujui</button>
                            ) : (
                              <button onClick={() => { adminRevokeUMKM(u.id); setActionSuccess('Status diubah'); setTimeout(()=>setActionSuccess(null),3000); }} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Cabut</button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <Store className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Deposit UMKM</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredDeposits.length} Deposit</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">UMKM</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nominal</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Bank Tujuan</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Bukti Transfer</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDeposits.length > 0 ? filteredDeposits.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium text-gray-900">{d.namaUsaha}</div>
                            <div className="text-xs text-gray-500">{d.namaPemilik}</div>
                          </td>
                          <td className="px-4 py-4 align-top text-gray-900 font-medium">{formatRupiah(d.nominal)}</td>
                          <td className="px-4 py-4 align-top text-gray-900">{d.bankTujuan}</td>
                          <td className="px-4 py-4 align-top">
                            {d.buktiTransferUrl ? (
                              <button onClick={() => setSelectedProofImg({url: d.buktiTransferUrl!, title: `Bukti: ${d.namaUsaha}`})} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap">Lihat Dokumen</button>
                            ) : (
                              <span className="text-xs text-gray-400">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            {d.status === 'APPROVED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Disetujui</span>}
                            {d.status === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Ditolak</span>}
                            {d.status === 'PENDING' && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-4 py-4 align-top text-xs text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                          <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {d.status === 'PENDING' ? (
                              <>
                                <button onClick={() => handleApproveDeposit(d.id, d.namaUsaha, d.nominal)} className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Setujui</button>
                                <button onClick={() => handleRejectDeposit(d.id)} className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Tolak</button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <Wallet className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Penarikan Siswa</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredWithdrawals.length} Penarikan</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pelajar</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nominal</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">E-Wallet</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => (
                        <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-top text-gray-900 font-medium">{w.namaPelajar}</td>
                          <td className="px-4 py-4 align-top text-gray-900 font-medium">{formatRupiah(w.nominal)}</td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900">{w.eWalletType}</div>
                            <div className="text-xs text-gray-500">{w.eWalletNomor}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {w.status === 'APPROVED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Dicairkan</span>}
                            {w.status === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Ditolak</span>}
                            {w.status === 'PENDING' && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-4 py-4 align-top text-xs text-gray-500 whitespace-nowrap">{formatDate(w.createdAt)}</td>
                          <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {w.status === 'PENDING' ? (
                              <>
                                <button onClick={() => handleApproveWithdrawal(w.id, w.namaPelajar, w.nominal, w.eWalletType)} className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Setujui</button>
                                <button onClick={() => handleRejectWithdrawal(w.id)} className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Tolak</button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <ArrowUpRight className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escrows' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Escrow Vault</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">{filteredEscrows.length} Escrow</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Proyek</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pelajar</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Total & DP</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEscrows.length > 0 ? filteredEscrows.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium text-gray-900">{e.judulProyek}</div>
                            <div className="text-xs text-gray-500">{e.namaUsaha}</div>
                          </td>
                          <td className="px-4 py-4 align-top text-gray-900">{e.namaPelajar}</td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-gray-900 font-medium">DP: {formatRupiah(e.nominalDP)}</div>
                            <div className="text-xs text-gray-500">Total: {formatRupiah(e.nominalTotal)}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {e.dpStatus === 'RELEASED_TO_PELAJAR' ? (
                              <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Dicairkan</span>
                            ) : (
                              <span className="inline-flex bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">Dikunci Sistem</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {e.dpStatus === 'HELD_IN_ESCROW' ? (
                              <button onClick={() => handleReleaseEscrow(e.id, e.namaPelajar, e.nominalDP)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer">Paksa Rilis</button>
                            ) : (
                              <span className="text-xs text-gray-400">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <ShieldAlert className="w-5 h-5 text-gray-400" />
                            </div>
                            Tidak ada data ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Document Modal */}
      {selectedProofImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{selectedProofImg.title}</h4>
              <button
                onClick={() => setSelectedProofImg(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative min-h-[300px] max-h-[500px] w-full rounded-xl overflow-hidden bg-slate-900/5 border border-gray-200 mb-4 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProofImg.url}
                alt={selectedProofImg.title}
                className="max-h-[460px] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofImg(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 2FA Modal */}
      <TwoFactorModal
        userId="admin-master"
        userName="Admin Master System"
        userRole="admin"
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  )
}
