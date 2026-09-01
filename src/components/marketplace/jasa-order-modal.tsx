'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  X,
  MessageCircle,
  CheckCircle,
  ShieldCheck,
  Briefcase,
  Star,
  Send,
  Layers,
  Sparkles
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

export interface JasaOrderModalProps {
  isOpen: boolean
  onClose: () => void
  jasa: {
    id: string | number
    pelajarId?: string
    namaPelajar: string
    fotoProfil?: string
    sekolah?: string
    nomorWa?: string
    judul: string
    kategori: string
    hargaBasic: number
    deskripsiBasic?: string
    hargaStandard?: number
    deskripsiStandard?: string
    hargaPremium?: number
    deskripsiPremium?: string
    ratingRata?: number
    jumlahProyekSelesai?: number
  } | null
}

export default function JasaOrderModal({ isOpen, onClose, jasa }: JasaOrderModalProps) {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [briefPesan, setBriefPesan] = useState('')

  if (!isOpen || !jasa) return null

  const selectedHarga =
    selectedTier === 'premium' && jasa.hargaPremium
      ? jasa.hargaPremium
      : selectedTier === 'standard' && jasa.hargaStandard
      ? jasa.hargaStandard
      : jasa.hargaBasic

  const selectedDeskripsi =
    selectedTier === 'premium' && jasa.deskripsiPremium
      ? jasa.deskripsiPremium
      : selectedTier === 'standard' && jasa.deskripsiStandard
      ? jasa.deskripsiStandard
      : jasa.deskripsiBasic || '1 Konsep pengerjaan profesional sesuai kesepakatan'

  const rawPhone = (jasa.nomorWa || '081234567890').replace(/\D/g, '')
  const formattedPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone.startsWith('62') ? rawPhone : '62' + rawPhone

  const waMessage = encodeURIComponent(
    `Halo ${jasa.namaPelajar}! Saya melihat penawaran jasa Anda di Mitra Muda:
*Jasa:* ${jasa.judul}
*Paket Dipilih:* ${selectedTier.toUpperCase()} (${formatRupiah(selectedHarga)})
*Rincian:* ${selectedDeskripsi}
${briefPesan.trim() ? `\n*Catatan Kebutuhan:* ${briefPesan.trim()}` : ''}

Apakah Anda sedang open order dan bersedia mendiskusikan kerja sama ini? Terima kasih!`
  )

  const waUrl = `https://wa.me/${formattedPhone}?text=${waMessage}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 leading-tight">Hubungi & Pesan Jasa Pelajar</h3>
              <p className="text-[11px] text-gray-500">Kolaborasi aman langsung dengan siswa berbakat</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Info Pelajar */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#FAF8F5] rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full overflow-hidden relative border border-gray-200 bg-white shrink-0">
              {jasa.fotoProfil ? (
                <Image src={jasa.fotoProfil} alt={jasa.namaPelajar} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold">
                  {jasa.namaPelajar.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-gray-900 truncate">{jasa.namaPelajar}</h4>
                <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-bold shrink-0">
                  <CheckCircle className="w-3 h-3" />
                  <span>Siswa Vokasi</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{jasa.sekolah || 'SMK / SMA Terdaftar'}</p>
              <p className="text-xs font-bold text-[#964825] truncate mt-0.5">{jasa.judul}</p>
            </div>
          </div>

          {/* Pilihan Paket Layanan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Pilih Paket Layanan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Basic */}
              <button
                type="button"
                onClick={() => setSelectedTier('basic')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedTier === 'basic'
                    ? 'border-[#FF9B71] bg-[#FFF7F3] shadow-xs ring-2 ring-[#FF9B71]/30'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="block text-[10px] font-extrabold uppercase text-[#964825]">Basic</span>
                <span className="block font-extrabold text-sm text-gray-900 mt-0.5">
                  {formatRupiah(jasa.hargaBasic)}
                </span>
              </button>

              {/* Standard */}
              {jasa.hargaStandard ? (
                <button
                  type="button"
                  onClick={() => setSelectedTier('standard')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTier === 'standard'
                      ? 'border-[#FF9B71] bg-[#FFF7F3] shadow-xs ring-2 ring-[#FF9B71]/30'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-[10px] font-extrabold uppercase text-gray-600">Standard</span>
                  <span className="block font-extrabold text-sm text-gray-900 mt-0.5">
                    {formatRupiah(jasa.hargaStandard)}
                  </span>
                </button>
              ) : null}

              {/* Premium */}
              {jasa.hargaPremium ? (
                <button
                  type="button"
                  onClick={() => setSelectedTier('premium')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTier === 'premium'
                      ? 'border-[#FF9B71] bg-[#FFF7F3] shadow-xs ring-2 ring-[#FF9B71]/30'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-[10px] font-extrabold uppercase text-purple-700">Premium</span>
                  <span className="block font-extrabold text-sm text-gray-900 mt-0.5">
                    {formatRupiah(jasa.hargaPremium)}
                  </span>
                </button>
              ) : null}
            </div>

            {/* Rincian paket yang dipilih */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700 space-y-1 mt-2">
              <span className="font-bold text-gray-900 block">Cakupan Paket {selectedTier.toUpperCase()}:</span>
              <p className="text-gray-600 leading-relaxed">{selectedDeskripsi}</p>
            </div>
          </div>

          {/* Catatan / Kebutuhan Tambahan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Catatan Kebutuhan Proyek (Opsional):
            </label>
            <textarea
              rows={3}
              value={briefPesan}
              onChange={(e) => setBriefPesan(e.target.value)}
              placeholder="Contoh: Butuh desain banner ukuran 2x1 meter untuk gerai kopi, deadline minggu ini..."
              className="w-full p-3 bg-[#FAF8F5] border border-gray-200 focus:border-[#FF9B71] rounded-2xl text-xs outline-none resize-none text-gray-900"
            />
          </div>

          {/* Jaminan Keamanan Escrow */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Transaksi dilindungi <strong>Escrow Mitra Muda</strong> (0% potongan komisi untuk siswa).
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-2.5 bg-gray-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp Siswa</span>
          </a>
        </div>
      </div>
    </div>
  )
}
