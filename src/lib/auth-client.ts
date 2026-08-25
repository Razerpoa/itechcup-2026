'use client'

import { useSyncExternalStore } from 'react'

export interface UserSession {
  id: string
  email: string
  nama: string
  role: 'pelajar' | 'umkm' | 'sekolah'
  sekolah?: string
  nisn?: string
  namaUsaha?: string
  nomorWa?: string
  namaSekolah?: string
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

let memoryUser: UserSession | null = null
let lastRaw: string | null = '__init__'
let cachedUser: UserSession | null = null
const listeners = new Set<() => void>()

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
      // ignore
    }
  }
  emitChange()
}

export function logoutUser(): void {
  memoryUser = null
  cachedUser = null
  lastRaw = null
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
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
