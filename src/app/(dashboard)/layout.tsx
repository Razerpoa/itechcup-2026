'use client'

import { useRef, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import AiAssistant from '@/components/ai-assistant'
import SupportWidget from '@/components/support-widget'
import { useAuthUser, getCurrentUser } from '@/lib/auth-client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const hydratedRef = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthUser()

  const role = user?.role || (pathname.includes('/sekolah') ? 'sekolah' : pathname.includes('/umkm') ? 'umkm' : 'pelajar')

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const currentUser = getCurrentUser()

    if (currentUser === null) {
      router.replace('/login')
      return
    }

    if (currentUser.role === 'umkm' && (pathname.startsWith('/pelajar') || pathname.startsWith('/sekolah'))) {
      router.replace('/umkm')
    } else if (currentUser.role === 'sekolah' && (pathname.startsWith('/pelajar') || pathname.startsWith('/umkm'))) {
      router.replace('/sekolah')
    } else if (currentUser.role === 'pelajar' && (pathname.startsWith('/umkm') || pathname.startsWith('/sekolah'))) {
      router.replace('/pelajar')
    }
  }, [isHydrated, user, pathname, router])

  let title = 'Dashboard'
  if (pathname.includes('/dompet')) title = 'Dompet & Penarikan Saldo'
  else if (pathname.includes('/transaksi')) title = 'Ruang Akad Transaksi'
  else if (pathname.includes('/proyek/buat')) title = 'Buat Lowongan Proyek'
  else if (pathname.includes('/laporan')) title = 'Laporan Kinerja & Analitik'
  else if (pathname.includes('/deposit')) title = 'Top Up Saldo Rekber'
  else if (role === 'sekolah') title = 'Portal Verifikasi Sekolah'
  else if (role === 'umkm') title = 'Dashboard Mitra UMKM'
  else if (role === 'pelajar') title = 'Dashboard Talenta Pelajar'

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FF9B71] border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Memuat dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen relative overflow-hidden">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          title={title}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        <AiAssistant />
        <SupportWidget />
      </div>
    </div>
  )
}
