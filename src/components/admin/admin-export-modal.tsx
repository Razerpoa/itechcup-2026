'use client'

import React from 'react'
import { X, Download, FileSpreadsheet, Wallet, GraduationCap, Store, Building2, ShieldAlert } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { ProyekItem } from '@/lib/projects-store'
import { JasaItem } from '@/lib/jasa-store'
import { AkadTransaksiItem } from '@/lib/akad-store'

interface AdminExportModalProps {
  isOpen: boolean
  onClose: () => void
  pelajarList: any[]
  sekolahList: any[]
  umkmList: any[]
  deposits: any[]
  withdrawals: any[]
  escrows: any[]
  akads: AkadTransaksiItem[]
  projects: ProyekItem[]
  jasaList: JasaItem[]
}

export default function AdminExportModal({
  isOpen,
  onClose,
  pelajarList,
  sekolahList,
  umkmList,
  deposits,
  withdrawals,
  escrows,
  akads,
  projects
}: AdminExportModalProps) {
  if (!isOpen) return null

  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportKeuangan = () => {
    const headers = [
      'Tipe Transaksi',
      'ID Referensi',
      'Nama Entitas',
      'Nominal',
      'Metode / Saluran',
      'Status',
      'Tanggal Transaksi'
    ]
    const rows: (string | number)[][] = []

    deposits.forEach(d => {
      rows.push([
        'Deposit Modal UMKM',
        d.id,
        d.namaUsaha,
        d.nominal,
        d.bankTujuan || 'Transfer Bank',
        d.status,
        formatDate(d.createdAt)
      ])
    })

    withdrawals.forEach(w => {
      rows.push([
        'Pencairan Saldo Siswa',
        w.id,
        w.namaPelajar,
        w.nominal,
        `${w.eWalletType} (${w.eWalletNomor})`,
        w.status,
        formatDate(w.createdAt)
      ])
    })

    escrows.forEach(e => {
      rows.push([
        'Dana Escrow Proyek',
        e.id,
        `${e.namaUsaha} -> ${e.namaPelajar}`,
        e.nominalTotal,
        `DP Escrow: ${e.nominalDP}`,
        e.dpStatus,
        formatDate(e.createdAt)
      ])
    })

    downloadCsv(`rekap_keuangan_escrow_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const exportPelajar = () => {
    const headers = [
      'ID Siswa',
      'Nama Lengkap',
      'Email',
      'Nomor WhatsApp',
      'NIS',
      'Asal Sekolah',
      'Tingkatan Kelas',
      'Tempat Lahir',
      'Nama Ibu',
      'Status Verifikasi',
      'Tanggal Daftar'
    ]
    const rows = pelajarList.map(p => [
      p.id,
      p.namaLengkap,
      p.email,
      p.nomorWa || '-',
      p.nis || '-',
      p.asalSekolah,
      p.kelas || '-',
      p.tempatLahir || '-',
      p.namaIbu || '-',
      p.verificationStatus,
      formatDate(p.createdAt)
    ])
    downloadCsv(`data_verifikasi_pelajar_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const exportUMKM = () => {
    const headers = [
      'ID UMKM',
      'Nama Usaha',
      'Nama Pemilik',
      'Kategori Usaha',
      'Nomor WhatsApp',
      'Email',
      'Alamat Usaha',
      'Status Legalitas',
      'Tanggal Daftar'
    ]
    const rows = umkmList.map(u => [
      u.id,
      u.namaUsaha,
      u.namaPemilik,
      u.kategori || '-',
      u.nomorWa,
      u.email,
      u.alamat || '-',
      u.isVerified ? 'Terverifikasi' : 'Menunggu',
      formatDate(u.createdAt)
    ])
    downloadCsv(`data_mitra_umkm_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const exportSekolah = () => {
    const headers = [
      'ID Sekolah',
      'Nama Lembaga Sekolah',
      'NPSN',
      'Penanggung Jawab',
      'Email Resmi',
      'Kontak Sekolah',
      'Alamat Lengkap',
      'Status Verifikasi',
      'Tanggal Daftar'
    ]
    const rows = sekolahList.map(s => [
      s.id,
      s.namaSekolah,
      s.npsn,
      s.namaPenanggungJawab,
      s.emailResmi,
      s.kontakSekolah || '-',
      s.alamatLengkap || '-',
      s.verificationStatus,
      formatDate(s.createdAt)
    ])
    downloadCsv(`data_lembaga_sekolah_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const exportAkad = () => {
    const headers = [
      'ID Akad',
      'Judul Proyek',
      'Nama UMKM',
      'Nama Pelajar',
      'Asal Sekolah',
      'Nilai Kontrak',
      'Nominal DP Escrow',
      'Tahapan (Step)',
      'Status Pekerjaan',
      'Jumlah Berkas Karya',
      'Tanggal Pembuatan'
    ]
    const rows = akads.map(a => [
      a.id,
      a.judulProyek,
      a.namaUsaha,
      a.namaPelajar,
      a.sekolahNama || '-',
      a.nominalTotal,
      a.nominalDP,
      `Tahap ${a.step} dari 4`,
      a.step === 4 ? 'Selesai & Lunas' : a.step === 3 ? 'Review Hasil' : a.step === 2 ? 'Pengerjaan' : 'Awal Akad',
      a.deliverables ? a.deliverables.length : 0,
      formatDate(a.createdAt)
    ])
    downloadCsv(`rekap_transaksi_akad_proyek_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const exportProyek = () => {
    const headers = [
      'ID Proyek',
      'Judul Proyek',
      'Nama UMKM',
      'Budget Minimum',
      'Budget Maximum',
      'Persentase DP',
      'Jumlah Pelamar',
      'Keahlian / Tags',
      'Tanggal Dibuat'
    ]
    const rows = projects.map(p => [
      p.id,
      p.judul,
      p.namaUsaha,
      p.budgetMin,
      p.budgetMax,
      `${p.dpPersen}%`,
      p.jumlahPelamar,
      (p.tags || []).join('; '),
      formatDate(p.createdAt)
    ])
    downloadCsv(`data_proyek_marketplace_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2DA] space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4EC] border border-[#FFE0D2] flex items-center justify-center text-[#964825]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D2319]">Pusat Ekspor Laporan Data</h3>
              <p className="text-xs text-[#8B7E74]">Unduh data sistem Mitra Muda dalam format spreadsheet CSV resmi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportKeuangan}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Rekap Keuangan & Escrow</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">Mutasi deposit, penarikan siswa, dan jaminan dana</div>
          </button>

          <button
            onClick={exportAkad}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Akad Transaksi Proyek</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">Nilai kontrak, termin DP, dan progres karya</div>
          </button>

          <button
            onClick={exportPelajar}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF4EC] text-[#964825] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Data Verifikasi Pelajar</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">Daftar siswa, NIS, asal sekolah, dan status berkas</div>
          </button>

          <button
            onClick={exportUMKM}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Data Mitra UMKM</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">Identitas usaha, nomor WhatsApp, dan legalitas</div>
          </button>

          <button
            onClick={exportSekolah}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Data Lembaga Sekolah</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">NPSN, penanggung jawab, dan email resmi instansi</div>
          </button>

          <button
            onClick={exportProyek}
            className="p-4 rounded-2xl border border-[#E8E2DA] bg-[#FAF8F5] hover:bg-white hover:border-[#FF9B71] hover:shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF9B71] transition-colors" />
            </div>
            <div className="font-bold text-xs text-[#2D2319]">Katalog Proyek Terbuka</div>
            <div className="text-[11px] text-[#8B7E74] mt-0.5">Daftar tawaran kerja sama proyek UMKM aktif</div>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
