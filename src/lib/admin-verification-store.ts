'use client'

import { useSyncExternalStore } from 'react'

export interface AdminPelajarItem {
  id: string
  namaLengkap: string
  email: string
  asalSekolah: string
  nis?: string
  kelas?: string
  tempatLahir?: string
  tanggalLahir?: string
  namaIbu?: string
  fotoKartuPelajar?: string
  nomorWa?: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  catatanPenolakan?: string
  createdAt: string
}

export interface AdminSekolahItem {
  id: string
  namaSekolah: string
  npsn: string
  emailResmi: string
  namaPenanggungJawab: string
  jabatanAdmin?: string
  alamatLengkap?: string
  kontakSekolah?: string
  verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'AUTO_CORRECTED'
  officialNama?: string
  akreditasi?: string
  createdAt: string
}

export interface AdminUMKMItem {
  id: string
  namaUsaha: string
  namaPemilik: string
  email: string
  nomorWa: string
  kategori?: string
  ukuranBisnis?: string
  alamat?: string
  isVerified: boolean
  verifikasiType?: string
  buktiLegalitas?: string
  createdAt: string
}

export interface AdminVerificationData {
  pelajarList: AdminPelajarItem[]
  sekolahList: AdminSekolahItem[]
  umkmList: AdminUMKMItem[]
}

const STORAGE_KEY = 'mitra_muda_admin_verifications_v1'

const INITIAL_DATA: AdminVerificationData = {
  pelajarList: [],
  sekolahList: [],
  umkmList: []
}

let cachedData: AdminVerificationData = INITIAL_DATA
let lastRaw: string | null = '__init__'
const listeners = new Set<() => void>()

function emitChange() {
  lastRaw = '__dirty__'
  for (const listener of listeners) {
    listener()
  }
}

export function getVerificationState(): AdminVerificationData {
  if (typeof window === 'undefined') return INITIAL_DATA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === lastRaw) {
      return cachedData
    }
    lastRaw = raw
    if (!raw) {
      cachedData = INITIAL_DATA
    } else {
      cachedData = JSON.parse(raw) as AdminVerificationData
    }
    return cachedData
  } catch {
    return INITIAL_DATA
  }
}

function saveVerificationState(data: AdminVerificationData) {
  cachedData = data
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(data)
      lastRaw = serialized
      localStorage.setItem(STORAGE_KEY, serialized)
    } catch {
      // ignore
    }
  }
  emitChange()
}

export async function syncAdminUsersFromDB(): Promise<void> {
  try {
    const [resPelajar, resSekolah, resUmkm] = await Promise.all([
      fetch('/api/pelajar').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/sekolah').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/umkm').then((r) => r.json()).catch(() => ({ data: [] }))
    ])

    const currentState = getVerificationState()

    const localRegistry: any[] = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mitra_muda_all_registered_users_v1') || '[]')
      : []

    const pelajarFromDB: AdminPelajarItem[] = Array.isArray(resPelajar.data)
      ? resPelajar.data.map((p: any) => {
          const matchedUser = localRegistry.find((u: any) => u.email === p.email || u.id === p.id)
          const actualWa = matchedUser?.nomorWa || p.profil?.kontakWa || p.nomorWa || p.noHp || ''
          return {
            id: p.id,
            namaLengkap: p.namaLengkap,
            email: p.email,
            asalSekolah: p.sekolah?.namaSekolah || p.kelas || 'SMKN / SMAN Indonesia',
            nis: p.nis || p.nisn || '3201948271',
            kelas: p.kelas || 'Siswa Terdaftar',
            tempatLahir: p.tempatLahir || 'Tasikmalaya',
            tanggalLahir: p.tanggalLahir,
            namaIbu: p.namaIbu || 'Ibu Kandung',
            fotoKartuPelajar: p.fotoKartuPelajar || matchedUser?.fotoKartuPelajar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
            nomorWa: actualWa,
            verificationStatus: (p.verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED') || 'PENDING',
            createdAt: p.createdAt || new Date().toISOString()
          }
        })
      : []

    const sekolahFromDB: AdminSekolahItem[] = Array.isArray(resSekolah.data)
      ? resSekolah.data.map((s: any) => ({
          id: s.id,
          namaSekolah: s.namaSekolah,
          npsn: s.npsn,
          emailResmi: s.emailResmi,
          namaPenanggungJawab: s.namaPenanggungJawab,
          jabatanAdmin: s.jabatanAdmin || 'Kepala Sekolah / Waka Hubin',
          alamatLengkap: s.alamatLengkap || 'Jl. Pendidikan No. 45, Indonesia',
          kontakSekolah: s.kontakSekolah || '0265-334125',
          verificationStatus: (s.verificationStatus as any) || 'PENDING_REVIEW',
          officialNama: s.officialNama || s.namaSekolah,
          akreditasi: s.akreditasi || 'A',
          createdAt: s.createdAt || new Date().toISOString()
        }))
      : []

    const umkmFromDB: AdminUMKMItem[] = Array.isArray(resUmkm.data)
      ? resUmkm.data.map((u: any) => ({
          id: u.id,
          namaUsaha: u.namaUsaha,
          namaPemilik: u.namaPemilik,
          email: u.email,
          nomorWa: u.nomorWa,
          kategori: u.kategori || 'Kuliner & F&B',
          ukuranBisnis: u.ukuranBisnis || 'Kecil',
          alamat: u.alamat || 'Jl. Perdagangan UMKM No. 12',
          isVerified: Boolean(u.isVerified),
          verifikasiType: u.verifikasiType || 'NIB Legalitas',
          buktiLegalitas: u.buktiLegalitas || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
          createdAt: u.createdAt || new Date().toISOString()
        }))
      : []

    saveVerificationState({
      pelajarList: pelajarFromDB.length > 0 ? pelajarFromDB : currentState.pelajarList,
      sekolahList: sekolahFromDB.length > 0 ? sekolahFromDB : currentState.sekolahList,
      umkmList: umkmFromDB.length > 0 ? umkmFromDB : currentState.umkmList
    })
  } catch {
    // ignore
  }
}

