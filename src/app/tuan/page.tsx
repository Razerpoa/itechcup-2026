'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu, X, Search, LogOut, ExternalLink, Activity, 
  Building2, Store, Wallet, ArrowUpRight, ArrowRight,
  ShieldAlert, AlertTriangle, CheckCircle2, 
  GraduationCap, MessageCircle, ShieldCheck, Check, RotateCcw,
  Loader2, Clock
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
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [rejectRevokeModal, setRejectRevokeModal] = useState<{
    isOpen: boolean
    title: string
    subtitle: string
    actionType: 'reject_pelajar' | 'revoke_pelajar' | 'reject_sekolah' | 'revoke_sekolah' | 'revoke_umkm' | 'reject_deposit' | 'reject_withdrawal'
    targetId: string
    targetName: string
  } | null>(null)
  const [reasonCategory, setReasonCategory] = useState('Dokumen tidak sesuai')
  const [customReasonText, setCustomReasonText] = useState('')

  const openRejectModal = (
    actionType: 'reject_pelajar' | 'revoke_pelajar' | 'reject_sekolah' | 'revoke_sekolah' | 'revoke_umkm' | 'reject_deposit' | 'reject_withdrawal',
    targetId: string,
    targetName: string
  ) => {
    let title = 'Tolak Verifikasi'
    let subtitle = `Pilih alasan untuk ${targetName}:`
    let defaultReason = 'Dokumen tidak sesuai persyaratan'

    if (actionType === 'reject_pelajar') {
      title = 'Tolak Verifikasi Siswa'
      subtitle = `Pilih alasan penolakan berkas siswa ${targetName}:`
      defaultReason = 'Kartu identitas / foto buram'
    } else if (actionType === 'revoke_pelajar') {
      title = 'Cabut Status Verifikasi Siswa'
      subtitle = `Cabut status terverifikasi resmi untuk ${targetName}:`
      defaultReason = 'Permintaan pencabutan pihak sekolah'
    } else if (actionType === 'reject_sekolah') {
      title = 'Tolak Verifikasi Sekolah'
      subtitle = `Pilih alasan penolakan institusi ${targetName}:`
      defaultReason = 'NPSN tidak terdaftar resmi'
    } else if (actionType === 'revoke_sekolah') {
      title = 'Cabut Verifikasi Sekolah'
      subtitle = `Cabut akses terverifikasi institusi ${targetName}:`
      defaultReason = 'Permintaan penonaktifan sekolah'
    } else if (actionType === 'revoke_umkm') {
      title = 'Cabut Verifikasi Mitra UMKM'
      subtitle = `Cabut status terverifikasi usaha ${targetName}:`
      defaultReason = 'Dokumen legalitas / NIB tidak sah'
    } else if (actionType === 'reject_deposit') {
      title = 'Tolak Permintaan Deposit'
      subtitle = `Pilih alasan penolakan deposit dari ${targetName}:`
      defaultReason = 'Bukti transfer tidak jelas / dana belum masuk'
    } else if (actionType === 'reject_withdrawal') {
      title = 'Tolak Penarikan Saldo Siswa'
      subtitle = `Pilih alasan penolakan penarikan saldo ${targetName}:`
      defaultReason = 'Nomor e-wallet tidak aktif / salah'
    }

    setReasonCategory(defaultReason)
    setCustomReasonText('')
    setRejectRevokeModal({
      isOpen: true,
      title,
      subtitle,
      actionType,
      targetId,
      targetName
    })
  }

  const getReasonOptions = (actionType: string) => {
    switch (actionType) {
      case 'reject_pelajar':
        return [
          'Kartu identitas / foto buram',
          'NIS atau data diri tidak valid',
          'Bukan siswa aktif sekolah terkait',
          'Dokumen terindikasi manipulasi'
        ]
      case 'revoke_pelajar':
        return [
          'Permintaan pencabutan pihak sekolah',
          'Pelanggaran ketentuan platform',
          'Indikasi akun ganda / pemalsuan',
          'Penyalahgunaan transaksi escrow'
        ]
      case 'reject_sekolah':
        return [
          'NPSN tidak terdaftar resmi',
          'Email resmi sekolah tidak valid',
          'Surat tugas penanggung jawab tidak valid',
          'Nama lembaga tidak sesuai Kemendikdasmen'
        ]
      case 'revoke_sekolah':
        return [
          'Permintaan penonaktifan sekolah',
          'Akun terindikasi disalahgunakan',
          'Data legalitas ditarik pihak sekolah'
        ]
      case 'revoke_umkm':
        return [
          'Dokumen legalitas / NIB tidak sah',
          'Nomor WhatsApp tidak aktif',
          'Pelanggaran komitmen akad proyek',
          'Laporan kecurangan transaksi dari siswa'
        ]
      case 'reject_deposit':
        return [
          'Bukti transfer tidak jelas / buram',
          'Dana belum masuk rekening escrow',
          'Nominal tidak sesuai mutasi bank',
          'Rekening pengirim tidak valid'
        ]
      case 'reject_withdrawal':
        return [
          'Nomor e-wallet tidak aktif / salah',
          'Akun e-wallet belum terverifikasi',
          'Batas penarikan harian terlampaui',
          'Data akun tidak cocok'
        ]
      default:
        return [
          'Dokumen tidak sesuai',
          'Data tidak valid',
          'Permintaan pembatalan',
          'Pelanggaran kebijakan sistem'
        ]
    }
  }

  const handleConfirmRejectRevoke = async () => {
    if (!rejectRevokeModal) return
    setIsProcessingAction(true)
    const finalReason = customReasonText.trim() ? `${reasonCategory}: ${customReasonText.trim()}` : reasonCategory

    try {
      if (rejectRevokeModal.actionType === 'reject_pelajar' || rejectRevokeModal.actionType === 'revoke_pelajar') {
        await adminRejectPelajar(rejectRevokeModal.targetId, finalReason)
        setActionSuccess(`Status verifikasi ${rejectRevokeModal.targetName} berhasil diubah`)
      } else if (rejectRevokeModal.actionType === 'reject_sekolah' || rejectRevokeModal.actionType === 'revoke_sekolah') {
        await adminRejectSekolah(rejectRevokeModal.targetId)
        setActionSuccess(`Status sekolah ${rejectRevokeModal.targetName} berhasil diubah`)
      } else if (rejectRevokeModal.actionType === 'revoke_umkm') {
        await adminRevokeUMKM(rejectRevokeModal.targetId)
        setActionSuccess(`Status UMKM ${rejectRevokeModal.targetName} berhasil dicabut`)
      } else if (rejectRevokeModal.actionType === 'reject_deposit') {
        adminRejectDeposit(rejectRevokeModal.targetId, finalReason)
        setActionSuccess(`Deposit UMKM telah ditolak`)
      } else if (rejectRevokeModal.actionType === 'reject_withdrawal') {
        adminRejectWithdrawal(rejectRevokeModal.targetId, finalReason)
        setActionSuccess(`Penarikan dana siswa telah ditolak dan saldo dikembalikan`)
      }

      await syncAdminUsersFromDB()
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessingAction(false)
      setRejectRevokeModal(null)
      setCustomReasonText('')
      setTimeout(() => setActionSuccess(null), 3500)
    }
  }

  const handleVerifyPelajar = async (id: string, nama: string) => {
    await adminVerifyPelajar(id)
    setActionSuccess(`Pelajar ${nama} berhasil diverifikasi resmi!`)
    await syncAdminUsersFromDB()
    setTimeout(() => setActionSuccess(null), 3000)
  }

  const handleVerifySekolah = async (id: string, nama: string) => {
    await adminVerifySekolah(id)
    setActionSuccess(`Sekolah ${nama} berhasil diverifikasi resmi!`)
    await syncAdminUsersFromDB()
    setTimeout(() => setActionSuccess(null), 3000)
  }

  const handleVerifyUMKM = async (id: string, nama: string) => {
    await adminVerifyUMKM(id)
    setActionSuccess(`UMKM ${nama} berhasil diverifikasi resmi!`)
    await syncAdminUsersFromDB()
    setTimeout(() => setActionSuccess(null), 3000)
  }

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

  const handleApproveWithdrawal = (id: string, namaPelajar: string, nominal: number, eWallet: string) => {
    const ok = adminApproveWithdrawal(id)
    if (ok) {
      setActionSuccess(`Penarikan ${formatRupiah(nominal)} oleh ${namaPelajar} ke ${eWallet} telah disetujui & dicairkan!`)
      setTimeout(() => setActionSuccess(null), 4000)
    }
  }

  const handleReleaseEscrow = (escrowId: string, namaPelajar: string, nominal: number) => {
    releaseProjectCompletionToPelajar(escrowId)
    setActionSuccess(`Dana escrow proyek sebesar ${formatRupiah(nominal)} berhasil dicairkan ke saldo siswa ${namaPelajar}!`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

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
    <div className="min-h-screen bg-[#F6F3EE] flex font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-60 bg-white border-r border-[#E8E2DA] z-50 transform transition-transform duration-200 ease-in-out flex flex-col shadow-sm ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-[60px] flex items-center px-5 border-b border-[#F0EBE4] shrink-0 gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-xs">
            <Image src="/logo.png" alt="Mitra Muda" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[#2D2319] text-sm leading-tight tracking-tight">Mitra Muda</span>
            <span className="text-[10px] text-[#B5ADA4] font-medium leading-tight">Admin Panel</span>
          </div>
        </div>

        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-semibold text-[#B5ADA4] uppercase tracking-widest">Menu</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-[#FF9B71]/10 text-[#964825] font-semibold' 
                  : 'text-[#6B6058] hover:text-[#2D2319] hover:bg-[#F6F3EE]'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === item.id ? 'text-[#FF9B71]' : 'text-[#B5ADA4]'
              }`} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  activeTab === item.id 
                    ? 'bg-[#FF9B71]/20 text-[#964825]' 
                    : 'bg-red-50 text-red-500'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-[#F0EBE4] space-y-0.5 shrink-0">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6B6058] hover:text-[#2D2319] hover:bg-[#F6F3EE] transition-all">
            <ExternalLink className="w-4 h-4 shrink-0 text-[#B5ADA4]" />
            <span>Lihat Website</span>
          </Link>
          <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6B6058] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8E2DA] h-[60px] flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[#6B6058] hover:text-[#2D2319] p-1 rounded-lg hover:bg-[#F6F3EE] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-[#2D2319] text-sm">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-[11px] text-[#B5ADA4] hidden sm:block">Panel Administrasi Mitra Muda</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-[#B5ADA4] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 h-8 pl-8 pr-3 bg-[#FAFAF8] border border-[#E0DAD2] rounded-xl text-xs text-[#2D2319] placeholder:text-[#B5ADA4] focus:outline-none focus:border-[#FF9B71] transition-colors"
              />
            </div>
            <button
              onClick={() => setIs2FAModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF9B71]/10 hover:bg-[#FF9B71]/15 text-[#964825] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keamanan</span>
            </button>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[11px] text-emerald-700 font-medium">Aktif</span>
            </div>
          </div>
        </header>

        <main className="p-6 flex-1">
          {actionSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#2D2319] tracking-tight">Ringkasan Operasional</h2>
                <p className="text-xs text-[#8B7E74] mt-0.5">Pemantauan aktivitas real-time ekosistem talenta dan transaksi Mitra Muda</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pelajar Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF4EC] border border-[#FFE0D2] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#964825]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#8B7E74] tracking-wider uppercase bg-[#F6F3EE] px-2 py-0.5 rounded-md">Pelajar</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#2D2319] tracking-tight">{pendingPelajar.length}</div>
                  <p className="text-xs text-[#8B7E74] mt-1 font-medium">Menunggu validasi dokumen</p>
                  {pendingPelajar.length > 0 && (
                    <button onClick={() => setActiveTab('pelajar')} className="mt-3 text-xs text-[#964825] font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <span>Tinjau sekarang</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Sekolah Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="text-[10px] font-bold text-[#8B7E74] tracking-wider uppercase bg-[#F6F3EE] px-2 py-0.5 rounded-md">Sekolah</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#2D2319] tracking-tight">{pendingSekolah.length}</div>
                  <p className="text-xs text-[#8B7E74] mt-1 font-medium">NPSN perlu verifikasi manual</p>
                  {pendingSekolah.length > 0 && (
                    <button onClick={() => setActiveTab('sekolah')} className="mt-3 text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <span>Tinjau sekarang</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Escrow Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-[10px] font-bold text-[#8B7E74] tracking-wider uppercase bg-[#F6F3EE] px-2 py-0.5 rounded-md">Escrow</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#2D2319] tracking-tight tabular-nums">{formatRupiah(totalDanaEscrow)}</div>
                  <p className="text-xs text-[#8B7E74] mt-1 font-medium">Dana tertahan di rekening bersama</p>
                </div>

                {/* Finansial Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-amber-700" />
                    </div>
                    <span className="text-[10px] font-bold text-[#8B7E74] tracking-wider uppercase bg-[#F6F3EE] px-2 py-0.5 rounded-md">Antrean Dana</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#2D2319] tracking-tight">{pendingDeposits.length + pendingWithdrawals.length}</div>
                  <p className="text-xs text-[#8B7E74] mt-1 font-medium">{pendingDeposits.length} deposit · {pendingWithdrawals.length} pencairan</p>
                  {(pendingDeposits.length + pendingWithdrawals.length) > 0 && (
                    <button onClick={() => setActiveTab('deposits')} className="mt-3 text-xs text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <span>Tinjau sekarang</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {pendingDeposits.length > 0 && (
                <div className="bg-white border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2D2319]">{pendingDeposits.length} permohonan deposit UMKM menunggu validasi</p>
                      <p className="text-xs text-[#8B7E74] mt-0.5">Periksa bukti transfer dan mutasi sebelum mengonfirmasi penambahan saldo.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('deposits')}
                    className="px-4 py-2.5 bg-[#2D2319] hover:bg-[#3D3229] text-white text-xs font-bold rounded-xl transition-all shadow-xs whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Tinjau Antrean Deposit
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pelajar' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Verifikasi Talenta Pelajar</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Daftar siswa terdaftar beserta kelengkapan kartu pelajar & data diri</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredPelajar.length} Siswa</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Nama & Email</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">NIS</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Asal Sekolah & Kelas</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Data Lahir & Nama Ibu</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Dokumen</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredPelajar.length > 0 ? filteredPelajar.map(p => {
                        const waNumber = p.nomorWa || ''
                        const cleanWa = waNumber.replace(/^0/, '62').replace(/\D/g, '')
                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="px-5 py-4 align-top">
                              <div className="font-bold text-[#2D2319]">{p.namaLengkap}</div>
                              <div className="text-xs text-[#8B7E74]">{p.email}</div>
                              {waNumber ? (
                                <a
                                  href={`https://wa.me/${cleanWa}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>WA: {waNumber}</span>
                                </a>
                              ) : (
                                <div className="text-[11px] text-[#B5ADA4] mt-1">WA: Belum Diisi</div>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top text-[#2D2319] font-medium">{p.nis || '-'}</td>
                            <td className="px-5 py-4 align-top">
                              <div className="text-[#2D2319] font-medium">{p.asalSekolah}</div>
                              <div className="text-xs text-[#8B7E74]">{p.kelas || '-'}</div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="text-[#2D2319] font-medium">{p.tempatLahir || '-'}</div>
                              <div className="text-xs text-[#8B7E74]">Ibu: {p.namaIbu || '-'}</div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              {p.fotoKartuPelajar ? (
                                <button onClick={() => setSelectedProofImg({url: p.fotoKartuPelajar!, title: `Kartu Pelajar: ${p.namaLengkap}`})} className="border border-[#E0DAD2] bg-white text-[#2D2319] hover:bg-[#F6F3EE] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs transition-colors">Lihat Dokumen</button>
                              ) : (
                                <span className="text-xs text-[#B5ADA4]">Tidak ada</span>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top">
                              {p.verificationStatus === 'VERIFIED' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                                  <Check className="w-3 h-3" />
                                  <span>Terverifikasi</span>
                                </span>
                              )}
                              {p.verificationStatus === 'REJECTED' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                                    <X className="w-3 h-3" />
                                    <span>Ditolak</span>
                                  </span>
                                  {p.catatanPenolakan && (
                                    <p className="text-[10px] text-gray-500 max-w-[150px] truncate" title={p.catatanPenolakan}>
                                      {p.catatanPenolakan}
                                    </p>
                                  )}
                                </div>
                              )}
                              {p.verificationStatus === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  <span>Menunggu</span>
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top text-xs text-[#8B7E74] whitespace-nowrap">{formatDate(p.createdAt)}</td>
                            <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                              {p.verificationStatus === 'PENDING' ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleVerifyPelajar(p.id, p.namaLengkap)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    onClick={() => openRejectModal('reject_pelajar', p.id, p.namaLengkap)}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              ) : p.verificationStatus === 'VERIFIED' ? (
                                <button
                                  onClick={() => openRejectModal('revoke_pelajar', p.id, p.namaLengkap)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Cabut Verifikasi</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyPelajar(p.id, p.namaLengkap)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Pulihkan & Setujui</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <GraduationCap className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data siswa ditemukan
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
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Verifikasi Lembaga Sekolah</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Validasi legalitas institusi pendidikan dan penanggung jawab resmi</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredSekolah.length} Sekolah</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Nama Sekolah & NPSN</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Penanggung Jawab</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Email & Kontak</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Alamat</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredSekolah.length > 0 ? filteredSekolah.map(s => (
                        <tr key={s.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-[#2D2319]">{s.namaSekolah}</div>
                            <div className="text-xs text-[#8B7E74] mt-0.5 font-mono">NPSN: {s.npsn}</div>
                          </td>
                          <td className="px-5 py-4 align-top text-[#2D2319] font-medium">{s.namaPenanggungJawab}</td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] font-medium">{s.emailResmi}</div>
                            <div className="text-xs text-[#8B7E74]">{s.kontakSekolah || '-'}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] text-xs leading-relaxed">{s.alamatLengkap || '-'}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            {s.verificationStatus === 'VERIFIED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Terverifikasi</span>}
                            {s.verificationStatus === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Ditolak</span>}
                            {(s.verificationStatus === 'PENDING_REVIEW' || s.verificationStatus === 'UNVERIFIED') && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {s.verificationStatus === 'VERIFIED' ? (
                              <button
                                onClick={() => {
                                  setRejectRevokeModal({
                                    isOpen: true,
                                    title: 'Cabut Verifikasi Sekolah',
                                    subtitle: `Cabut verifikasi lembaga ${s.namaSekolah}:`,
                                    actionType: 'revoke_sekolah',
                                    targetId: s.id,
                                    targetName: s.namaSekolah
                                  })
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Cabut Verifikasi</span>
                              </button>
                            ) : s.verificationStatus === 'REJECTED' ? (
                              <button
                                onClick={() => {
                                  adminVerifySekolah(s.id)
                                  setActionSuccess(`Sekolah ${s.namaSekolah} dipulihkan & disetujui`)
                                  setTimeout(() => setActionSuccess(null), 3000)
                                }}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Pulihkan & Setujui</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    adminVerifySekolah(s.id)
                                    setActionSuccess(`Sekolah ${s.namaSekolah} terverifikasi`)
                                    setTimeout(() => setActionSuccess(null), 3000)
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectRevokeModal({
                                      isOpen: true,
                                      title: 'Tolak Verifikasi Sekolah',
                                      subtitle: `Pilih alasan penolakan untuk lembaga ${s.namaSekolah}:`,
                                      actionType: 'reject_sekolah',
                                      targetId: s.id,
                                      targetName: s.namaSekolah
                                    })
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <Building2 className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data sekolah ditemukan
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
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Verifikasi Mitra UMKM</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Kelola verifikasi legalitas usaha dan verifikasi nomor operasional WhatsApp</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredUMKM.length} UMKM</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Nama Usaha & Kategori</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Pemilik & WA</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Email & Alamat</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Legalitas</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredUMKM.length > 0 ? filteredUMKM.map(u => (
                        <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-[#2D2319]">{u.namaUsaha}</div>
                            <div className="text-xs text-[#8B7E74]">{u.kategori || '-'}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] font-medium">{u.namaPemilik}</div>
                            <div className="text-xs text-[#8B7E74]">{u.nomorWa}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] font-medium">{u.email}</div>
                            <div className="text-xs text-[#8B7E74]">{u.alamat || '-'}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            {u.buktiLegalitas ? (
                              <button onClick={() => setSelectedProofImg({url: u.buktiLegalitas!, title: `Legalitas: ${u.namaUsaha}`})} className="border border-[#E0DAD2] bg-white text-[#2D2319] hover:bg-[#F6F3EE] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs transition-colors">Lihat Dokumen</button>
                            ) : (
                              <span className="text-xs text-[#B5ADA4]">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top">
                            {u.isVerified ? (
                              <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Terverifikasi</span>
                            ) : (
                              <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Menunggu</span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {!u.isVerified ? (
                              <button
                                onClick={() => handleVerifyUMKM(u.id, u.namaUsaha)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openRejectModal('revoke_umkm', u.id, u.namaUsaha)}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Cabut Verifikasi</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <Store className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data UMKM ditemukan
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
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Deposit Saldo UMKM</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Konfirmasi penambahan modal escrow dari transfer bank UMKM</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredDeposits.length} Deposit</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">UMKM</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Nominal</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Bank Tujuan</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Bukti Transfer</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredDeposits.length > 0 ? filteredDeposits.map(d => (
                        <tr key={d.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-[#2D2319]">{d.namaUsaha}</div>
                            <div className="text-xs text-[#8B7E74]">{d.namaPemilik}</div>
                          </td>
                          <td className="px-5 py-4 align-top text-[#2D2319] font-bold tabular-nums">{formatRupiah(d.nominal)}</td>
                          <td className="px-5 py-4 align-top text-[#2D2319] font-medium">{d.bankTujuan}</td>
                          <td className="px-5 py-4 align-top">
                            {d.buktiTransferUrl ? (
                              <button onClick={() => setSelectedProofImg({url: d.buktiTransferUrl!, title: `Bukti Transfer: ${d.namaUsaha}`})} className="border border-[#E0DAD2] bg-white text-[#2D2319] hover:bg-[#F6F3EE] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs transition-colors">Lihat Bukti</button>
                            ) : (
                              <span className="text-xs text-[#B5ADA4]">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top">
                            {d.status === 'APPROVED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Disetujui</span>}
                            {d.status === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Ditolak</span>}
                            {d.status === 'PENDING' && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-[#8B7E74] whitespace-nowrap">{formatDate(d.createdAt)}</td>
                          <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {d.status === 'PENDING' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button onClick={() => handleApproveDeposit(d.id, d.namaUsaha, d.nominal)} className="border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">Setujui</button>
                                <button onClick={() => openRejectModal('reject_deposit', d.id, d.namaUsaha)} className="border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors">Tolak</button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#B5ADA4]">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <Wallet className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data deposit ditemukan
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
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Pencairan Dana Pelajar</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Validasi pengiriman reward ke dompet digital (Gopay / OVO / DANA) pelajar</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredWithdrawals.length} Penarikan</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Pelajar</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Nominal</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">E-Wallet</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => (
                        <tr key={w.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-4 align-top text-[#2D2319] font-bold">{w.namaPelajar}</td>
                          <td className="px-5 py-4 align-top text-[#2D2319] font-bold tabular-nums">{formatRupiah(w.nominal)}</td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] font-medium uppercase tracking-wider text-xs">{w.eWalletType}</div>
                            <div className="text-xs text-[#8B7E74] font-mono mt-0.5">{w.eWalletNomor}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            {w.status === 'APPROVED' && <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Dicairkan</span>}
                            {w.status === 'REJECTED' && <span className="inline-flex bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Ditolak</span>}
                            {w.status === 'PENDING' && <span className="inline-flex bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Menunggu</span>}
                          </td>
                          <td className="px-5 py-4 align-top text-xs text-[#8B7E74] whitespace-nowrap">{formatDate(w.createdAt)}</td>
                          <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {w.status === 'PENDING' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button onClick={() => handleApproveWithdrawal(w.id, w.namaPelajar, w.nominal, w.eWalletType)} className="border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">Setujui</button>
                                <button onClick={() => openRejectModal('reject_withdrawal', w.id, w.namaPelajar)} className="border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors">Tolak</button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#B5ADA4]">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <ArrowUpRight className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data penarikan ditemukan
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
                <div>
                  <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Rekening Bersama (Escrow)</h3>
                  <p className="text-xs text-[#8B7E74] mt-0.5">Pemantauan dana jaminan DP dan sisa pelunasan per proyek aktif</p>
                </div>
                <span className="text-xs font-bold bg-white text-[#2D2319] px-3 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs">{filteredEscrows.length} Escrow</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Proyek & UMKM</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Pelajar</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Total & DP</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE4]">
                      {filteredEscrows.length > 0 ? filteredEscrows.map(e => (
                        <tr key={e.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-[#2D2319]">{e.judulProyek}</div>
                            <div className="text-xs text-[#8B7E74]">{e.namaUsaha}</div>
                          </td>
                          <td className="px-5 py-4 align-top text-[#2D2319] font-medium">{e.namaPelajar}</td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-[#2D2319] font-bold tabular-nums">DP: {formatRupiah(e.nominalDP)}</div>
                            <div className="text-xs text-[#8B7E74] tabular-nums">Total: {formatRupiah(e.nominalTotal)}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            {e.dpStatus === 'RELEASED_TO_PELAJAR' ? (
                              <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Dicairkan</span>
                            ) : (
                              <span className="inline-flex bg-[#F6F3EE] text-[#6B6058] border border-[#E0DAD2] px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">Terkunci di Vault</span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                            {e.dpStatus === 'HELD_IN_ESCROW' ? (
                              <button onClick={() => handleReleaseEscrow(e.id, e.namaPelajar, e.nominalDP)} className="border border-[#E0DAD2] text-[#2D2319] bg-white hover:bg-[#F6F3EE] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">Paksa Rilis</button>
                            ) : (
                              <span className="text-xs text-[#B5ADA4]">Selesai</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                              <ShieldAlert className="w-6 h-6 text-[#B5ADA4]" />
                            </div>
                            Tidak ada data transaksi escrow ditemukan
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#E8E2DA] relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-[#2D2319] text-base">{selectedProofImg.title}</h4>
                <p className="text-xs text-[#8B7E74]">Dokumen lampiran verifikasi pendaftar</p>
              </div>
              <button
                onClick={() => setSelectedProofImg(null)}
                className="w-9 h-9 rounded-xl bg-[#F6F3EE] text-[#6B6058] hover:text-[#2D2319] hover:bg-[#EDE8E0] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="relative min-h-[300px] max-h-[500px] w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2DA] mb-5 flex items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProofImg.url}
                alt={selectedProofImg.title}
                className="max-h-[460px] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofImg(null)}
                className="px-5 py-2.5 bg-[#2D2319] hover:bg-[#3D3229] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reject / Revoke Modal */}
      {rejectRevokeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E8E2DA] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#964825] font-extrabold text-base">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h4>{rejectRevokeModal.title}</h4>
              </div>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setRejectRevokeModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {rejectRevokeModal.subtitle}
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Pilih Alasan Utama
              </label>
              <div className="flex flex-wrap gap-1.5">
                {getReasonOptions(rejectRevokeModal.actionType).map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => setReasonCategory(reason)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      reasonCategory === reason
                        ? 'bg-[#FF9B71] text-white border-[#FF9B71] shadow-2xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    } disabled:opacity-50`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <textarea
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                disabled={isProcessingAction}
                placeholder="Catatan tambahan penjelasan admin (opsional)..."
                rows={2}
                className="w-full mt-2 p-3 bg-[#FAF8F5] border border-gray-200 focus:border-[#FF9B71] rounded-xl text-xs outline-none resize-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setRejectRevokeModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleConfirmRejectRevoke}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isProcessingAction ? 'Menyimpan...' : 'Konfirmasi Aksi'}</span>
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
