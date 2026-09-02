'use client'

import { useEffect, useSyncExternalStore } from 'react'

export interface UserSession {
  id: string
  email: string
  nama: string
  role: 'pelajar' | 'umkm' | 'sekolah'
  sekolah?: string
  nisn?: string
  registrationId?: string
  namaUsaha?: string
  namaPemilik?: string
  nomorWa?: string
  namaSekolah?: string
  namaPenanggungJawab?: string
  npsn?: string
  skills?: string[]
  fotoProfil?: string
  proyekSelesai?: number
  totalPendapatan?: number
  onTimeRate?: number
  isVerified?: boolean
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'UNVERIFIED'
}

const STORAGE_KEY = 'mitra_muda_auth_user'
const VERIFY_CHANNEL_NAME = 'mitra_muda_verify_sync'

let memoryUser: UserSession | null = null
let lastRaw: string | null = '__init__'
let cachedUser: UserSession | null = null
const listeners = new Set<() => void>()

let verifyChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    verifyChannel = new BroadcastChannel(VERIFY_CHANNEL_NAME)
    verifyChannel.onmessage = (event) => {
      const data = event.data
      if (data?.type === 'VERIFICATION_UPDATE') {
        const current = getCurrentUser()
        if (current) {
          const matchId = current.id === data.id
          const matchEmail = data.email && current.email && current.email.toLowerCase() === data.email.toLowerCase()
          if (matchId || matchEmail) {
            const isVer = data.status === 'VERIFIED'
            setCurrentUser({
              ...current,
              isVerified: isVer,
              verificationStatus: isVer ? 'VERIFIED' : 'REJECTED'
            })
          }
        }
      }
    }
  } catch {
  }
}

function emitChange() {
  lastRaw = '__dirty__'
  for (const listener of listeners) {
    listener()
  }
}

export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return memoryUser
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === lastRaw) {
      return cachedUser
    }
    lastRaw = raw
    if (!raw) {
      cachedUser = memoryUser
    } else {
      cachedUser = JSON.parse(raw) as UserSession
    }
    return cachedUser
  } catch {
    return memoryUser
  }
}

export function setCurrentUser(user: UserSession): void {
  memoryUser = user
  cachedUser = user
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(user)
      lastRaw = serialized
      localStorage.setItem(STORAGE_KEY, serialized)
    } catch {
    }
  }
  emitChange()
}

export function broadcastVerificationChange(payload: {
  role: 'pelajar' | 'umkm' | 'sekolah'
  id: string
  email?: string
  status: 'VERIFIED' | 'REJECTED'
}) {
  const current = getCurrentUser()
  if (current) {
    const matchId = current.id === payload.id
    const matchEmail = payload.email && current.email && current.email.toLowerCase() === payload.email.toLowerCase()
    if (matchId || matchEmail) {
      const isVer = payload.status === 'VERIFIED'
      setCurrentUser({
        ...current,
        isVerified: isVer,
        verificationStatus: isVer ? 'VERIFIED' : 'REJECTED'
      })
    }
  }

  if (typeof window !== 'undefined') {
    try {
      if (verifyChannel) {
        verifyChannel.postMessage({
          type: 'VERIFICATION_UPDATE',
          ...payload
        })
      }
      window.dispatchEvent(new CustomEvent('mitramuda_verify_update', { detail: payload }))
      window.dispatchEvent(new Event('storage'))
    } catch {
    }
  }
}

export function logoutUser(): void {
  memoryUser = null
  cachedUser = null
  lastRaw = null
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
  }
  emitChange()
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      emitChange()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

function getSnapshot(): UserSession | null {
  return getCurrentUser()
}

function getServerSnapshot(): UserSession | null {
  return null
}

export function useAuthUser(): UserSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useRealtimeVerificationSync() {
  const user = useAuthUser()

  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    const checkStatus = async () => {
      if (!user?.id) return
      try {
        let endpoint = ''
        if (user.role === 'pelajar') endpoint = `/api/pelajar/${user.id}`
        else if (user.role === 'umkm') endpoint = `/api/umkm/${user.id}`
        else if (user.role === 'sekolah') endpoint = `/api/sekolah/${user.id}`

        if (!endpoint) return

        const res = await fetch(endpoint, { cache: 'no-store' })
        if (res.ok && isMounted) {
          const json = await res.json()
          const data = json.data
          if (data) {
            const isVerifiedNow =
              data.isVerified === true ||
              data.verificationStatus === 'VERIFIED'

            const currentlyVerified = user.isVerified || user.verificationStatus === 'VERIFIED'

            if (isVerifiedNow && !currentlyVerified) {
              setCurrentUser({
                ...user,
                isVerified: true,
                verificationStatus: 'VERIFIED'
              })
            } else if (!isVerifiedNow && currentlyVerified) {
              
              setCurrentUser({
                ...user,
                isVerified: false,
                verificationStatus: (data.verificationStatus as any) || 'PENDING'
              })
            } else if (data.verificationStatus === 'REJECTED' && user.verificationStatus !== 'REJECTED') {
              setCurrentUser({
                ...user,
                isVerified: false,
                verificationStatus: 'REJECTED'
              })
            }
          }
        }
      } catch {
      }
    }

    
    checkStatus()

    
    
    const alreadyVerified = user.isVerified || user.verificationStatus === 'VERIFIED'
    const pollInterval = alreadyVerified ? 10000 : 1500
    const interval = setInterval(checkStatus, pollInterval)

    const handleFocus = () => {
      checkStatus()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      isMounted = false
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [user?.id, user?.isVerified, user?.verificationStatus, user?.role])
}
