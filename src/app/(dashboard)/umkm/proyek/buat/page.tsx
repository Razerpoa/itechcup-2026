'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  UploadCloud,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Image as ImageIcon,
  X,
  Sparkles,
  Check,
  Tag
} from 'lucide-react'
import { cn, formatRupiah, formatThousand, parseThousand } from '@/lib/utils'
import { addProject } from '@/lib/projects-store'
import { useAuthUser } from '@/lib/auth-client'

export default function BuatProyekPage() {
  const router = useRouter()
  const user = useAuthUser()
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user !== null && user !== undefined && user.isVerified === false) {
      router.replace('/umkm')
    }
  }, [user, router])

  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Desain Grafis')
  const [deskripsiSingkat, setDeskripsiSingkat] = useState('')
  const [deskripsiLengkap, setDeskripsiLengkap] = useState('')
  const [budget, setBudget] = useState('1000000')
  const [dpType, setDpType] = useState('30')
  const [durasi, setDurasi] = useState('7 Hari')
  const [selectedTags, setSelectedTags] = useState<string[]>(['Desain Grafis', 'Branding'])
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const availableTags = [
    'Desain Grafis',
    'Logo',
    'Branding',
    'Web Dev',
    'React',
    'UI/UX',
    'Video Editor',
    'TikTok',
    'Copywriting',
    'Instagram'
  ]

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBannerPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
      }))
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const numBudget = parseThousand(budget) || 1000000
    const namaUsaha = user?.namaUsaha || user?.nama || 'UMKM Indonesia'

    addProject({
      judul,
      keteranganSingkat: deskripsiSingkat,
      namaUsaha,
      budgetMin: Math.round(numBudget * 0.7),
      budgetMax: numBudget,
      dpPersen: Number(dpType) || 30,
      tags: selectedTags,
      fotoUsaha: bannerPreview || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(namaUsaha)}`,
      umkmId: user?.id,
      durasi: durasi || '7 Hari'
    })

    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccessModal(true)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center pb-24">
      <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] flex items-center justify-between px-4 sm:px-8 h-16 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/umkm"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Mitra Muda"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-cover border border-[#FFD9CA]"
              unoptimized
            />
            <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">Mitra Muda</h1>
          </div>
        </div>
        <Link
          href="/marketplace"
          className="px-4 py-2 rounded-full text-[#964825] font-bold hover:bg-[#FFF1EB] transition-colors text-xs"
        >
          Lihat Marketplace
        </Link>
      </header>

      <main className="w-full max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#964825] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#FF9B71]" />
              Formulir Kemitraan UMKM
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Buat Lowongan Proyek Baru
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Deskripsikan kebutuhan proyek Anda dengan jelas untuk menarik talenta pelajar terbaik.
            </p>
          </div>

          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAEAEA] flex flex-col gap-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">1. Informasi Dasar Proyek</h2>
                <p className="text-xs text-gray-500">Judul, kategori, dan foto utama proyek</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Judul Proyek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Desain Logo & Banner Menu Kafe Kopi Senja"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Kategori Keahlian <span className="text-red-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none cursor-pointer"
              >
                <option value="Desain Grafis">Desain Grafis & Branding</option>
                <option value="Web Development">Web Development & Frontend</option>
                <option value="UI/UX Design">UI/UX Design Mobile & Web</option>
                <option value="Video & Animasi">Video Editing & Reels/TikTok</option>
                <option value="Copywriting">Copywriting & Social Media</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Unggah Foto / Banner Proyek
              </label>

              <input
                type="file"
                ref={bannerInputRef}
                accept="image/*"
                className="sr-only"
                onChange={handleBannerUpload}
              />

              {bannerPreview ? (
                <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 group">
                  <Image
                    src={bannerPreview}
                    alt="Banner Proyek"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-gray-900 rounded-full font-bold text-xs hover:bg-gray-100 shadow-md cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPreview(null)}
                      className="px-4 py-2 bg-red-600 text-white rounded-full font-bold text-xs hover:bg-red-700 shadow-md cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="border-2 border-dashed border-[#FFD9CA] bg-[#FFF7F3] hover:bg-[#FFF1EB] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFD9CA] text-[#964825] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-[#964825] mb-0.5">
                    Klik untuk unggah foto atau banner proyek
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Format JPG, PNG, atau WEBP (Maksimal 5MB)
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAEAEA] flex flex-col gap-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">2. Rincian & Lingkup Pekerjaan</h2>
                <p className="text-xs text-gray-500">Jelaskan ekspektasi dan output yang Anda inginkan</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Deskripsi Singkat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={deskripsiSingkat}
                onChange={(e) => setDeskripsiSingkat(e.target.value)}
                placeholder="Rangkuman 1-2 kalimat tentang kebutuhan proyek"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Rincian Kebutuhan & Syarat Output (Scope of Work) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={deskripsiLengkap}
                onChange={(e) => setDeskripsiLengkap(e.target.value)}
                placeholder="Contoh:&#10;1. Desain menu cetak A3 & versi digital PDF&#10;2. Source file Figma / Photoshop diserahkan&#10;3. Revisi maksimal 3 kali"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-xl p-4 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#FF9B71]" />
                <span>Tag Keahlian</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border",
                        isSelected
                          ? "bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-2xs"
                          : "bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-[#FF9B71]" />}
                      <span>{tag}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Unggah File / Dokumen Brief Pendukung (Opsional)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf,.doc,.docx,.zip"
                multiple
                className="sr-only"
                onChange={handleFilesUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#FF9B71] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#FFFDFB] group"
              >
                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#FF9B71] transition-colors mb-1.5" />
                <p className="text-xs font-bold text-gray-700">
                  Tarik & lepas file ke sini, atau <span className="text-[#964825] underline">Pilih File dari Perangkat</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Maksimal 10MB per file. Format: PDF, JPG, PNG, DOCX, ZIP
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="font-bold text-gray-900 truncate">{file.name}</span>
                        <span className="text-gray-400">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUploadedFile(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAEAEA] flex flex-col gap-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">3. Anggaran & Ketentuan Pembayaran</h2>
                <p className="text-xs text-gray-500">Tentukan budget dan skema uang muka (DP) escrow aman</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Total Anggaran Proyek (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatThousand(budget)}
                  onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))}
                  placeholder="1.000.000"
                  className="w-full bg-[#F5F5F5] border border-transparent rounded-xl pl-12 pr-4 py-3.5 text-base font-extrabold text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Skema Uang Muka (DP) Escrow
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'DP 30%', val: '30' },
                  { label: 'DP 50%', val: '50' },
                  { label: 'Tanpa DP', val: '0' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setDpType(item.val)}
                    className={cn(
                      "py-3 px-4 rounded-xl font-bold text-xs transition-all border cursor-pointer",
                      dpType === item.val
                        ? "bg-[#FFF1EB] text-[#964825] border-[#FF9B71] shadow-2xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Durasi Pengerjaan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
                {['3 Hari', '7 Hari', '14 Hari', '30 Hari'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurasi(d)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer text-center",
                      durasi === d
                        ? "bg-[#FFF1EB] text-[#964825] border-[#FF9B71] shadow-2xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 7 Hari atau 2 Minggu"
                  value={durasi}
                  onChange={(e) => setDurasi(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-[#FF9B71] focus:ring-2 focus:ring-[#FFD9CA] outline-none transition-all"
                />
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4">
            <Link
              href="/umkm"
              className="px-6 py-3.5 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] active:bg-[#E8754D] transition-all shadow-xs cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Mempublikasikan...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publikasikan Lowongan Proyek</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Proyek Berhasil Dipublikasikan!
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Lowongan proyek <strong>&ldquo;{judul}&rdquo;</strong> dengan anggaran <strong>{formatRupiah(Number(budget))}</strong> kini tayang di Marketplace Mitra Muda. Pelajar bertalenta akan segera mengajukan lamaran!
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
                onClick={() => router.push('/umkm')}
                className="w-full py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Kembali ke Dashboard UMKM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
