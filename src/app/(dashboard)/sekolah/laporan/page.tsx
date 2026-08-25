'use client'

import React from 'react'
import { Award, Download, TrendingUp, Sparkles, Building2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'

export default function LaporanKinerjaPage() {
  const user = useAuthUser()
  const namaSekolah = user?.namaSekolah || 'Sekolah Terdaftar Mitra Muda'
  const totalPendapatan = 0
  const totalProyekSelesai = 0
  const topStudents: Array<{ rank: number; name: string; jurusan: string; projects: number; earnings: number; rating: number }> = []

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#964825] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#FF9B71]" />
            <span>{namaSekolah}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Laporan Kinerja & Prestasi Siswa
          </h1>
        </div>
        <button className="border-2 border-[#FF9B71] text-[#964825] px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#FFF1EB] transition-colors w-fit cursor-pointer">
          <Download className="w-4 h-4" />
          <span>Export Laporan</span>
        </button>
      </div>

      <section className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe3d6] rounded-3xl p-6 sm:p-8 flex flex-col gap-2 relative overflow-hidden border border-[#FFD9CA] shadow-xs">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF9B71]/20 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-xs font-extrabold text-[#964825] uppercase tracking-wider">Total Pendapatan Kolektif Siswa</h2>
        <div className="text-3xl sm:text-4xl font-extrabold text-[#964825]">{formatRupiah(totalPendapatan)}</div>
        <div className="text-sm font-semibold text-[#70351b] mt-1">
          {totalProyekSelesai} Proyek UMKM telah diselesaikan oleh siswa
        </div>
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xs rounded-full py-1.5 px-4 mt-3 self-start border border-white/60">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9B71]" />
          <span className="text-xs font-bold text-gray-800">Sistem Escrow Terverifikasi</span>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Top Siswa Berprestasi</h3>
            <p className="text-xs text-gray-500">Peringkat siswa berdasarkan jumlah proyek dan ulasan mitra UMKM</p>
          </div>
        </div>

        {topStudents.length > 0 ? (
          <div className="space-y-3">
            {topStudents.map((student) => (
              <div
                key={student.rank}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#FFF7F3] border border-gray-100 hover:border-[#FFD9CA] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${student.rank === 1 ? 'bg-[#FFD9CA] text-[#964825]' : 'bg-gray-100 text-gray-500'}`}>
                    {student.rank}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm">{student.name}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#964825] text-[10px] font-bold mt-1 uppercase">
                      {student.jurusan}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-xs">{student.projects} Proyek</p>
                    <p className="text-xs text-gray-500 font-semibold">{formatRupiah(student.earnings)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
            <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="text-base font-extrabold text-gray-900 mb-1">Belum Ada Riwayat Prestasi Siswa</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Setelah siswa menyelesaikan proyek UMKM pertama mereka, metrik kinerja dan pendapatan kolektif sekolah akan otomatis terakumulasi di sini.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
