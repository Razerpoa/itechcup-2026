'use client'

import { useSyncExternalStore } from 'react'
import { payProjectDPWithDeposit, releaseProjectCompletionToPelajar } from './escrow-store'

export interface LamaranItem {
  id: string
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
  pelajarId: string
  namaPelajar: string
  sekolahNama?: string
  pesanMotivasi: string
  hargaTawar: number
  portofolioUrl?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

export interface ChatMsgItem {
  id: string
  proyekId: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm'
  recipientId: string
  text: string
  createdAt: string
}

export interface DeliverableItem {
  id: string
  fileName: string
  fileSize: string
  fileUrl?: string
  uploadedAt: string
  catatan?: string
}

export interface AkadTransaksiItem {
  id: string
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
  pelajarId: string
  namaPelajar: string
  sekolahNama?: string
  nominalTotal: number
  nominalDP: number
  step: 1 | 2 | 3 | 4
  deliverables: DeliverableItem[]
  rating?: number
  ulasan?: string
  createdAt: string
  completedAt?: string
}

export interface AkadStoreData {
  lamaranList: LamaranItem[]
  chatMessages: ChatMsgItem[]
  akadList: AkadTransaksiItem[]
}

const STORAGE_KEY = 'mitra_muda_akad_store_v1'

const INITIAL_DATA: AkadStoreData = {
  lamaranList: [],
  chatMessages: [],
  akadList: []
}

let cachedData: AkadStoreData = INITIAL_DATA
let lastRaw: string | null = '__init__'
const listeners = new Set<() => void>()

function emitChange() {
  lastRaw = '__dirty__'
  for (const listener of listeners) {
    listener()
  }
}

export function getAkadState(): AkadStoreData {
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
      cachedData = JSON.parse(raw) as AkadStoreData
    }
    return cachedData
  } catch {
    return INITIAL_DATA
  }
}

function saveAkadState(data: AkadStoreData) {
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

interface ApiLamaranResponse {
  id: string
  proyekId: string
  judulProyek?: string
  umkmId?: string
  namaUsaha?: string
  pelajarId: string
  namaPelajar?: string
  sekolahNama?: string
  pesanMotivasi?: string
  hargaTawar?: number
  portofolioUrl?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  proyek?: {
    id: string
    judul: string
    budgetMax: number
    umkmId?: string
    umkm?: {
      id: string
      namaUsaha: string
      namaPemilik: string
    }
  }
  pelajar?: {
    id: string
    namaLengkap: string
    email: string
    sekolah?: {
      namaSekolah: string
    }
  }
}

export async function syncAkadWithDB(): Promise<AkadStoreData> {
  const currentState = getAkadState()
  try {
    const res = await fetch('/api/lamaran', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json.data) && json.data.length > 0) {
        const dbItems: LamaranItem[] = json.data.map((item: ApiLamaranResponse) => ({
          id: item.id,
          proyekId: item.proyekId || item.proyek?.id || 'proyek-1',
          judulProyek: item.judulProyek || item.proyek?.judul || 'Lowongan Proyek UMKM',
          umkmId: item.umkmId || item.proyek?.umkmId || item.proyek?.umkm?.id || 'umkm-default',
          namaUsaha: item.namaUsaha || item.proyek?.umkm?.namaUsaha || 'UMKM Mitra Muda',
          pelajarId: item.pelajarId || item.pelajar?.id || 'pelajar-1',
          namaPelajar: item.namaPelajar || item.pelajar?.namaLengkap || 'Pelajar Siswa',
          sekolahNama: item.sekolahNama || item.pelajar?.sekolah?.namaSekolah || 'Siswa SMK/SMA',
          pesanMotivasi: item.pesanMotivasi || '',
          hargaTawar: item.hargaTawar || item.proyek?.budgetMax || 500000,
          portofolioUrl: item.portofolioUrl,
          status: item.status || 'PENDING',
          createdAt: item.createdAt
        }))

        const mergedLamaran = [
          ...dbItems,
          ...currentState.lamaranList.filter((local) => !dbItems.some((db) => db.id === local.id))
        ]

        const generatedAkads: AkadTransaksiItem[] = mergedLamaran
          .filter((l) => l.status === 'ACCEPTED')
          .map((l) => {
            const existingAkad = currentState.akadList.find((a) => a.proyekId === l.proyekId || a.id === l.id || a.id === 'akad-' + l.id)
            if (existingAkad) return existingAkad
            const nominalTotal = l.hargaTawar || 500000
            const nominalDP = Math.round(nominalTotal * 0.3)
            return {
              id: 'akad-' + l.id,
              proyekId: l.proyekId,
              judulProyek: l.judulProyek,
              umkmId: l.umkmId,
              namaUsaha: l.namaUsaha,
              pelajarId: l.pelajarId,
              namaPelajar: l.namaPelajar,
              sekolahNama: l.sekolahNama,
              nominalTotal,
              nominalDP,
              step: 2,
              deliverables: [],
              createdAt: l.createdAt
            }
          })

        const mergedAkadList = [
          ...generatedAkads,
          ...currentState.akadList.filter((a) => !generatedAkads.some((g) => g.id === a.id))
        ]

        let mergedChatMessages = currentState.chatMessages
        try {
          const chatRes = await fetch('/api/chat', { cache: 'no-store' })
          if (chatRes.ok) {
            const chatJson = await chatRes.json()
            if (Array.isArray(chatJson.data)) {
              const apiChats: ChatMsgItem[] = chatJson.data
              mergedChatMessages = [
                ...apiChats,
                ...currentState.chatMessages.filter((c) => !apiChats.some((a) => a.id === c.id))
              ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            }
          }
        } catch {
        }

        const newState: AkadStoreData = {
          ...currentState,
          lamaranList: mergedLamaran,
          akadList: mergedAkadList,
          chatMessages: mergedChatMessages
        }
        saveAkadState(newState)
        return newState
      }
    }
  } catch {
  }
  return currentState
}

