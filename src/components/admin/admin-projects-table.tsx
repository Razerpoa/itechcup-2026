'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Briefcase, ExternalLink, Search, Trash2, Users, Tag, Filter, CheckCircle2 } from 'lucide-react'
import { ProyekItem, removeProject } from '@/lib/projects-store'
import { formatRupiah, formatDate } from '@/lib/utils'

interface AdminProjectsTableProps {
  projects: ProyekItem[]
  onSuccessMessage: (msg: string) => void
}

export default function AdminProjectsTable({ projects, onSuccessMessage }: AdminProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const tagsList = ['ALL', 'Desain Grafis', 'Web Development', 'UI/UX', 'Media Sosial', 'Video Editing']

  const filtered = projects.filter(p => {
    const matchSearch =
      p.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))

    if (!matchSearch) return false

    if (filterTag === 'ALL') return true
    return (p.tags || []).some(t => t.toLowerCase().includes(filterTag.toLowerCase()))
  })

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus atau tutup proyek "${title}" dari marketplace publik?`)) return
    setDeletingId(id)
    try {
      await removeProject(id)
      onSuccessMessage(`Proyek "${title}" berhasil dihapus dari marketplace`)
    } catch {
      alert('Gagal menghapus proyek')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#2D2319] tracking-tight">Monitoring Proyek UMKM</h3>
          <p className="text-xs text-[#8B7E74] mt-0.5">
            Daftar seluruh tawaran proyek yang diajukan mitra UMKM di bursa kerja sama talenta pelajar
          </p>
        </div>
        <span className="text-xs font-bold bg-white text-[#2D2319] px-3.5 py-1.5 rounded-xl border border-[#E8E2DA] shadow-xs self-start sm:self-auto">
          {projects.length} Proyek Terdaftar
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2DA] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#B5ADA4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul proyek atau UMKM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[#FAF8F5] border border-[#E0DAD2] rounded-xl text-xs text-[#2D2319] placeholder:text-[#B5ADA4] focus:outline-none focus:border-[#FF9B71] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#8B7E74] shrink-0 mr-1" />
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterTag === tag
                  ? 'bg-[#2D2319] text-white'
                  : 'bg-[#FAF8F5] text-[#8B7E74] hover:bg-[#F0EBE4] border border-[#E8E2DA]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2DA] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA]">
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Proyek & UMKM</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Anggaran & DP</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Pelamar</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Keahlian / Kategori</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#8B7E74] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE4]">
              {filtered.length > 0 ? (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="px-5 py-4 align-top max-w-xs">
                      <div className="font-bold text-[#2D2319] text-sm leading-snug">{p.judul}</div>
                      <div className="text-xs text-[#8B7E74] font-medium mt-0.5">{p.namaUsaha}</div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.keteranganSingkat}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="text-[#2D2319] font-bold tabular-nums">
                        {formatRupiah(p.budgetMin)} - {formatRupiah(p.budgetMax)}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1 w-fit">
                        DP Escrow: {p.dpPersen}%
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D2319] bg-[#FAF8F5] border border-[#E8E2DA] px-2.5 py-1 rounded-xl">
                        <Users className="w-3.5 h-3.5 text-[#8B7E74]" />
                        <span>{p.jumlahPelamar} Pelamar</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(p.tags || []).map(t => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B7E74] bg-[#FAF8F5] border border-[#E8E2DA] px-2 py-0.5 rounded-md"
                          >
                            <Tag className="w-2.5 h-2.5 text-[#B5ADA4]" />
                            <span>{t}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-xs text-[#8B7E74] whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-5 py-4 align-top text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/marketplace/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 border border-[#E8E2DA] bg-white hover:bg-[#FAF8F5] text-[#2D2319] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3 text-[#8B7E74]" />
                        <span>Lihat</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.judul)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8B7E74]">
                    <div className="w-12 h-12 rounded-2xl bg-[#F6F3EE] flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-[#B5ADA4]" />
                    </div>
                    Tidak ada proyek ditemukan
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
