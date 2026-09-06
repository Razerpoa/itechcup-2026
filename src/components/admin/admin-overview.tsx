'use client'

import React, { useMemo } from 'react'
import {
  GraduationCap,
  Building2,
  Store,
  ShieldAlert,
  Wallet,
  ArrowUpRight,
  Briefcase,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Server,
  Zap,
  Layers,
  FileSpreadsheet
} from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { ProyekItem } from '@/lib/projects-store'
import { JasaItem } from '@/lib/jasa-store'
import { AkadTransaksiItem } from '@/lib/akad-store'
import {
  AdminFinancialAreaChart,
  AdminCategoryBarChart,
  AdminAkadDonutChart
} from './admin-charts'

interface AdminOverviewProps {
  pelajarList: any[]
  sekolahList: any[]
  umkmList: any[]
  deposits: any[]
  withdrawals: any[]
  escrows: any[]
  akads: AkadTransaksiItem[]
  projects: ProyekItem[]
  jasaList: JasaItem[]
  totalDanaEscrow: number
  pendingPelajar: any[]
  pendingSekolah: any[]
  unverifiedUMKM: any[]
  pendingDeposits: any[]
  pendingWithdrawals: any[]
  onNavigateTab: (tab: any) => void
  onOpenExportModal: () => void
}

