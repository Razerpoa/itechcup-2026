'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'


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
    } else {
      setIsChecking(false)
    }
  }, [router])

  return { isChecking }
}


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
