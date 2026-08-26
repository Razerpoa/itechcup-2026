'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  CheckCircle,
  MapPin,
  Globe,
  X,
  User,
  Wallet,
  ShieldCheck,
  LogOut,
  Check,
  Save,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Briefcase
} from 'lucide-react'
import JasaCard from '@/components/marketplace/jasa-card'
import { useAuthUser, logoutUser, setCurrentUser } from '@/lib/auth-client'
import { useAkadStore, syncAkadWithDB } from '@/lib/akad-store'
import { useJasaStore } from '@/lib/jasa-store'
import TwoFactorModal from '@/components/two-factor-modal'
import { formatDate } from '@/lib/utils'

export default function ProfilPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = (params?.id as string) || ''
  const user = useAuthUser()
  const akadState = useAkadStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'edit'>('menu')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)

  useEffect(() => {
    syncAkadWithDB()
  }, [])

  const [customProfile, setCustomProfile] = useState<{
    nama?: string
    lokasi?: string
    bio?: string
    foto?: string
    cover?: string
    nomorWa?: string
    skills?: string[]
  }>({})

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const nama = customProfile.nama || user?.nama || 'Profil Talenta Pelajar'
  const sekolah = user?.sekolah || 'SMK / SMA Terdaftar'
  const lokasi = customProfile.lokasi || 'Indonesia'
  const foto = customProfile.foto || user?.fotoProfil || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(nama))
  const cover = customProfile.cover || ''
  const nomorWa = customProfile.nomorWa || user?.nomorWa || ''
  
  const completedAkad = akadState.akadList.filter((a) => a.step === 4)
  const proyekSelesai = completedAkad.length
  const rating = proyekSelesai > 0
    ? (completedAkad.reduce((acc, a) => acc + (a.rating || 5), 0) / proyekSelesai).toFixed(1)
    : '0.0'
  const tepatWaktu = proyekSelesai > 0 ? (user?.onTimeRate ?? 100) : 0
  const skills = user?.skills && user.skills.length > 0 ? user.skills : (customProfile.skills || ['Web Dev', 'UI/UX'])
  const bio = customProfile.bio || 'Pelajar berbakat yang siap berkarya dan membantu UMKM Indonesia go digital!'

  const [editForm, setEditForm] = useState({
    nama: nama,
    lokasi: lokasi,
    bio: bio,
    foto: foto,
    cover: cover,
    nomorWa: nomorWa
  })

  const allJasa = useJasaStore()
  const myJasa = allJasa.filter((j: any) => (user?.id && j.pelajarId === user.id) || (user?.nama && j.namaPelajar && j.namaPelajar.toLowerCase() === user.nama.toLowerCase()))

  const userJasa = myJasa

  const userPortfolio: number[] = []

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditForm((prev) => ({ ...prev, foto: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditForm((prev) => ({ ...prev, cover: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustomProfile({
      nama: editForm.nama,
      lokasi: editForm.lokasi,
      bio: editForm.bio,
      foto: editForm.foto,
      cover: editForm.cover,
      nomorWa: editForm.nomorWa
    })

    if (user) {
      const updatedUser = {
        ...user,
        nama: editForm.nama,
        nomorWa: editForm.nomorWa,
        fotoProfil: editForm.foto
      }
      setCurrentUser(updatedUser)

      // Also update all-users registry
      try {
        const raw = localStorage.getItem('mitra_muda_all_registered_users_v1')
        if (raw) {
          const list = JSON.parse(raw)
          const updatedList = list.map((u: any) =>
            u.id === user.id || u.email === user.email
              ? { ...u, nama: editForm.nama, nomorWa: editForm.nomorWa, fotoProfil: editForm.foto }
              : u
          )
          localStorage.setItem('mitra_muda_all_registered_users_v1', JSON.stringify(updatedList))
        }
      } catch {}

      // Update PostgreSQL Database via API
      try {
        await fetch(`/api/pelajar/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namaLengkap: editForm.nama,
            nomorWa: editForm.nomorWa,
            bio: editForm.bio,
            fotoProfil: editForm.foto
          })
        })
      } catch {}
    }

    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      setActiveTab('menu')
      setIsSettingsOpen(false)
    }, 1000)
  }

  const handleLogout = () => {
    logoutUser()
    setIsSettingsOpen(false)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 flex justify-between items-center px-4 md:px-8 h-16">
        <Link href="/marketplace" className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight">Mitra Muda</h1>
        <button
          onClick={() => {
            setEditForm({ nama, lokasi, bio, foto, cover, nomorWa })
            setActiveTab('menu')
            setIsSettingsOpen(true)
          }}
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-[#964825] hover:bg-[#FFF1EB] rounded-full transition-colors cursor-pointer"
          title="Pengaturan Profil"
          aria-label="Pengaturan Profil"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-gray-100 bg-white">
          <div className="h-44 sm:h-64 w-full relative bg-gradient-to-r from-[#FFD9CA] via-[#FFEADB] to-[#FFF1EB] group">
            {cover ? (
              <>
                <Image src={cover} alt="Cover" fill className="object-cover" priority unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9B71]/20 via-[#FFF1EB] to-[#FFF7F3] flex items-center justify-center opacity-60">
                <div className="w-full h-full bg-[radial-gradient(#FF9B71_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              </div>
            )}
            <button
              onClick={() => {
                setEditForm({ nama, lokasi, bio, foto, cover, nomorWa })
                setActiveTab('edit')
                setIsSettingsOpen(true)
              }}
              className="absolute right-4 top-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF9B71]" />
              <span>Ganti Sampul</span>
            </button>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-md overflow-hidden bg-white relative shrink-0 group">
                  <Image src={foto} alt={nama} fill className="object-cover" unoptimized />
                  <button
                    onClick={() => {
                      setEditForm({ nama, lokasi, bio, foto, cover, nomorWa })
                      setActiveTab('edit')
                      setIsSettingsOpen(true)
                    }}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Ubah Foto Profil"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{nama}</h2>
                    {user?.isVerified || user?.verificationStatus === 'VERIFIED' ? (
                      <span className="text-teal-600 bg-teal-50 p-1 rounded-full flex items-center justify-center" title="Terverifikasi Sekolah">
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold border border-amber-200" title="Menunggu Verifikasi Sekolah">
                        <span>Menunggu Verifikasi Sekolah</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{sekolah}</p>
                  <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {lokasi}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Link
                  href="/pelajar/dompet"
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  Lihat Dompet
                </Link>
                <button
                  onClick={() => {
                    setEditForm({ nama, lokasi, bio, foto, cover, nomorWa })
                    setActiveTab('edit')
                    setIsSettingsOpen(true)
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-2xs cursor-pointer"
                >
                  Edit Profil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 py-5 px-4 sm:px-6 bg-[#FAFAFA] rounded-2xl border border-gray-100 text-center mb-8">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</p>
                <p className="text-lg sm:text-2xl font-extrabold text-[#964825] mt-0.5">⭐ {rating}</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Proyek Selesai</p>
                <p className="text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5">{proyekSelesai}</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Tepat Waktu</p>
                <p className="text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5">{tepatWaktu}%</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">Tentang Saya</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">Keahlian</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span key={skill} className="px-3.5 py-1.5 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs border border-[#FFD9CA]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Katalog Jasa yang Ditawarkan</h3>
          </div>

          {userJasa.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userJasa.map((jasa: any) => (
                <JasaCard key={jasa.id} {...jasa} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto font-bold">
                <Briefcase className="w-6 h-6 text-[#FF9B71]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">Belum Ada Katalog Jasa</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Akun pelajar ini belum mempublikasikan penawaran jasa. Jasa yang dipublikasikan akan tampil di katalog ini dan halaman Marketplace.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 space-y-6">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Portofolio & Hasil Karya</h3>
          
          {userPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {userPortfolio.map((item) => (
                <div key={item} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs group hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gray-100 relative">
                    <Image
                      src={`https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop`}
                      alt="Portofolio"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-gray-900">Website UMKM Kopi Senja #{item}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-gray-400" /> Live Demo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto font-bold">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">Belum Ada Portofolio Karya</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Hasil pekerjaan dan karya dari proyek yang telah diselesaikan di Mitra Muda akan otomatis ditampilkan di bagian portofolio ini.
                </p>
              </div>
            </div>
          )}
        </section>

        {completedAkad.length > 0 && (
          <section className="mt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Testimoni & Ulasan Klien UMKM ({completedAkad.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAkad.map((akad) => (
                <div
                  key={akad.id}
                  className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                        {Array.from({ length: akad.rating || 5 }).map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                        <span className="text-xs text-gray-600 font-extrabold ml-1">({akad.rating || 5}.0)</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {akad.completedAt ? formatDate(akad.completedAt) : formatDate(akad.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed italic bg-[#FFF1EB] p-3.5 rounded-2xl border border-[#FFD9CA]">
                      &ldquo;{akad.ulasan || 'Pekerjaan diselesaikan dengan sangat baik sesuai spesifikasi.'}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{akad.namaUsaha}</p>
                      <p className="text-[11px] text-gray-400">Proyek: {akad.judulProyek}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {savedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">Profil Berhasil Diperbarui!</h3>
                <p className="text-xs text-gray-500">Perubahan data dan foto profilmu sudah tersimpan.</p>
              </div>
            ) : activeTab === 'menu' ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">Pengaturan Akun</h3>
                    <p className="text-xs text-gray-500">{nama}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#FFF7F3] hover:text-[#964825] text-gray-700 transition-colors text-left font-bold text-xs border border-transparent hover:border-[#FFD9CA] cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#FF9B71]" />
                    <span>Edit Profil & Unggah Foto</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false)
                      setIs2FAModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#FFF7F3] hover:text-[#964825] text-gray-700 transition-colors text-left font-bold text-xs border border-transparent hover:border-[#FFD9CA] cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
                    <span>Keamanan & Autentikasi 2-Langkah (2FA)</span>
                  </button>

                  <Link
                    href="/pelajar/dompet"
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#FFF7F3] hover:text-[#964825] text-gray-700 transition-colors text-left font-bold text-xs border border-transparent hover:border-[#FFD9CA]"
                  >
                    <Wallet className="w-4 h-4 text-[#FF9B71]" />
                    <span>Dompet & Pengaturan Penarikan</span>
                  </Link>

                  {user?.isVerified || user?.verificationStatus === 'VERIFIED' ? (
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-3 text-teal-800 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Terverifikasi oleh {sekolah}</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <span>Menunggu Verifikasi dari {sekolah}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-red-50 text-red-600 transition-colors text-left font-bold text-xs cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-extrabold text-base text-gray-900">Edit Profil & Foto</h3>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-3 pb-2 border-b border-gray-100">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Foto Profil & Sampul
                    </label>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-[#FFD9CA] overflow-hidden bg-gray-100 relative shrink-0">
                        <Image src={editForm.foto} alt="Preview Foto" fill className="object-cover" unoptimized />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="file"
                          ref={avatarInputRef}
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAvatarFile}
                        />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-4 py-2 bg-[#FFF1EB] text-[#964825] hover:bg-[#FFD9CA] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer w-fit"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#FF9B71]" />
                          <span>Pilih Foto Profil Baru</span>
                        </button>
                        <span className="text-[10px] text-gray-400">JPG, PNG, atau WEBP maks 5MB</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <input
                        type="file"
                        ref={coverInputRef}
                        accept="image/*"
                        className="sr-only"
                        onChange={handleCoverFile}
                      />
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl font-bold text-xs text-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span>Ganti Gambar Banner Sampul</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.nama}
                      onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white text-xs font-medium text-gray-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={editForm.nomorWa}
                      onChange={(e) => setEditForm({ ...editForm, nomorWa: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white text-xs font-medium text-gray-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Lokasi / Kota
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.lokasi}
                      onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white text-xs font-medium text-gray-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Bio Singkat
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white text-xs font-medium text-gray-900 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('menu')}
                      className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 2FA Modal */}
      <TwoFactorModal
        userId={user?.id || 'pelajar-active'}
        userName={nama}
        userRole="pelajar"
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  )
}
