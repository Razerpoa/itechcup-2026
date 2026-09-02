'use client'

import { useSyncExternalStore } from 'react'
import { broadcastVerificationChange } from '@/lib/auth-client'

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


const MUTATION_TTL_MS = 30_000
const recentMutations = new Map<string, { status: string; timestamp: number }>()

export function recordRecentMutation(id: string, status: string) {
  recentMutations.set(id, { status, timestamp: Date.now() })
}

function isRecentlyMutated(id: string): { status: string } | null {
  const entry = recentMutations.get(id)
  if (!entry) return null
  if (Date.now() - entry.timestamp > MUTATION_TTL_MS) {
    recentMutations.delete(id)
    return null
  }
  return { status: entry.status }
}

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
    }
  }
  emitChange()
}


async function patchWithRetry(url: string, body: Record<string, unknown>, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) return true
      console.warn(`PATCH ${url} attempt ${attempt + 1} failed with status ${res.status}`)
    } catch (err) {
      console.warn(`PATCH ${url} attempt ${attempt + 1} network error:`, err)
    }
    
    if (attempt < retries - 1) {
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)))
    }
  }
  return false
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
          const docPhoto = p.fotoKartuPelajar || matchedUser?.fotoKartuPelajar || undefined

          
          const mutation = isRecentlyMutated(p.id) || (p.email ? isRecentlyMutated(p.email) : null)
          
          
          const dbStatus = (p.verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED') || 'PENDING'
          const effectiveStatus = mutation
            ? (mutation.status as 'PENDING' | 'VERIFIED' | 'REJECTED')
            : dbStatus

          const effectiveCatatan = (mutation && mutation.status === 'VERIFIED')
            ? undefined
            : (p.catatanPenolakan || matchedUser?.catatanPenolakan || undefined)

          return {
            id: p.id,
            namaLengkap: p.namaLengkap,
            email: p.email,
            asalSekolah: p.sekolah?.namaSekolah || p.kelas || 'SMKN / SMAN Indonesia',
            nis: p.nis || p.nisn || '',
            kelas: p.kelas || 'Siswa Terdaftar',
            tempatLahir: p.tempatLahir || '',
            tanggalLahir: p.tanggalLahir,
            namaIbu: p.namaIbu || '',
            fotoKartuPelajar: docPhoto,
            nomorWa: actualWa,
            verificationStatus: effectiveStatus,
            catatanPenolakan: effectiveCatatan,
            createdAt: p.createdAt || new Date().toISOString()
          }
        })
      : []

    const sekolahFromDB: AdminSekolahItem[] = Array.isArray(resSekolah.data)
      ? resSekolah.data.map((s: any) => {
          const mutation = isRecentlyMutated(s.id) || (s.emailResmi ? isRecentlyMutated(s.emailResmi) : null)
          const dbStatus = (s.verificationStatus as any) || 'PENDING_REVIEW'
          const effectiveStatus = mutation ? (mutation.status as any) : dbStatus

          return {
            id: s.id,
            namaSekolah: s.namaSekolah,
            npsn: s.npsn,
            emailResmi: s.emailResmi,
            namaPenanggungJawab: s.namaPenanggungJawab,
            jabatanAdmin: s.jabatanAdmin || 'Kepala Sekolah / Waka Hubin',
            alamatLengkap: s.alamatLengkap || '',
            kontakSekolah: s.kontakSekolah || '',
            verificationStatus: effectiveStatus,
            officialNama: s.officialNama || s.namaSekolah,
            akreditasi: s.akreditasi || 'A',
            createdAt: s.createdAt || new Date().toISOString()
          }
        })
      : []

    const umkmFromDB: AdminUMKMItem[] = Array.isArray(resUmkm.data)
      ? resUmkm.data.map((u: any) => {
          const matchedUser = localRegistry.find((m: any) => m.email === u.email || m.id === u.id)
          const legalDoc = u.buktiLegalitas || matchedUser?.buktiLegalitas || undefined
          const mutation = isRecentlyMutated(u.id) || (u.email ? isRecentlyMutated(u.email) : null)
          const effectiveIsVerified = mutation
            ? mutation.status === 'VERIFIED'
            : Boolean(u.isVerified)

          return {
            id: u.id,
            namaUsaha: u.namaUsaha,
            namaPemilik: u.namaPemilik,
            email: u.email,
            nomorWa: u.nomorWa,
            kategori: u.kategori || 'Kuliner & F&B',
            ukuranBisnis: u.ukuranBisnis || 'Kecil',
            alamat: u.alamat || '',
            isVerified: effectiveIsVerified,
            verifikasiType: u.verifikasiType || (legalDoc ? 'Dokumen Legalitas / NIB' : 'Verifikasi Manual Admin'),
            buktiLegalitas: legalDoc,
            createdAt: u.createdAt || new Date().toISOString()
          }
        })
      : []

    saveVerificationState({
      pelajarList: pelajarFromDB.length > 0 ? pelajarFromDB : currentState.pelajarList,
      sekolahList: sekolahFromDB.length > 0 ? sekolahFromDB : currentState.sekolahList,
      umkmList: umkmFromDB.length > 0 ? umkmFromDB : currentState.umkmList
    })
  } catch {
  }
}

