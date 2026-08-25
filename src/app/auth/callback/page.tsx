'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setCurrentUser, getCurrentUser } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [statusText, setStatusText] = useState('Memproses masuk akun Google...')

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        let email: string | undefined = undefined
        let nama: string | undefined = undefined

        // 1. Try extracting email and nama from window.location.hash (#access_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          if (accessToken) {
            try {
              const base64Url = accessToken.split('.')[1]
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              )
              const parsedToken = JSON.parse(jsonPayload)
              email = parsedToken.email || parsedToken.user_metadata?.email
              nama = parsedToken.user_metadata?.full_name || parsedToken.user_metadata?.name || parsedToken.name
            } catch {
              // ignore JWT decode error
            }
          }
        }

        // 2. If not in hash, fallback to Supabase session
        if (!email) {
          const { data: { session } } = await supabase.auth.getSession()
          email = session?.user?.email
          nama = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name
        }

        // 3. Fallback for local demo/dev mode if email not returned in session or hash
        if (!email) {
          const activeUser = getCurrentUser()
          if (activeUser) {
            if (activeUser.role === 'sekolah') router.push('/sekolah')
            else if (activeUser.role === 'umkm') router.push('/umkm')
            else router.push('/pelajar')
            return
          }
        }

        if (!email) {
          router.push('/login')
          return
        }

        const res = await fetch('/api/auth/google-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nama }),
        })

        const data = await res.json()

        let targetUser = data.user

        if (!targetUser) {
          targetUser = {
            id: 'p-google-' + Date.now(),
            email: email,
            nama: nama || email.split('@')[0],
            role: 'pelajar',
            sekolah: 'SMK Terdaftar',
            skills: ['Web Dev', 'UI/UX'],
            proyekSelesai: 0,
            totalPendapatan: 0,
            isVerified: false,
            verificationStatus: 'PENDING'
          }
        }

        setCurrentUser(targetUser)
        if (targetUser.role === 'sekolah') {
          router.push('/sekolah')
        } else if (targetUser.role === 'umkm') {
          router.push('/umkm')
        } else {
          router.push('/pelajar')
        }
      } catch {
        const activeUser = getCurrentUser()
        if (activeUser) {
          if (activeUser.role === 'sekolah') router.push('/sekolah')
          else if (activeUser.role === 'umkm') router.push('/umkm')
          else router.push('/pelajar')
        } else {
          router.push('/login')
        }
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-[#EAEAEA] max-w-sm w-full space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-lg text-gray-900">Menghubungkan Akun Google</h3>
        <p className="text-xs text-gray-500">{statusText}</p>
      </div>
    </div>
  )
}
