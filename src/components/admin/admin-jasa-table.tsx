'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ExternalLink, Search, Star, Filter, CheckCircle2 } from 'lucide-react'
import { JasaItem } from '@/lib/jasa-store'
import { formatRupiah, formatDate } from '@/lib/utils'

interface AdminJasaTableProps {
  jasaList: JasaItem[]
  onSuccessMessage: (msg: string) => void
}

export default function AdminJasaTable({ jasaList }: AdminJasaTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  const categories = ['ALL', 'Desain Grafis', 'Web & Pemrograman', 'Pemasaran Digital', 'Video & Animasi', 'Penulisan']

  const filtered = jasaList.filter(j => {
    const matchSearch =
      j.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.kategori && j.kategori.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchSearch) return false

    if (filterCategory === 'ALL') return true
    return j.kategori?.toLowerCase().includes(filterCategory.toLowerCase())
  })

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Katalog Jasa Talenta Pelajar</h3>
          <p className="text-xs text-[#8B7E74] mt-0.5">
            Daftar penawaran portofolio dan jasa kreatif siswa di etalase publik marketplace Mitra Muda
          </p>
        </div>
        <span className="text-xs font-bold bg-white text-[#2D2319] px-3.5 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs self-start sm:self-auto">
          {jasaList.length} Jasa Aktif
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2DA] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#B5ADA4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari jasa atau nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[#FAF8F5] border border-[#E0DAD2] rounded-xl text-xs text-[#2D2319] placeholder:text-[#B5ADA4] focus:outline-none focus:border-[#FF9B71] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#8B7E74] shrink-0 mr-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#2D2319] text-white'
                  : 'bg-[#FAF8F5] text-[#8B7E74] hover:bg-[#F0EBE4] border border-[#E8E2DA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Jasa & Pelajar</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Kategori</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tarif Paket</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Rating & Portofolio</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tanggal Terbit</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE4]">
              {filtered.length > 0 ? (
                filtered.map(j => (
                  <tr key={j.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="px-5 py-4 align-top max-w-xs">
                      <div className="font-bold text-[#2D2319] text-sm leading-snug">{j.judul}</div>
                      <div className="text-xs text-[#8B7E74] font-medium mt-0.5">{j.namaPelajar}</div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {j.keteranganSingkat}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <span className="inline-flex items-center text-xs font-semibold text-[#964825] bg-[#FFF4EC] border border-[#FFE0D2] px-2.5 py-0.5 rounded-lg">
                        {j.kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#2D2319]">
                          Mulai {formatRupiah(j.hargaBasic)}
                        </div>
                        {j.hargaStandard && (
                          <div className="text-[10px] text-[#8B7E74]">
                            Std: {formatRupiah(j.hargaStandard)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{j.ratingRata ? j.ratingRata.toFixed(1) : '5.0'}</span>
                      </div>
                      <div className="text-[11px] text-[#8B7E74] mt-0.5">
                        {j.jumlahProyekSelesai || 0} proyek terselesaikan
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-xs text-[#8B7E74] whitespace-nowrap">
                      {formatDate(j.createdAt)}
                    </td>
                    <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                      <Link
                        href={`/marketplace/${j.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 border border-[#E8E2DA] bg-white hover:bg-[#FAF8F5] text-[#2D2319] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3 text-[#8B7E74]" />
                        <span>Lihat Publik</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                    <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-[#B5ADA4]" />
                    </div>
                    Tidak ada data jasa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