export default function AdminOverview({
  pelajarList,
  sekolahList,
  umkmList,
  deposits,
  withdrawals,
  escrows,
  akads,
  projects,
  jasaList,
  totalDanaEscrow,
  pendingPelajar,
  pendingSekolah,
  unverifiedUMKM,
  pendingDeposits,
  pendingWithdrawals,
  onNavigateTab,
  onOpenExportModal
}: AdminOverviewProps) {
  const verifiedPelajar = pelajarList.filter(p => p.verificationStatus === 'VERIFIED')
  const verifiedSekolah = sekolahList.filter(s => s.verificationStatus === 'VERIFIED')
  const verifiedUMKM = umkmList.filter(u => u.isVerified)

  const approvedWithdrawals = withdrawals.filter(w => w.status === 'APPROVED')
  const totalPencairanBerhasil = approvedWithdrawals.reduce((sum, w) => sum + (w.nominal || 0), 0)

  const approvedDeposits = deposits.filter(d => d.status === 'APPROVED')
  const totalDepositBerhasil = approvedDeposits.reduce((sum, d) => sum + (d.nominal || 0), 0)

  const totalNilaiAkad = akads.reduce((sum, a) => sum + (a.nominalTotal || 0), 0)
  const totalVolumePerputaran = totalNilaiAkad + totalDepositBerhasil

  const totalPendingAction =
    pendingPelajar.length +
    pendingSekolah.length +
    unverifiedUMKM.length +
    pendingDeposits.length +
    pendingWithdrawals.length

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Desain Grafis': 0,
      'Web & IT': 0,
      'Media Sosial': 0,
      'Video & Foto': 0,
      'Lainnya': 0
    }

    projects.forEach(p => {
      const tagsStr = (p.tags || []).join(' ').toLowerCase()
      const titleStr = p.judul.toLowerCase()
      if (tagsStr.includes('desain') || titleStr.includes('desain') || titleStr.includes('logo') || titleStr.includes('banner')) {
        counts['Desain Grafis']++
      } else if (tagsStr.includes('web') || tagsStr.includes('it') || tagsStr.includes('aplikasi') || titleStr.includes('web')) {
        counts['Web & IT']++
      } else if (tagsStr.includes('sosial') || tagsStr.includes('konten') || titleStr.includes('instagram') || titleStr.includes('tiktok')) {
        counts['Media Sosial']++
      } else if (tagsStr.includes('video') || tagsStr.includes('foto') || titleStr.includes('foto') || titleStr.includes('video')) {
        counts['Video & Foto']++
      } else {
        counts['Lainnya']++
      }
    })

    const total = projects.length || 1
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100)
    }))
  }, [projects])



  const auditEvents = useMemo(() => {
    const list: {
      id: string
      title: string
      desc: string
      date: string
      type: 'pelajar' | 'sekolah' | 'umkm' | 'deposit' | 'withdrawal' | 'akad'
      targetTab: string
    }[] = []

    deposits.slice(0, 5).forEach(d => {
      list.push({
        id: `dep-${d.id}`,
        title: `Deposit Saldo UMKM: ${d.namaUsaha}`,
        desc: `${formatRupiah(d.nominal)} melalui ${d.bankTujuan || 'Transfer Bank'} (Status: ${d.status})`,
        date: d.createdAt,
        type: 'deposit',
        targetTab: 'deposits'
      })
    })

    withdrawals.slice(0, 5).forEach(w => {
      list.push({
        id: `wd-${w.id}`,
        title: `Pencairan Siswa: ${w.namaPelajar}`,
        desc: `${formatRupiah(w.nominal)} ke e-wallet ${w.eWalletType} (Status: ${w.status})`,
        date: w.createdAt,
        type: 'withdrawal',
        targetTab: 'withdrawals'
      })
    })

    akads.slice(0, 5).forEach(a => {
      list.push({
        id: `ak-${a.id}`,
        title: `Akad Transaksi Proyek: ${a.judulProyek}`,
        desc: `${a.namaUsaha} dengan ${a.namaPelajar} - Nilai ${formatRupiah(a.nominalTotal)}`,
        date: a.createdAt,
        type: 'akad',
        targetTab: 'escrows'
      })
    })

    pelajarList.slice(0, 4).forEach(p => {
      list.push({
        id: `plj-${p.id}`,
        title: `Pendaftaran Siswa: ${p.namaLengkap}`,
        desc: `Asal ${p.asalSekolah} (Status: ${p.verificationStatus})`,
        date: p.createdAt,
        type: 'pelajar',
        targetTab: 'pelajar'
      })
    })

    sekolahList.slice(0, 3).forEach(s => {
      list.push({
        id: `skl-${s.id}`,
        title: `Pendaftaran Sekolah: ${s.namaSekolah}`,
        desc: `NPSN: ${s.npsn} - PJ: ${s.namaPenanggungJawab}`,
        date: s.createdAt,
        type: 'sekolah',
        targetTab: 'sekolah'
      })
    })

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list.slice(0, 8)
  }, [deposits, withdrawals, akads, pelajarList, sekolahList])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FFF4EC] text-[#964825] border border-[#FFE0D2] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Master Executive Control Panel</span>
          </div>
          <h2 className="text-2xl font-black text-[#2D2319] tracking-tight">Ringkasan Eksekutif Platform</h2>
          <p className="text-xs sm:text-sm text-[#8B7E74] mt-1">
            Monitoring sentral terhadap seluruh entitas, perputaran dana escrow, dan aktivitas operasional Mitra Muda.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 bg-[#2D2319] hover:bg-[#403429] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FF9B71]" />
            <span>Ekspor Data CSV</span>
          </button>
        </div>
      </div>

      {totalPendingAction > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#2D2319]">
                Terdapat {totalPendingAction} item prioritas menunggu peninjauan Anda
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Rincian: {pendingPelajar.length} siswa · {pendingSekolah.length} sekolah · {unverifiedUMKM.length} UMKM · {pendingDeposits.length} deposit · {pendingWithdrawals.length} pencairan saldo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingDeposits.length > 0 && (
              <button
                onClick={() => onNavigateTab('deposits')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Deposit ({pendingDeposits.length})
              </button>
            )}
            {pendingPelajar.length > 0 && (
              <button
                onClick={() => onNavigateTab('pelajar')}
                className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Siswa ({pendingPelajar.length})
              </button>
            )}
            {pendingWithdrawals.length > 0 && (
              <button
                onClick={() => onNavigateTab('withdrawals')}
                className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Pencairan ({pendingWithdrawals.length})
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E8E2DA] shadow-xs hover:border-[#FF9B71] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4EC] border border-[#FFE0D2] flex items-center justify-center text-[#964825]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#8B7E74] bg-[#FAF8F5] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Talenta
            </span>
          </div>
          <div className="text-3xl font-black text-[#2D2319] tracking-tight">{pelajarList.length}</div>
          <div className="text-xs text-[#8B7E74] mt-1 font-medium flex items-center justify-between">
            <span>{verifiedPelajar.length} terverifikasi</span>
            <span className="text-amber-600 font-bold">{pendingPelajar.length} pending</span>
          </div>
          <button
            onClick={() => onNavigateTab('pelajar')}
            className="mt-3.5 text-xs text-[#964825] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Verifikasi Siswa</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8E2DA] shadow-xs hover:border-[#FF9B71] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#8B7E74] bg-[#FAF8F5] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Mitra Bisnis
            </span>
          </div>
          <div className="text-3xl font-black text-[#2D2319] tracking-tight">{umkmList.length}</div>
          <div className="text-xs text-[#8B7E74] mt-1 font-medium flex items-center justify-between">
            <span>{verifiedUMKM.length} terverifikasi</span>
            <span className="text-amber-600 font-bold">{unverifiedUMKM.length} pending</span>
          </div>
          <button
            onClick={() => onNavigateTab('umkm')}
            className="mt-3.5 text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Data UMKM</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8E2DA] shadow-xs hover:border-[#FF9B71] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#8B7E74] bg-[#FAF8F5] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Institusi
            </span>
          </div>
          <div className="text-3xl font-black text-[#2D2319] tracking-tight">{sekolahList.length}</div>
          <div className="text-xs text-[#8B7E74] mt-1 font-medium flex items-center justify-between">
            <span>{verifiedSekolah.length} aktif resmi</span>
            <span className="text-amber-600 font-bold">{pendingSekolah.length} pending</span>
          </div>
          <button
            onClick={() => onNavigateTab('sekolah')}
            className="mt-3.5 text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Data Sekolah</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8E2DA] shadow-xs hover:border-[#FF9B71] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#8B7E74] bg-[#FAF8F5] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Marketplace
            </span>
          </div>
          <div className="text-3xl font-black text-[#2D2319] tracking-tight">{projects.length}</div>
          <div className="text-xs text-[#8B7E74] mt-1 font-medium flex items-center justify-between">
            <span>{jasaList.length} etalase jasa</span>
            <span className="text-teal-700 font-bold">{akads.length} akad</span>
          </div>
          <button
            onClick={() => onNavigateTab('proyek')}
            className="mt-3.5 text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Monitoring Proyek</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2DA] shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#8B7E74] font-medium">Dana Escrow Terjamin</div>
              <div className="text-xl font-black text-[#2D2319] tabular-nums">{formatRupiah(totalDanaEscrow)}</div>
            </div>
          </div>
          <p className="text-[11px] text-[#8B7E74] mt-2">
            Dana proyek yang saat ini sedang diamankan di sistem rekening bersama sebelum penyelesaian karya.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2DA] shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#8B7E74] font-medium">Total Akumulasi Perputaran</div>
              <div className="text-xl font-black text-emerald-800 tabular-nums">{formatRupiah(totalVolumePerputaran)}</div>
            </div>
          </div>
          <p className="text-[11px] text-[#8B7E74] mt-2">
            Total perputaran modal dari akad proyek dan deposit UMKM terverifikasi di dalam ekosistem.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E8E2DA] shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#8B7E74] font-medium">Total Pencairan Siswa</div>
              <div className="text-xl font-black text-[#2D2319] tabular-nums">{formatRupiah(totalPencairanBerhasil)}</div>
            </div>
          </div>
          <p className="text-[11px] text-[#8B7E74] mt-2">
            Dana reward pengerjaan karya yang sukses dicairkan langsung ke e-wallet pelajar Indonesia.
          </p>
        </div>
      </div>

      <AdminFinancialAreaChart
        deposits={deposits}
        withdrawals={withdrawals}
        akads={akads}
        totalDanaEscrow={totalDanaEscrow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AdminCategoryBarChart
            categories={categoryStats}
            totalProjects={projects.length}
            onNavigateTab={onNavigateTab}
          />
        </div>

        <div className="lg:col-span-5">
          <AdminAkadDonutChart
            akads={akads}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#2D2319]">Live Audit Trail</h3>
              <p className="text-xs text-[#8B7E74]">Linimasa aktivitas terkini di dalam ekosistem</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Real-Time</span>
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto pr-1">
            {auditEvents.length > 0 ? (
              auditEvents.map((evt) => (
                <div key={evt.id} className="py-3 flex items-start justify-between gap-3 hover:bg-[#FAF8F5] p-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#2D2319] flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        evt.type === 'deposit' ? 'bg-amber-500' :
                        evt.type === 'withdrawal' ? 'bg-emerald-500' :
                        evt.type === 'akad' ? 'bg-blue-500' : 'bg-[#FF9B71]'
                      }`} />
                      <span>{evt.title}</span>
                    </div>
                    <p className="text-[11px] text-[#8B7E74] pl-4">{evt.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 font-medium block">{formatDate(evt.date)}</span>
                    <button
                      onClick={() => onNavigateTab(evt.targetTab)}
                      className="text-[10px] text-[#964825] font-bold hover:underline cursor-pointer"
                    >
                      Buka
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">Belum ada aktivitas terbaru</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#2D2319]">System Health Monitor</h3>
              <p className="text-xs text-[#8B7E74]">Koneksi layanan backend dan integrasi gateway</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Operasional
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">PostgreSQL / Supabase</div>
                  <div className="text-[10px] text-[#8B7E74]">Koneksi database pooler aktif</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">Pakasir Gateway</div>
                  <div className="text-[10px] text-[#8B7E74]">Webhook QRIS & Virtual Account</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">Resend Mail Engine</div>
                  <div className="text-[10px] text-[#8B7E74]">Pengiriman kode OTP & verifikasi</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EC] text-[#964825] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2319]">Google Gemini AI</div>
                  <div className="text-[10px] text-[#8B7E74]">Konsultasi kurikulum & asisten</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