export function submitLamaran(payload: {
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
  pelajarId: string
  namaPelajar: string
  sekolahNama?: string
  pesanMotivasi: string
  hargaTawar: number
  portofolioUrl?: string
}): LamaranItem {
  const state = getAkadState()
  const existing = state.lamaranList.find(
    (l) => l.proyekId === payload.proyekId && l.pelajarId === payload.pelajarId
  )

  const newItem: LamaranItem = {
    id: existing ? existing.id : 'lam-' + Date.now(),
    proyekId: payload.proyekId,
    judulProyek: payload.judulProyek,
    umkmId: payload.umkmId,
    namaUsaha: payload.namaUsaha,
    pelajarId: payload.pelajarId,
    namaPelajar: payload.namaPelajar,
    sekolahNama: payload.sekolahNama || 'Siswa SMK/SMA Terverifikasi',
    pesanMotivasi: payload.pesanMotivasi,
    hargaTawar: payload.hargaTawar,
    portofolioUrl: payload.portofolioUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }

  const updated = existing
    ? state.lamaranList.map((l) => (l.id === existing.id ? newItem : l))
    : [newItem, ...state.lamaranList]

  saveAkadState({
    ...state,
    lamaranList: updated
  })

  try {
    fetch('/api/lamaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newItem.id,
        proyekId: newItem.proyekId,
        judulProyek: newItem.judulProyek,
        umkmId: newItem.umkmId,
        namaUsaha: newItem.namaUsaha,
        pelajarId: newItem.pelajarId,
        namaPelajar: newItem.namaPelajar,
        sekolahNama: newItem.sekolahNama,
        pesanMotivasi: newItem.pesanMotivasi,
        hargaTawar: newItem.hargaTawar,
        portofolioUrl: newItem.portofolioUrl,
        status: newItem.status,
        createdAt: newItem.createdAt
      })
    }).catch(() => {})
  } catch {
  }

  return newItem
}

export function sendAkadChat(payload: {
  proyekId: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm'
  recipientId: string
  text: string
}): ChatMsgItem {
  const state = getAkadState()
  const newChat: ChatMsgItem = {
    id: 'msg-' + Date.now(),
    proyekId: payload.proyekId,
    senderId: payload.senderId,
    senderName: payload.senderName,
    senderRole: payload.senderRole,
    recipientId: payload.recipientId,
    text: payload.text,
    createdAt: new Date().toISOString()
  }

  saveAkadState({
    ...state,
    chatMessages: [...state.chatMessages, newChat]
  })

  try {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChat)
    }).catch(() => {})
  } catch {
  }

  return newChat
}

