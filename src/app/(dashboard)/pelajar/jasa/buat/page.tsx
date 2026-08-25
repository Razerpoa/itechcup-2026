'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  UploadCloud,
  DollarSign,
  FileText,
  CheckCircle,
  ImageIcon,
  X,
  Sparkles,
  Check,
  Tag,
  Store,
  Layers
} from 'lucide-react'
import { cn, formatRupiah } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { addJasa } from '@/lib/jasa-store'

export default function BuatJasaPelajarPage() {
  const router = useRouter()
  const user = useAuthUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Desain Grafis')
  const [keteranganSingkat, setKeteranganSingkat] = useState('')
  const [keteranganPanjang, setKeteranganPanjang] = useState('')
  
  const [hargaBasic, setHargaBasic] = useState('150000')
  const [deskripsiBasic, setDeskripsiBasic] = useState('1 Konsep Desain HD + File PNG Transparan')
  
  const [hargaStandard, setHargaStandard] = useState('300000')
  const [deskripsiStandard, setDeskripsiStandard] = useState('2 Konsep Desain + Source File (PSD/AI/Figma)')
  
  const [hargaPremium, setHargaPremium] = useState('500000')
  const [deskripsiPremium, setDeskripsiPremium] = useState('3 Konsep Desain + Revisi Tanpa Batas + File Siap Cetak')

  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(['Desain Grafis', 'Branding'])
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const kategoriOptions = [
    'Desain Grafis',
    'Web Dev',
    'Video Editor',
    'Copywriting',
    'UI/UX',
    'Mobile App',
    '3D Illustration',
    'Digital Marketing'
  ]

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotoPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!judul.trim() || !keteranganSingkat.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      addJasa({
        pelajarId: user?.id || 'pelajar-active',
        namaPelajar: user?.nama || 'Pelajar Mitra Muda',
        fotoProfil: user?.fotoProfil || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(user?.nama || 'Siswa'),
        judul,
        keteranganSingkat,
        keteranganPanjang,
        kategori,
        tags: selectedTags,
        foto: fotoPreview || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
        hargaBasic: Number(hargaBasic) || 100000,
        deskripsiBasic,
        hargaStandard: hargaStandard ? Number(hargaStandard) : undefined,
        deskripsiStandard,
        hargaPremium: hargaPremium ? Number(hargaPremium) : undefined,
        deskripsiPremium
      })

      setIsSubmitting(false)
      setShowSuccessModal(true)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <header className="bg-white sticky top-0 z-30 border-b border-[#EAEAEA] px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/pelajar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-gray-900">Buat Listing Jasa Pelajar</h1>
            <p className="text-[11px] text-gray-500">Tampilkan keahlian terbaikmu di Marketplace Mitra Muda</p>
          </div>
        </div>

        <span className="text-xs font-bold bg-[#FFF1EB] text-[#964825] px-3.5 py-1.5 rounded-full border border-[#FFD9CA] hidden sm:inline-block">
          Modul Talenta Pelajar
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Informasi Utama */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-2xs space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-gray-900">Informasi Utama Jasa</h2>
                <p className="text-xs text-gray-500">Judul penawaran dan deskripsi kemampuan yang kamu tawarkan ke UMKM</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Judul Jasa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jasa Desain Logo & Identitas Branding UMKM"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full h-12 bg-[#F5F5F5] rounded-2xl px-4 text-xs sm:text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Kategori Keahlian <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full h-12 bg-[#F5F5F5] rounded-2xl px-4 text-xs sm:text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all cursor-pointer"
                  >
                    {kategoriOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Harga Mulai Dari (Basic) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                    <input
                      type="number"
                      required
                      min={50000}
                      step={25000}
                      placeholder="150000"
                      value={hargaBasic}
                      onChange={(e) => setHargaBasic(e.target.value)}
                      className="w-full h-12 bg-[#F5F5F5] rounded-2xl pl-10 pr-4 text-xs sm:text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Keterangan Singkat (Ringkasan) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan secara ringkas keunggulan jasa yang kamu berikan dalam 1-2 kalimat..."
                  value={keteranganSingkat}
                  onChange={(e) => setKeteranganSingkat(e.target.value)}
                  className="w-full p-4 bg-[#F5F5F5] rounded-2xl text-xs sm:text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Lengkap Jasa & Alur Kerja
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan rincian apa saja yang akan didapatkan UMKM, syarat/file yang perlu disiapkan UMKM, serta garansi revisi..."
                  value={keteranganPanjang}
                  onChange={(e) => setKeteranganPanjang(e.target.value)}
                  className="w-full p-4 bg-[#F5F5F5] rounded-2xl text-xs sm:text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all"
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tag Keahlian / Tools
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ketik tag (misal: Canva, Figma, Next.js) lalu tekan Tambah"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 h-11 bg-[#F5F5F5] rounded-2xl px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#964825] text-white rounded-2xl font-bold text-xs hover:bg-[#7a391c] transition-colors cursor-pointer"
                  >
                    Tambah Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1EB] text-[#964825] text-xs font-bold border border-[#FFD9CA]"
                    >
                      <Tag className="w-3 h-3 text-[#FF9B71]" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Paket Harga & Layanan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-2xs space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-gray-900">Rincian Paket Layanan</h2>
                <p className="text-xs text-gray-500">Tentukan cakupan berkas & revisi pada setiap tingkatan paket</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Paket Basic */}
              <div className="border border-[#FFD9CA] rounded-2xl p-5 bg-[#FFF7F3] space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#964825] uppercase tracking-wider">Paket Basic</span>
                  <span className="text-[10px] bg-[#FF9B71] text-white px-2 py-0.5 rounded-full font-bold">Wajib</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Harga Paket:</p>
                  <p className="text-lg font-extrabold text-[#964825]">{formatRupiah(Number(hargaBasic) || 0)}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Rincian Hasil Pekerjaan:</label>
                  <textarea
                    rows={3}
                    value={deskripsiBasic}
                    onChange={(e) => setDeskripsiBasic(e.target.value)}
                    placeholder="Contoh: 1 Konsep Desain HD + File PNG Transparan"
                    className="w-full p-2.5 bg-white border border-[#FFD9CA] rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  />
                </div>
              </div>

              {/* Paket Standard */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Paket Standard</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Opsional</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Harga Paket:</p>
                  <input
                    type="number"
                    value={hargaStandard}
                    onChange={(e) => setHargaStandard(e.target.value)}
                    placeholder="300000"
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Rincian Hasil Pekerjaan:</label>
                  <textarea
                    rows={3}
                    value={deskripsiStandard}
                    onChange={(e) => setDeskripsiStandard(e.target.value)}
                    placeholder="Contoh: 2 Konsep Desain + Source File Vector (AI/PSD)"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Paket Premium */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Paket Premium</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Opsional</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Harga Paket:</p>
                  <input
                    type="number"
                    value={hargaPremium}
                    onChange={(e) => setHargaPremium(e.target.value)}
                    placeholder="500000"
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Rincian Hasil Pekerjaan:</label>
                  <textarea
                    rows={3}
                    value={deskripsiPremium}
                    onChange={(e) => setDeskripsiPremium(e.target.value)}
                    placeholder="Contoh: 3 Konsep Desain + Paket Branding Lengkap"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Unggah Foto Cover */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-2xs space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-gray-900">Gambar Sampul Jasa</h2>
                <p className="text-xs text-gray-500">Unggah contoh visual hasil karyamu yang paling menarik</p>
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {fotoPreview ? (
                <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-gray-200 group">
                  <Image src={fotoPreview} alt="Preview Sampul" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-gray-900 rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-gray-100"
                    >
                      Ganti Gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setFotoPreview(null)}
                      className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#FF9B71] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-[#FFF7F3]/40 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-[#FF9B71]" />
                  </div>
                  <p className="font-extrabold text-sm text-gray-900">Klik untuk Mengunggah Sampul Jasa</p>
                  <p className="text-xs text-gray-400 mt-1">Format PNG, JPG, atau WEBP (Maksimal 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/pelajar"
              className="px-6 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mempublikasikan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publikasikan Jasa ke Marketplace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Jasa Berhasil Dipublikasikan!</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Penawaran jasa <strong>&ldquo;{judul}&rdquo;</strong> dengan harga mulai <strong>{formatRupiah(Number(hargaBasic))}</strong> kini tayang di Marketplace Mitra Muda & katalog profil Anda!
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="w-full py-3 bg-[#FF9B71] text-white font-bold text-xs rounded-full hover:bg-[#F5865A] transition-colors shadow-xs cursor-pointer"
              >
                Lihat di Marketplace
              </button>
              <button
                type="button"
                onClick={() => router.push('/pelajar')}
                className="w-full py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Kembali ke Dashboard Pelajar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
