'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Sparkles,
  Filter,
  User,
  LayoutDashboard,
  Store,
  Building2,
  Wallet,
  LogOut,
  ChevronDown,
  Plus,
  Briefcase
} from 'lucide-react'
import ProyekCard from '@/components/marketplace/proyek-card'
import JasaCard from '@/components/marketplace/jasa-card'
import JasaOrderModal from '@/components/marketplace/jasa-order-modal'
import { cn } from '@/lib/utils'
import { useAuthUser, logoutUser } from '@/lib/auth-client'
import { useProjects, syncProjectsWithDB } from '@/lib/projects-store'
import { useAkadStore, syncAkadWithDB } from '@/lib/akad-store'
import { useJasaStore } from '@/lib/jasa-store'

export interface JasaItem {
  id: string
  judul: string
  namaPelajar: string
  ratingRata: number
  jumlahProyekSelesai: number
  hargaBasic: number
  tags: string[]
  fotoProfil?: string
}

const JASA_LIST_EMPTY: JasaItem[] = []

export default function MarketplacePage() {
  const router = useRouter()
  const user = useAuthUser()
  const allProjects = useProjects()
  const allJasa = useJasaStore()
  const akadState = useAkadStore()
  const [activeTab, setActiveTab] = useState<'proyek' | 'jasa'>('proyek')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [maxBudget, setMaxBudget] = useState(10000000)
  const [dpFilter, setDpFilter] = useState('semua')
  const [sortBy, setSortBy] = useState('terbaru')
  const [minRating, setMinRating] = useState(0)

  const [selectedJasaForOrder, setSelectedJasaForOrder] = useState<any>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    syncProjectsWithDB()
    syncAkadWithDB()

    const interval = setInterval(() => {
      syncProjectsWithDB()
      syncAkadWithDB()
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = user?.nama || user?.namaUsaha || user?.namaSekolah || 'Akun Saya'
  const subtext = user?.role === 'umkm' ? (user.namaUsaha || 'Pemilik UMKM') : user?.role === 'sekolah' ? (user.namaSekolah || 'Pihak Sekolah') : (user?.sekolah || 'Pelajar Terdaftar')

  const handleLogout = () => {
    logoutUser()
    setIsProfileMenuOpen(false)
    router.push('/login')
  }

  const categories = ['Semua', 'Desain Grafis', 'Web Dev', 'Video & Animasi', 'Medsos & Marketing', 'Fotografi', 'Copywriting', 'UI/UX']

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== 'Semua') count++
    if (maxBudget < 10000000) count++
    if (dpFilter !== 'semua') count++
    if (minRating > 0) count++
    if (sortBy !== 'terbaru') count++
    return count
  }, [selectedCategory, maxBudget, dpFilter, minRating, sortBy])

  const closedOrAcceptedProyekIds = useMemo(() => {
    const ids = new Set<string>()
    for (const l of akadState.lamaranList) {
      if (l.status === 'ACCEPTED') {
        ids.add(l.proyekId)
      }
    }
    for (const a of akadState.akadList) {
      if (a.step >= 2) {
        ids.add(a.proyekId)
        ids.add(a.id)
      }
    }
    return ids
  }, [akadState.lamaranList, akadState.akadList])

  const openProjects = useMemo(() => {
    return allProjects.filter((item) => !closedOrAcceptedProyekIds.has(item.id))
  }, [allProjects, closedOrAcceptedProyekIds])

  const filteredProyek = useMemo(() => {
    return openProjects.filter((item) => {

      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.namaUsaha.toLowerCase().includes(q) ||
        item.keteranganSingkat.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))

      const matchCategory =
        selectedCategory === 'Semua' ||
        item.tags.some((t) =>
          t.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(t.toLowerCase())
        ) ||
        item.judul.toLowerCase().includes(selectedCategory.toLowerCase())

      const matchBudget = maxBudget >= 10000000 ? true : item.budgetMax <= maxBudget

      const matchDp =
        dpFilter === 'semua' ||
        (dpFilter === '30' && item.dpPersen === 30) ||
        (dpFilter === '50' && item.dpPersen === 50) ||
        (dpFilter === '0' && item.dpPersen === 0)

      return matchSearch && matchCategory && matchBudget && matchDp
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return b.budgetMax - a.budgetMax
      if (sortBy === 'budget_low') return a.budgetMax - b.budgetMax
      return 0
    })
  }, [openProjects, search, selectedCategory, maxBudget, dpFilter, sortBy])

  const filteredJasa = useMemo(() => {
    return allJasa.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.namaPelajar.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))

      const matchCategory =
        selectedCategory === 'Semua' ||
        item.tags.some((t) =>
          t.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(t.toLowerCase())
        ) ||
        item.judul.toLowerCase().includes(selectedCategory.toLowerCase())

      const matchBudget = maxBudget >= 10000000 ? true : item.hargaBasic <= maxBudget

      const matchRating = item.ratingRata >= minRating

      return matchSearch && matchCategory && matchBudget && matchRating
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return b.hargaBasic - a.hargaBasic
      if (sortBy === 'budget_low') return a.hargaBasic - b.hargaBasic
      if (sortBy === 'rating_high') return b.ratingRata - a.ratingRata
      return 0
    })
  }, [allJasa, search, selectedCategory, maxBudget, minRating, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('Semua')
    setMaxBudget(10000000)
    setDpFilter('semua')
    setSortBy('terbaru')
    setMinRating(0)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] flex items-center justify-between px-4 sm:px-8 shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Mitra Muda"
            width={32}
            height={32}
            className="w-8 h-8 rounded-xl object-cover border border-[#FFD9CA]"
            unoptimized
          />
          <span className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight">Mitra Muda</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {user.role === 'pelajar' && (
                <>
                  <Link
                    href="/pelajar"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard Pelajar</span>
                  </Link>
                  <Link
                    href="/pelajar/dompet"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Dompet</span>
                  </Link>
                </>
              )}

              {user.role === 'umkm' && (
                <>
                  <Link
                    href="/umkm"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Dashboard UMKM</span>
                  </Link>
                  <Link
                    href="/umkm/proyek/buat"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Proyek</span>
                  </Link>
                </>
              )}

              {user.role === 'sekolah' && (
                <>
                  <Link
                    href="/sekolah"
                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Dashboard Sekolah</span>
                  </Link>
                </>
              )}

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-[#EAEAEA] cursor-pointer"
                  aria-label="Menu Akun & Dashboard"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold text-xs overflow-hidden relative">
                    <Image
                      src="/logo.jpg"
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-gray-800 pr-1 max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAEAEA] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-extrabold text-gray-900 truncate">{displayName}</p>
                        <span className="text-[9px] font-extrabold text-[#964825] bg-[#FFF1EB] px-1.5 py-0.5 rounded-md uppercase">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{subtext}</p>
                      {user?.isVerified || user?.verificationStatus === 'VERIFIED' ? (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full w-fit font-bold border border-teal-200">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>Akun Terverifikasi</span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full w-fit font-bold border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Menunggu Verifikasi Sekolah</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      {user.role === 'pelajar' && (
                        <>
                          <Link
                            href="/pelajar"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#FF9B71]" />
                            <span>Dashboard Pelajar</span>
                          </Link>
                          <Link
                            href="/pelajar/dompet"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <Wallet className="w-4 h-4 text-[#FF9B71]" />
                            <span>Dompet & Tarik Saldo</span>
                          </Link>
                          <Link
                            href={`/profil/${user?.id || '1'}`}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <User className="w-4 h-4 text-[#FF9B71]" />
                            <span>Profil Portofolio</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'umkm' && (
                        <>
                          <Link
                            href="/umkm"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <Store className="w-4 h-4 text-[#FF9B71]" />
                            <span>Dashboard UMKM</span>
                          </Link>
                          <Link
                            href="/umkm/proyek/buat"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#FF9B71]" />
                            <span>Buat Lowongan Proyek</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'sekolah' && (
                        <>
                          <Link
                            href="/sekolah"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-[#FF9B71]" />
                            <span>Dashboard Sekolah</span>
                          </Link>
                          <Link
                            href="/sekolah/laporan"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FFF7F3] hover:text-[#964825] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#FF9B71]" />
                            <span>Laporan & Analitik</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/"
                className="px-4 py-2 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1EB] text-[#964825] text-xs font-bold border border-[#FFD9CA] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Pemberdayaan Talenta Muda Indonesia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Marketplace Mitra Muda
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Temukan peluang proyek dari UMKM atau jelajahi karya dan katalog keahlian pelajar bertalenta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex bg-[#F5F5F5] p-1 rounded-full border border-gray-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('proyek')}
              className={cn(
                "flex-1 sm:flex-initial px-6 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer",
                activeTab === 'proyek'
                  ? "bg-white text-[#964825] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              Proyek UMKM ({openProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('jasa')}
              className={cn(
                "flex-1 sm:flex-initial px-6 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer",
                activeTab === 'jasa'
                  ? "bg-white text-[#964825] shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              Jasa Pelajar ({allJasa.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'proyek' ? "Cari judul proyek, UMKM, tag..." : "Cari nama pelajar, skill..."}
                className="w-full h-11 pl-10 pr-9 rounded-full bg-[#F5F5F5] border border-transparent focus:border-[#FF9B71] focus:bg-white text-xs font-medium text-gray-900 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                "p-2.5 rounded-full border transition-all flex items-center justify-center relative cursor-pointer",
                activeFilterCount > 0
                  ? "bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs"
                  : "bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200"
              )}
              title="Pengaturan Filter & Urutan"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF9B71] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer border",
                  isSelected
                    ? "bg-[#964825] text-white border-[#964825] shadow-xs"
                    : "bg-white border-[#EAEAEA] text-gray-600 hover:border-[#FFD9CA] hover:text-[#964825]"
                )}
              >
                {cat}
              </button>
            )
          })}

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1.5 cursor-pointer ml-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {activeTab === 'proyek' ? (
          filteredProyek.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProyek.map((proyek) => (
                <ProyekCard key={proyek.id} {...proyek} />
              ))}
            </div>
          ) : openProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Belum Ada Lowongan Proyek</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Belum ada lowongan proyek di database. Buat lowongan proyek pertamamu untuk mulai merekrut talenta pelajar.
              </p>
              <Link
                href="/umkm/proyek/buat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Lowongan Proyek Sekarang</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Tidak Ada Proyek yang Cocok</h3>
              <p className="text-xs text-gray-500 mb-6">
                Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat semua lowongan.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )
        ) : (
          filteredJasa.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJasa.map((jasa) => (
                <JasaCard
                  key={jasa.id}
                  {...jasa}
                  onOrder={(jasaItem) => {
                    setSelectedJasaForOrder(jasaItem)
                    setIsOrderModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EAEAEA] p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Belum Ada Katalog Jasa Pelajar</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {user?.role === 'pelajar'
                  ? 'Anda belum memiliki atau belum mempublikasikan penawaran jasa. Buat penawaran jasa pertamamu agar UMKM dapat merekrut keahlianmu!'
                  : user?.role === 'umkm'
                  ? 'Belum ada jasa dari pelajar yang terdaftar. Anda dapat membuat lowongan proyek untuk menarik minat pelajar.'
                  : 'Pelajar yang mendaftar dan mempublikasikan katalog keahlian jasanya akan tampil di sini.'}
              </p>

              {user?.role === 'pelajar' ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/pelajar/jasa/buat"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Listing Jasa Pelajar</span>
                  </Link>
                  <Link
                    href="/pelajar"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Ke Dashboard Pelajar</span>
                  </Link>
                </div>
              ) : user?.role === 'umkm' ? (
                <Link
                  href="/umkm/proyek/buat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Lowongan Proyek</span>
                </Link>
              ) : (
                <Link
                  href="/register/pelajar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
                >
                  <User className="w-4 h-4" />
                  <span>Daftar Sebagai Pelajar</span>
                </Link>
              )}
            </div>
          )
        )}
      </div>

      {/* Footer Marketplace */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-8 px-4 sm:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="Mitra Muda" width={28} height={28} className="rounded-lg object-cover border border-[#FFD9CA]" unoptimized />
            <span className="font-extrabold text-gray-900 text-sm">Mitra Muda Indonesia</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/panduan" className="hover:text-gray-900 transition-colors">Panduan Sistem</Link>
            <Link href="/syarat-ketentuan" className="hover:text-gray-900 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-gray-900 transition-colors">Kebijakan Privasi</Link>
            <Link href="/perlindungan-pelajar" className="hover:text-[#964825] font-semibold transition-colors">Perlindungan Pelajar</Link>
          </div>
          <p>© 2026 Mitra Muda. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Pengaturan Pencarian</h3>
                <p className="text-xs text-gray-500">Filter proyek dan jasa sesuai kebutuhanmu</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <span>Maksimal Budget / Harga</span>
                  <span className="text-[#964825] font-extrabold">
                    {maxBudget >= 10000000 ? 'Semua Budget' : `Hingga Rp ${maxBudget.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="10000000"
                  step="200000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#FF9B71] cursor-pointer"
                />
              </div>

              {activeTab === 'proyek' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Skema Uang Muka (DP)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Semua', val: 'semua' },
                      { label: 'DP 30%', val: '30' },
                      { label: 'DP 50%', val: '50' },
                      { label: 'Tanpa DP', val: '0' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setDpFilter(opt.val)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                          dpFilter === opt.val
                            ? "bg-[#FFF1EB] border-[#FF9B71] text-[#964825]"
                            : "bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'jasa' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Rating Minimal Siswa
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Semua', val: 0 },
                      { label: '⭐ 4.5+', val: 4.5 },
                      { label: '⭐ 4.8+', val: 4.8 }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setMinRating(opt.val)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                          minRating === opt.val
                            ? "bg-[#FFF1EB] border-[#FF9B71] text-[#964825]"
                            : "bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Urutkan Berdasarkan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Terbaru', val: 'terbaru' },
                    { label: 'Budget Tertinggi', val: 'budget_high' },
                    { label: 'Budget Terendah', val: 'budget_low' },
                    ...(activeTab === 'jasa' ? [{ label: 'Rating Tertinggi', val: 'rating_high' }] : [])
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSortBy(opt.val)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer",
                        sortBy === opt.val
                          ? "bg-[#FFF1EB] border-[#FF9B71] text-[#964825]"
                          : "bg-[#F5F5F5] border-transparent text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.val && <Check className="w-3.5 h-3.5 text-[#FF9B71]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hubungi & Pesan Jasa Pelajar */}
      <JasaOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        jasa={selectedJasaForOrder}
      />
    </div>
  )
}
