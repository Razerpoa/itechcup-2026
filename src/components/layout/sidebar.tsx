'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  Store,
  Wallet,
  FileText,
  TrendingUp,
  X,
  Sparkles,
  Users,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'

interface SidebarProps {
  role: 'pelajar' | 'sekolah' | 'umkm'
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthUser()
  const userId = user?.id || '1'

  const navItems = {
    pelajar: [
      { label: 'Dashboard Pelajar', href: '/pelajar', icon: LayoutDashboard },
      { label: 'Buat Jasa Pelajar', href: '/pelajar/jasa/buat', icon: Briefcase },
      { label: 'Dompet & Tarik Saldo', href: '/pelajar/dompet', icon: Wallet },
      { label: 'Ruang Akad Transaksi', href: '/pelajar/transaksi/1', icon: FileText },
      { label: 'Marketplace Lowongan', href: '/marketplace', icon: Store },
      { label: 'Profil Portofolio', href: `/profil/${userId}`, icon: UserCircle },
      { label: 'Buku Panduan', href: '/panduan', icon: BookOpen },
    ],
    sekolah: [
      { label: 'Dashboard Verifikasi', href: '/sekolah', icon: LayoutDashboard },
      { label: 'Laporan & Prestasi', href: '/sekolah/laporan', icon: TrendingUp },
      { label: 'Katalog Marketplace', href: '/marketplace', icon: Store },
      { label: 'Buku Panduan', href: '/panduan', icon: BookOpen },
    ],
    umkm: [
      { label: 'Dashboard UMKM', href: '/umkm', icon: LayoutDashboard },
      { label: 'Deposit Saldo Rekber', href: '/umkm/deposit', icon: Wallet },
      { label: 'Buat Lowongan Proyek', href: '/umkm/proyek/buat', icon: Briefcase },
      { label: 'Cari Talenta Siswa', href: '/marketplace', icon: Users },
      { label: 'Ruang Akad Proyek', href: '/umkm/transaksi/1', icon: FileText },
      { label: 'Buku Panduan', href: '/panduan', icon: BookOpen },
    ]
  }

  const currentNavItems = navItems[role] || navItems.pelajar

  const roleLabel = role === 'umkm' ? 'Pemilik UMKM' : role === 'sekolah' ? 'Pihak Sekolah' : 'Pelajar Indonesia'

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-[#EAEAEA] transform transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto flex flex-col shadow-xs",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-18 px-6 border-b border-[#EAEAEA]">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.jpg"
              alt="Mitra Muda Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-cover border border-[#FFD9CA]"
              unoptimized
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-gray-900 tracking-tight leading-tight">Mitra Muda</span>
              <span className="text-[10px] font-bold text-[#964825] uppercase tracking-wider">{roleLabel}</span>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Menu Akun {role.toUpperCase()}
          </div>
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all font-semibold text-xs",
                  isActive
                    ? "text-[#964825] bg-[#FFF1EB] font-extrabold border border-[#FFD9CA] shadow-2xs"
                    : "text-gray-600 hover:bg-[#FAFAFA] hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-[#FF9B71]" : "text-gray-400")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#EAEAEA] mt-auto">
          <div className="bg-[#FFF7F3] rounded-2xl p-3.5 border border-[#FFD9CA] text-center">
            <div className="w-8 h-8 rounded-full bg-[#FFD9CA] text-[#964825] flex items-center justify-center mx-auto mb-2 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-gray-900">Ekosistem Mitra Muda</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Sistem terverifikasi & aman</p>
          </div>
        </div>
      </aside>
    </>
  )
}