export async function adminVerifyPelajar(id: string): Promise<boolean> {
  
  recordRecentMutation(id, 'VERIFIED')
  const state = getVerificationState()
  const targetPelajar = state.pelajarList.find((p) => p.id === id)
  if (targetPelajar?.email) {
    recordRecentMutation(targetPelajar.email, 'VERIFIED')
  }

  
  const updated = state.pelajarList.map((p) =>
    p.id === id || (targetPelajar && p.email === targetPelajar.email)
      ? { ...p, verificationStatus: 'VERIFIED' as const, catatanPenolakan: undefined }
      : p
  )
  saveVerificationState({ ...state, pelajarList: updated })

  
  broadcastVerificationChange({
    role: 'pelajar',
    id,
    email: targetPelajar?.email,
    status: 'VERIFIED'
  })

  
  if (typeof window !== 'undefined') {
    try {
      const allUsersRaw = localStorage.getItem('mitra_muda_all_registered_users_v1')
      if (allUsersRaw) {
        const allUsers = JSON.parse(allUsersRaw)
        const updatedAll = allUsers.map((u: any) => {
          if (u.id === id || (targetPelajar && u.email === targetPelajar.email)) {
            return { ...u, verificationStatus: 'VERIFIED', isVerified: true, catatanPenolakan: null }
          }
          return u
        })
        localStorage.setItem('mitra_muda_all_registered_users_v1', JSON.stringify(updatedAll))
      }
    } catch {
    }
  }

  
  const success = await patchWithRetry(`/api/pelajar/${id}`, {
    verificationStatus: 'VERIFIED',
    catatanPenolakan: null
  })

  if (!success) {
    console.error(`Failed to persist pelajar ${id} verification to DB after retries`)
  }

  
  await syncAdminUsersFromDB()

  return success
}

export async function adminRejectPelajar(id: string, reason?: string): Promise<boolean> {
  recordRecentMutation(id, 'REJECTED')
  const state = getVerificationState()
  const targetPelajar = state.pelajarList.find((p) => p.id === id)
  if (targetPelajar?.email) {
    recordRecentMutation(targetPelajar.email, 'REJECTED')
  }
  const cleanReason = reason || 'Dokumen kartu pelajar tidak sesuai persyaratan'
  const updated = state.pelajarList.map((p) =>
    p.id === id || (targetPelajar && p.email === targetPelajar.email)
      ? { ...p, verificationStatus: 'REJECTED' as const, catatanPenolakan: cleanReason }
      : p
  )
  saveVerificationState({ ...state, pelajarList: updated })

  broadcastVerificationChange({
    role: 'pelajar',
    id,
    email: targetPelajar?.email,
    status: 'REJECTED'
  })

  if (typeof window !== 'undefined') {
    try {
      const allUsersRaw = localStorage.getItem('mitra_muda_all_registered_users_v1')
      if (allUsersRaw) {
        const allUsers = JSON.parse(allUsersRaw)
        const updatedAll = allUsers.map((u: any) => {
          if (u.id === id || (targetPelajar && u.email === targetPelajar.email)) {
            return { ...u, verificationStatus: 'REJECTED', isVerified: false, catatanPenolakan: cleanReason }
          }
          return u
        })
        localStorage.setItem('mitra_muda_all_registered_users_v1', JSON.stringify(updatedAll))
      }
    } catch {
    }
  }

  const success = await patchWithRetry(`/api/pelajar/${id}`, {
    verificationStatus: 'REJECTED',
    catatanPenolakan: cleanReason
  })

  if (!success) {
    console.error(`Failed to persist pelajar ${id} rejection to DB after retries`)
  }

  await syncAdminUsersFromDB()
  return success
}