export function acceptLamaranAndCreateAkad(lamaranId: string): { success: boolean; akad?: AkadTransaksiItem; error?: string } {
  const state = getAkadState()
  const lamaran = state.lamaranList.find((l) => l.id === lamaranId)
  if (!lamaran) return { success: false, error: 'Lamaran tidak ditemukan' }

  const nominalTotal = lamaran.hargaTawar || 500000
  const nominalDP = Math.round(nominalTotal * 0.3)

  payProjectDPWithDeposit({
    umkmId: lamaran.umkmId,
    namaUsaha: lamaran.namaUsaha,
    proyekId: lamaran.proyekId,
    judulProyek: lamaran.judulProyek,
    pelajarId: lamaran.pelajarId,
    namaPelajar: lamaran.namaPelajar,
    nominalTotal,
    nominalDP
  })

  const newAkad: AkadTransaksiItem = {
    id: 'akad-' + Date.now(),
    proyekId: lamaran.proyekId,
    judulProyek: lamaran.judulProyek,
    umkmId: lamaran.umkmId,
    namaUsaha: lamaran.namaUsaha,
    pelajarId: lamaran.pelajarId,
    namaPelajar: lamaran.namaPelajar,
    sekolahNama: lamaran.sekolahNama,
    nominalTotal,
    nominalDP,
    step: 2,
    deliverables: [],
    createdAt: new Date().toISOString()
  }

  const updatedLamaran = state.lamaranList.map((l) =>
    l.id === lamaranId ? { ...l, status: 'ACCEPTED' as const } : l
  )

  saveAkadState({
    ...state,
    lamaranList: updatedLamaran,
    akadList: [newAkad, ...state.akadList.filter((a) => a.proyekId !== lamaran.proyekId)]
  })

  try {
    fetch(`/api/lamaran/${lamaranId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    }).catch(() => {})
  } catch {
  }

  return { success: true, akad: newAkad }
}

export function rejectLamaran(lamaranId: string): boolean {
  const state = getAkadState()
  const updatedLamaran = state.lamaranList.map((l) =>
    l.id === lamaranId ? { ...l, status: 'REJECTED' as const } : l
  )

  saveAkadState({
    ...state,
    lamaranList: updatedLamaran
  })

  try {
    fetch(`/api/lamaran/${lamaranId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' })
    }).catch(() => {})
  } catch {
  }

  return true
}

export function submitPelajarDeliverable(akadId: string, deliverable: { fileName: string; fileSize: string; catatan?: string }): boolean {
  const state = getAkadState()
  const akad = state.akadList.find((a) => a.id === akadId)
  if (!akad) return false

  const newDeliverable: DeliverableItem = {
    id: 'del-' + Date.now(),
    fileName: deliverable.fileName,
    fileSize: deliverable.fileSize,
    catatan: deliverable.catatan,
    uploadedAt: new Date().toISOString()
  }

  const updatedAkadList = state.akadList.map((a) =>
    a.id === akadId
      ? {
          ...a,
          step: 3 as const,
          deliverables: [newDeliverable, ...a.deliverables]
        }
      : a
  )

  saveAkadState({
    ...state,
    akadList: updatedAkadList
  })

  return true
}

export function completeAkadAndPayout(akadId: string, rating?: number, ulasan?: string): boolean {
  const state = getAkadState()
  const akad = state.akadList.find((a) => a.id === akadId)
  if (!akad) return false

  releaseProjectCompletionToPelajar('esc-' + akad.proyekId)

  const finalRating = rating && rating >= 1 && rating <= 5 ? rating : 5
  const finalUlasan = ulasan && ulasan.trim() ? ulasan.trim() : 'Pekerjaan diselesaikan dengan sangat baik sesuai spesifikasi.'

  const updatedAkadList = state.akadList.map((a) =>
    a.id === akadId
      ? {
          ...a,
          step: 4 as const,
          rating: finalRating,
          ulasan: finalUlasan,
          completedAt: new Date().toISOString()
        }
      : a
  )

  saveAkadState({
    ...state,
    akadList: updatedAkadList
  })

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

function getSnapshot(): AkadStoreData {
  return getAkadState()
}

function getServerSnapshot(): AkadStoreData {
  return INITIAL_DATA
}

export function useAkadStore(): AkadStoreData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
