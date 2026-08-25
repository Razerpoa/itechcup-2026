'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'

/**
 * Digunakan di halaman AUTH (login, register).
 * Jika user sudah login → redirect ke dashboard sesuai role.
 * Returns `isChecking` = true selama pengecekan, untuk mencegah flash konten.
 */
export function useRedirectIfLoggedIn() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      if (user.role === 'sekolah') {
        router.replace('/sekolah')
      } else if (user.role === 'umkm') {
        router.replace('/umkm')
      } else {
        router.replace('/pelajar')
      }
      // tetap isChecking=true supaya halaman tidak flash sebelum redirect
    } else {
      setIsChecking(false)
    }
  }, [router])

  return { isChecking }
}

/**
 * Digunakan di halaman DASHBOARD (protected).
 * Jika user belum login → redirect ke /login.
 * Returns `isChecking` = true selama pengecekan.
 */
export function useRequireAuth() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.replace('/login')
    } else {
      setIsChecking(false)
    }
  }, [router])

  return { isChecking }
}