export async function adminVerifySekolah(id: string): Promise<boolean> {
  recordRecentMutation(id, 'VERIFIED')
  const state = getVerificationState()
  const targetSekolah = state.sekolahList.find((s) => s.id === id)
  if (targetSekolah?.emailResmi) {
    recordRecentMutation(targetSekolah.emailResmi, 'VERIFIED')
  }
  const updated = state.sekolahList.map((s) =>
    s.id === id ? { ...s, verificationStatus: 'VERIFIED' as const } : s
  )
  saveVerificationState({ ...state, sekolahList: updated })

  broadcastVerificationChange({
    role: 'sekolah',
    id,
    email: targetSekolah?.emailResmi,
    status: 'VERIFIED'
  })

  const success = await patchWithRetry(`/api/sekolah/${id}`, {
    verificationStatus: 'VERIFIED'
  })

  if (!success) {
    console.error(`Failed to persist sekolah ${id} verification to DB after retries`)
  }

  await syncAdminUsersFromDB()
  return success
}

export async function adminRejectSekolah(id: string): Promise<boolean> {
  recordRecentMutation(id, 'REJECTED')
  const state = getVerificationState()
  const targetSekolah = state.sekolahList.find((s) => s.id === id)
  if (targetSekolah?.emailResmi) {
    recordRecentMutation(targetSekolah.emailResmi, 'REJECTED')
  }
  const updated = state.sekolahList.map((s) =>
    s.id === id ? { ...s, verificationStatus: 'REJECTED' as const } : s
  )
  saveVerificationState({ ...state, sekolahList: updated })

  broadcastVerificationChange({
    role: 'sekolah',
    id,
    email: targetSekolah?.emailResmi,
    status: 'REJECTED'
  })

  const success = await patchWithRetry(`/api/sekolah/${id}`, {
    verificationStatus: 'REJECTED'
  })

  if (!success) {
    console.error(`Failed to persist sekolah ${id} rejection to DB after retries`)
  }

  await syncAdminUsersFromDB()
  return success
}

export async function adminVerifyUMKM(id: string): Promise<boolean> {
  recordRecentMutation(id, 'VERIFIED')
  const state = getVerificationState()
  const targetUMKM = state.umkmList.find((u) => u.id === id)
  if (targetUMKM?.email) {
    recordRecentMutation(targetUMKM.email, 'VERIFIED')
  }
  const updated = state.umkmList.map((u) =>
    u.id === id ? { ...u, isVerified: true } : u
  )
  saveVerificationState({ ...state, umkmList: updated })

  broadcastVerificationChange({
    role: 'umkm',
    id,
    email: targetUMKM?.email,
    status: 'VERIFIED'
  })

  const success = await patchWithRetry(`/api/umkm/${id}`, {
    isVerified: true
  })

  if (!success) {
    console.error(`Failed to persist UMKM ${id} verification to DB after retries`)
  }

  await syncAdminUsersFromDB()
  return success
}

export async function adminRevokeUMKM(id: string): Promise<boolean> {
  recordRecentMutation(id, 'REJECTED')
  const state = getVerificationState()
  const targetUMKM = state.umkmList.find((u) => u.id === id)
  if (targetUMKM?.email) {
    recordRecentMutation(targetUMKM.email, 'REJECTED')
  }
  const updated = state.umkmList.map((u) =>
    u.id === id ? { ...u, isVerified: false } : u
  )
  saveVerificationState({ ...state, umkmList: updated })

  broadcastVerificationChange({
    role: 'umkm',
    id,
    email: targetUMKM?.email,
    status: 'REJECTED'
  })

  const success = await patchWithRetry(`/api/umkm/${id}`, {
    isVerified: false
  })

  if (!success) {
    console.error(`Failed to persist UMKM ${id} revocation to DB after retries`)
  }

  await syncAdminUsersFromDB()
  return success
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
