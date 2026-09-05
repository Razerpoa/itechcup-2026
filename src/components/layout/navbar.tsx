'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  User,
  Wallet,
  LayoutDashboard,
  Store,
  Building2,
  LogOut,
  ChevronDown,
  Sparkles,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  CheckCheck,
  Clock,
  ArrowRight,
  FileText,
  MessageSquare
} from 'lucide-react'
import { useAuthUser, logoutUser, useRealtimeVerificationSync } from '@/lib/auth-client'
import { useAkadStore, syncAkadWithDB } from '@/lib/akad-store'
import { useProjects } from '@/lib/projects-store'
import { formatRelativeTime } from '@/lib/utils'

interface NavbarProps {
  onMenuClick: () => void
  title: string
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  link?: string
  iconType: 'success' | 'info' | 'project' | 'wallet' | 'chat'
}

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  const router = useRouter()
  const user = useAuthUser()
  useRealtimeVerificationSync()
  const akadState = useAkadStore()
  const allProjects = useProjects()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])

  useEffect(() => {
    syncAkadWithDB()
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      syncAkadWithDB()
    }, 30000)

    const handleFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncAkadWithDB()
      }
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [])

  const role = user?.role || 'pelajar'
  const userId = user?.id || ''
  const userNamaUsaha = user?.namaUsaha || ''

  const dynamicNotifs = useMemo((): NotificationItem[] => {
    const list: NotificationItem[] = []

    if (role === 'umkm') {
      const myProjects = allProjects.filter(
        (p) =>
          (userId && p.umkmId === userId) ||
          (userNamaUsaha && p.namaUsaha && p.namaUsaha.toLowerCase().trim() === userNamaUsaha.toLowerCase().trim())
      )
      const myProjectIds = new Set(myProjects.map((p) => p.id))

      const relevantChats = akadState.chatMessages.filter((m) => {
        if (m.senderRole === 'pelajar') {
          if (myProjectIds.has(m.proyekId)) return true
          if (userId && (m.recipientId === userId || m.recipientId === 'umkm-default')) return true
          if (userNamaUsaha && m.namaUsaha && m.namaUsaha.toLowerCase().trim() === userNamaUsaha.toLowerCase().trim()) return true
          if (userNamaUsaha && m.recipientName && m.recipientName.toLowerCase().trim() === userNamaUsaha.toLowerCase().trim()) return true
        }
        return false
      })

      relevantChats.slice(-5).reverse().forEach((c) => {
        list.push({
          id: 'chat-' + c.id,
          title: `Pesan dari ${c.senderName}`,
          message: `"${c.text.length > 50 ? c.text.substring(0, 50) + '...' : c.text}" pada lowongan ${c.judulProyek || 'proyek'}`,
          time: formatRelativeTime(c.createdAt),
          isRead: false,
          link: '/umkm',
          iconType: 'chat'
        })
      })

      const myLamaran = akadState.lamaranList.filter(
        (l) =>
          (userId && l.umkmId === userId) ||
          (userNamaUsaha && l.namaUsaha && l.namaUsaha.toLowerCase().trim() === userNamaUsaha.toLowerCase().trim()) ||
          myProjectIds.has(l.proyekId)
      )

      myLamaran.filter((l) => l.status === 'PENDING').slice(-3).reverse().forEach((l) => {
        list.push({
          id: 'lam-' + l.id,
          title: `Lamaran Baru: ${l.namaPelajar}`,
          message: `Mengajukan proposal untuk ${l.judulProyek} (${l.sekolahNama || 'Siswa Terdaftar'})`,
          time: formatRelativeTime(l.createdAt),
          isRead: false,
          link: '/umkm',
          iconType: 'project'
        })
      })

      list.push({
        id: 'u-welcome',
        title: 'Akun UMKM Aktif',
        message: 'Kelola lowongan proyek dan diskusikan kebutuhan bersama siswa talenta.',
        time: 'Sistem',
        isRead: false,
        link: '/umkm',
        iconType: 'success'
      })
    } else if (role === 'pelajar') {
      const studentChats = akadState.chatMessages.filter(
        (m) =>
          m.senderRole === 'umkm' &&
          (m.recipientId === userId || m.recipientId === 'pelajar' || m.recipientId === 'pelajar-active')
      )

      studentChats.slice(-5).reverse().forEach((c) => {
        list.push({
          id: 'chat-' + c.id,
          title: `Balasan dari ${c.senderName}`,
          message: `"${c.text.length > 50 ? c.text.substring(0, 50) + '...' : c.text}"`,
          time: formatRelativeTime(c.createdAt),
          isRead: false,
          link: `/marketplace/${c.proyekId}`,
          iconType: 'chat'
        })
      })

      const myApplied = akadState.lamaranList.filter(
        (l) => (userId && l.pelajarId === userId) || l.pelajarId === 'pelajar-active'
      )

      myApplied.filter((l) => l.status === 'ACCEPTED').slice(-3).reverse().forEach((l) => {
        list.push({
          id: 'acc-' + l.id,
          title: 'Lamaran Anda Diterima!',
          message: `${l.namaUsaha} menyetujui proposal ${l.judulProyek}. DP Escrow telah terkunci.`,
          time: formatRelativeTime(l.createdAt),
          isRead: false,
          link: `/pelajar/transaksi/akad-${l.id}`,
          iconType: 'success'
        })
      })

      list.push({
        id: 'p-welcome',
        title: 'Dompet Pelajar Siap Digunakan',
        message: 'Penarikan hasil kerja aman ke GoPay, DANA, OVO, atau ShopeePay tanpa syarat rekening bank.',
        time: 'Sistem',
        isRead: false,
        link: '/pelajar/dompet',
        iconType: 'wallet'
      })
    } else {
      list.push(
        {
          id: 's-portal',
          title: 'Portal NPSN Resmi Terhubung',
          message: 'Sistem siap memverifikasi data siswa aktif yang mendaftar.',
          time: 'Sistem',
          isRead: false,
          link: '/sekolah',
          iconType: 'info'
        },
        {
          id: 's-report',
          title: 'Laporan Kinerja Portofolio Siswa',
          message: 'Pantau akumulasi prestasi dan proyek siswa secara terpusat.',
          time: 'Sistem',
          isRead: false,
          link: '/sekolah/laporan',
          iconType: 'success'
        }
      )
    }

    return list
  }, [role, userId, userNamaUsaha, allProjects, akadState.chatMessages, akadState.lamaranList])

  const notifications = useMemo(() => {
    return dynamicNotifs.map((n) => ({
      ...n,
      isRead: readIds.includes(n.id)
    }))
  }, [dynamicNotifs, readIds])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logoutUser()
    setIsDropdownOpen(false)
    router.push('/login')
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setReadIds(dynamicNotifs.map((n) => n.id))
  }

  const markItemAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const displayName =
    (role === 'sekolah' ? (user?.namaSekolah || user?.nama) : null) ||
    (role === 'umkm' ? (user?.namaUsaha || user?.nama) : null) ||
    user?.nama ||
    user?.namaSekolah ||
    user?.namaUsaha ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Akun Terdaftar'

  const subtext =
    role === 'umkm'
      ? user?.namaUsaha || user?.nama || 'Pemilik Usaha UMKM'
      : role === 'sekolah'
      ? user?.namaSekolah || user?.nama || 'Pengelola Sekolah'
      : user?.sekolah || user?.nama || 'Pelajar Terdaftar'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] flex items-center justify-between px-4 md:px-6 shadow-2xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 md:hidden text-gray-700 cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight">{title}</h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] uppercase">
            {role}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen)
              setIsDropdownOpen(false)
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer"
            aria-label="Notifikasi & Pemberitahuan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF9B71] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-[#EAEAEA] py-3 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900">Notifikasi & Aktivitas</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF1EB] text-[#964825]">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-[#964825] hover:text-[#FF9B71] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Semua</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markItemAsRead(notif.id)}
                      className={`p-4 transition-colors flex gap-3 items-start cursor-pointer ${
                        notif.isRead ? 'bg-white hover:bg-gray-50/70' : 'bg-[#FFF7F3]/70 hover:bg-[#FFF1EB]/80'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0 mt-0.5">
                        {notif.iconType === 'wallet' ? (
                          <Wallet className="w-4 h-4 text-[#FF9B71]" />
                        ) : notif.iconType === 'project' ? (
                          <Briefcase className="w-4 h-4 text-[#FF9B71]" />
                        ) : notif.iconType === 'chat' ? (
                          <MessageSquare className="w-4 h-4 text-[#FF9B71]" />
                        ) : notif.iconType === 'info' ? (
                          <Sparkles className="w-4 h-4 text-[#FF9B71]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="font-extrabold text-xs text-gray-900 truncate">{notif.title}</p>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0">
                            <Clock className="w-3 h-3" />
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => setIsNotifOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#964825] hover:text-[#FF9B71] transition-colors"
                          >
                            <span>Buka Sekarang</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Tidak ada notifikasi baru saat ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen)
              setIsNotifOpen(false)
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-[#EAEAEA] cursor-pointer"
            aria-label="Menu Profil"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#964825] font-extrabold text-xs overflow-hidden relative">
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
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAEAEA] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-extrabold text-gray-900 truncate">{displayName}</p>
                  <span className="text-[9px] font-extrabold text-[#964825] bg-[#FFF1EB] px-1.5 py-0.5 rounded-md uppercase">
                    {role}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'email@mitramuda.id'}</p>
                <p className="text-[10px] text-gray-400 mt-1 truncate">{subtext}</p>
              </div>

              <div className="py-1">
                {role === 'pelajar' && (
                  <>
                    <Link
                      href="/pelajar"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Dashboard Pelajar</span>
                    </Link>
                    <Link
                      href={`/profil/${user?.id || 'demo'}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Profil & Portofolio Saya</span>
                    </Link>
                    <Link
                      href="/pelajar/dompet"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span>Dompet & Tarik Saldo</span>
                    </Link>
                  </>
                )}

                {role === 'umkm' && (
                  <>
                    <Link
                      href="/umkm"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Dashboard UMKM</span>
                    </Link>
                    <Link
                      href="/umkm/deposit"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span>Deposit Saldo Rekber</span>
                    </Link>
                    <Link
                      href="/umkm/proyek/buat"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>Buat Lowongan Proyek</span>
                    </Link>
                  </>
                )}

                {role === 'sekolah' && (
                  <>
                    <Link
                      href="/sekolah"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Verifikasi Siswa</span>
                    </Link>
                    <Link
                      href="/sekolah/laporan"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span>Laporan & Analitik Kinerja</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/marketplace"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#FFF1EB] hover:text-[#964825] transition-colors"
                >
                  <Store className="w-4 h-4 text-gray-400" />
                  <span>Jelajahi Marketplace</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