export function adminVerifyPelajar(id: string): boolean {
  const state = getVerificationState()
  const targetPelajar = state.pelajarList.find((p) => p.id === id)
  const updated = state.pelajarList.map((p) =>
    p.id === id ? { ...p, verificationStatus: 'VERIFIED' as const } : p
  )
  saveVerificationState({ ...state, pelajarList: updated })

  // Sync with current logged-in user if matching
  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem('mitra_muda_auth_user')
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw)
        if (parsed.id === id || (targetPelajar && parsed.email === targetPelajar.email)) {
          parsed.verificationStatus = 'VERIFIED'
          parsed.isVerified = true
          localStorage.setItem('mitra_muda_auth_user', JSON.stringify(parsed))
          window.dispatchEvent(new Event('storage'))
        }
      }

      const allUsersRaw = localStorage.getItem('mitra_muda_all_registered_users_v1')
      if (allUsersRaw) {
        const allUsers = JSON.parse(allUsersRaw)
        const updatedAll = allUsers.map((u: any) => {
          if (u.id === id || (targetPelajar && u.email === targetPelajar.email)) {
            return { ...u, verificationStatus: 'VERIFIED', isVerified: true }
          }
          return u
        })
        localStorage.setItem('mitra_muda_all_registered_users_v1', JSON.stringify(updatedAll))
      }
    } catch {
      // ignore
    }
  }

  fetch(`/api/pelajar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationStatus: 'VERIFIED' })
  }).catch(() => {})

  return true
}

export function adminRejectPelajar(id: string, reason?: string): boolean {
  const state = getVerificationState()
  const targetPelajar = state.pelajarList.find((p) => p.id === id)
  const updated = state.pelajarList.map((p) =>
    p.id === id ? { ...p, verificationStatus: 'REJECTED' as const, catatanPenolakan: reason || 'Dokumen kartu pelajar tidak sesuai' } : p
  )
  saveVerificationState({ ...state, pelajarList: updated })

  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem('mitra_muda_auth_user')
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw)
        if (parsed.id === id || (targetPelajar && parsed.email === targetPelajar.email)) {
          parsed.verificationStatus = 'REJECTED'
          parsed.isVerified = false
          localStorage.setItem('mitra_muda_auth_user', JSON.stringify(parsed))
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch {
      // ignore
    }
  }

  fetch(`/api/pelajar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationStatus: 'REJECTED', catatanPenolakan: reason })
  }).catch(() => {})

  return true
}

export function adminVerifySekolah(id: string): boolean {
  const state = getVerificationState()
  const updated = state.sekolahList.map((s) =>
    s.id === id ? { ...s, verificationStatus: 'VERIFIED' as const } : s
  )
  saveVerificationState({ ...state, sekolahList: updated })

  fetch(`/api/sekolah/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationStatus: 'VERIFIED' })
  }).catch(() => {})

  return true
}

export function adminRejectSekolah(id: string): boolean {
  const state = getVerificationState()
  const updated = state.sekolahList.map((s) =>
    s.id === id ? { ...s, verificationStatus: 'REJECTED' as const } : s
  )
  saveVerificationState({ ...state, sekolahList: updated })

  fetch(`/api/sekolah/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationStatus: 'REJECTED' })
  }).catch(() => {})

  return true
}

export function adminVerifyUMKM(id: string): boolean {
  const state = getVerificationState()
  const targetUMKM = state.umkmList.find((u) => u.id === id)
  const updated = state.umkmList.map((u) =>
    u.id === id ? { ...u, isVerified: true } : u
  )
  saveVerificationState({ ...state, umkmList: updated })

  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem('mitra_muda_auth_user')
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw)
        if (parsed.id === id || (targetUMKM && parsed.email === targetUMKM.email)) {
          parsed.isVerified = true
          localStorage.setItem('mitra_muda_auth_user', JSON.stringify(parsed))
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch {
      // ignore
    }
  }

  fetch(`/api/umkm/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isVerified: true })
  }).catch(() => {})

  return true
}

export function adminRevokeUMKM(id: string): boolean {
  const state = getVerificationState()
  const targetUMKM = state.umkmList.find((u) => u.id === id)
  const updated = state.umkmList.map((u) =>
    u.id === id ? { ...u, isVerified: false } : u
  )
  saveVerificationState({ ...state, umkmList: updated })

  if (typeof window !== 'undefined') {
    try {
      const activeRaw = localStorage.getItem('mitra_muda_auth_user')
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw)
        if (parsed.id === id || (targetUMKM && parsed.email === targetUMKM.email)) {
          parsed.isVerified = false
          localStorage.setItem('mitra_muda_auth_user', JSON.stringify(parsed))
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch {
      // ignore
    }
  }

  fetch(`/api/umkm/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isVerified: false })
  }).catch(() => {})

  return true
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

function getSnapshot(): AdminVerificationData {
  return getVerificationState()
}

function getServerSnapshot(): AdminVerificationData {
  return INITIAL_DATA
}

export function useAdminVerifications(): AdminVerificationData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
