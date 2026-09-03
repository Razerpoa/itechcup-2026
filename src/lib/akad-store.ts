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

export interface ChatAttachment {
  name: string
  size: string
  type: 'image' | 'file'
  dataUrl?: string
  fileUrl?: string
}

export interface ChatMsgItem {
  id: string
  proyekId: string
  judulProyek?: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm' | 'sekolah'
  recipientId: string
  recipientName?: string
  namaUsaha?: string
  text: string
  createdAt: string
  isRead?: boolean
  attachment?: ChatAttachment
}

export interface DeliverableItem {
  id: string
  fileName: string
  fileSize: string
  fileUrl?: string
  filePreview?: string
  fileType?: string
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
const CHAT_CHANNEL_NAME = 'mitra_muda_chat_sync'

const INITIAL_DATA: AkadStoreData = {
  lamaranList: [],
  chatMessages: [],
  akadList: []
}

let cachedData: AkadStoreData = INITIAL_DATA
let lastRaw: string | null = '__init__'
const listeners = new Set<() => void>()

let chatBroadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    chatBroadcastChannel = new BroadcastChannel(CHAT_CHANNEL_NAME)
    chatBroadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'NEW_CHAT' && event.data.chat) {
        const state = getAkadState()
        const incoming: ChatMsgItem = event.data.chat
        if (!state.chatMessages.some((c) => c.id === incoming.id)) {
          saveAkadState({
            ...state,
            chatMessages: [...state.chatMessages, incoming]
          })
        }
      } else if (event.data?.type === 'SYNC_AKAD') {
        syncAkadWithDB()
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

export function getAkadState(): AkadStoreData {
  return cachedData
}

function saveAkadState(data: AkadStoreData) {
  cachedData = data
  if (typeof window !== 'undefined') {
    try {
      if (chatBroadcastChannel) {
        chatBroadcastChannel.postMessage({ type: 'SYNC_AKAD' })
      }
      window.dispatchEvent(new CustomEvent('mitramuda_akad_change'))
    } catch {
    }
  }
  emitChange()
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncAkadWithDB().catch(() => {})
  }, 100)
}

export interface ApiLamaranResponse {
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

export interface ApiTransaksiResponse {
  id: string
  proyekId: string
  lamaranId: string
  totalAmount: number
  dpAmount: number
  dpPaid: boolean
  fullPaid: boolean
  status: string
  submitUrl?: string | null
  catatanPelajar?: string | null
  catatanUMKM?: string | null
  deliverablesJson?: string | null
  rating?: number
  updatedAt?: string
}

export async function syncAkadWithDB(): Promise<AkadStoreData> {
  const currentState = getAkadState()
  let mergedLamaran = currentState.lamaranList
  let mergedAkadList = currentState.akadList
  let mergedChatMessages = currentState.chatMessages

  try {
    const [lamaranRes, chatRes, trxRes] = await Promise.allSettled([
      fetch('/api/lamaran', { cache: 'no-store' }),
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SYNC', chats: currentState.chatMessages }),
        cache: 'no-store'
      }),
      fetch('/api/transaksi', { cache: 'no-store' })
    ])

    if (lamaranRes.status === 'fulfilled' && lamaranRes.value.ok) {
      const json = await lamaranRes.value.json()
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

        mergedLamaran = [
          ...dbItems,
          ...currentState.lamaranList.filter((local) => !dbItems.some((db) => db.id === local.id))
        ]

        const generatedAkads: AkadTransaksiItem[] = mergedLamaran
          .filter((l) => l.status === 'ACCEPTED')
          .map((l) => {
            const existingAkad = currentState.akadList.find(
              (a) => a.proyekId === l.proyekId || a.id === l.id || a.id === 'akad-' + l.id
            )
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

        mergedAkadList = [
          ...generatedAkads,
          ...currentState.akadList.filter((a) => !generatedAkads.some((g) => g.id === a.id))
        ]
      }
    }

    if (trxRes.status === 'fulfilled' && trxRes.value.ok) {
      const trxJson = await trxRes.value.json()
      if (Array.isArray(trxJson.data) && trxJson.data.length > 0) {
        const dbTrxs: ApiTransaksiResponse[] = trxJson.data

        mergedAkadList = mergedAkadList.map((akad) => {
          const matchingTrx = dbTrxs.find(
            (t) =>
              t.proyekId === akad.proyekId ||
              t.id === akad.id ||
              t.id === akad.id.replace('akad-', '') ||
              t.lamaranId === akad.id.replace('akad-', '')
          )

          if (!matchingTrx) return akad

          let newStep: 1 | 2 | 3 | 4 = akad.step
          if (matchingTrx.status === 'SELESAI' || matchingTrx.fullPaid) {
            if (akad.step !== 4) {
              releaseProjectCompletionToPelajar({
                proyekId: akad.proyekId,
                pelajarId: akad.pelajarId,
                namaPelajar: akad.namaPelajar,
                nominalTotal: matchingTrx.totalAmount || akad.nominalTotal,
                nominalDP: matchingTrx.dpAmount || akad.nominalDP,
                umkmId: akad.umkmId,
                namaUsaha: akad.namaUsaha,
                judulProyek: akad.judulProyek
              })
            }
            newStep = 4
          } else if (matchingTrx.status === 'DIREVISE') {
            newStep = 2
          } else if (matchingTrx.status === 'SUBMITTED' || (matchingTrx.deliverablesJson && matchingTrx.deliverablesJson.length > 5)) {
            if (akad.step !== 4) newStep = 3
          }

          let mergedDeliverables = akad.deliverables
          if (matchingTrx.deliverablesJson) {
            try {
              const parsedDelivs = JSON.parse(matchingTrx.deliverablesJson)
              if (Array.isArray(parsedDelivs) && parsedDelivs.length > 0) {
                mergedDeliverables = [
                  ...parsedDelivs,
                  ...akad.deliverables.filter((d) => !parsedDelivs.some((p: DeliverableItem) => p.id === d.id || p.fileName === d.fileName))
                ]
              }
            } catch {
            }
          }

          return {
            ...akad,
            step: newStep,
            deliverables: mergedDeliverables,
            rating: matchingTrx.rating || akad.rating || 5,
            ulasan: matchingTrx.catatanUMKM || akad.ulasan,
            completedAt: matchingTrx.status === 'SELESAI' ? matchingTrx.updatedAt || new Date().toISOString() : akad.completedAt
          }
        })
      }
    }

    if (chatRes.status === 'fulfilled' && chatRes.value.ok) {
      const chatJson = await chatRes.value.json()
      if (Array.isArray(chatJson.data)) {
        const apiChats: ChatMsgItem[] = chatJson.data
        const localChats = currentState.chatMessages
        mergedChatMessages = apiChats.map((ac) => {
          const localMatch = localChats.find((lc) => lc.id === ac.id)
          if (localMatch?.attachment?.dataUrl && !ac.attachment?.dataUrl) {
            return { ...ac, attachment: localMatch.attachment }
          }
          return ac
        })
        for (const lc of localChats) {
          if (!mergedChatMessages.some((m) => m.id === lc.id)) {
            mergedChatMessages.push(lc)
          }
        }
        mergedChatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
    }

    const newState: AkadStoreData = {
      lamaranList: mergedLamaran,
      akadList: mergedAkadList,
      chatMessages: mergedChatMessages
    }
    saveAkadState(newState)
    return newState
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
  judulProyek?: string
  senderId: string
  senderName: string
  senderRole: 'pelajar' | 'umkm' | 'sekolah'
  recipientId: string
  recipientName?: string
  namaUsaha?: string
  text: string
  attachment?: ChatAttachment
}): ChatMsgItem {
  const state = getAkadState()
  const newChat: ChatMsgItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    proyekId: payload.proyekId,
    judulProyek: payload.judulProyek || 'Proyek Marketplace',
    senderId: payload.senderId,
    senderName: payload.senderName,
    senderRole: payload.senderRole,
    recipientId: payload.recipientId,
    recipientName: payload.recipientName || '',
    namaUsaha: payload.namaUsaha || '',
    text: payload.text,
    createdAt: new Date().toISOString(),
    isRead: false,
    attachment: payload.attachment
  }

  saveAkadState({
    ...state,
    chatMessages: [...state.chatMessages, newChat]
  })

  if (typeof window !== 'undefined') {
    try {
      if (chatBroadcastChannel) {
        chatBroadcastChannel.postMessage({
          type: 'NEW_CHAT',
          chat: newChat
        })
      }
      window.dispatchEvent(new CustomEvent('mitramuda_new_chat', { detail: newChat }))
    } catch {
    }
  }

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
    id: 'akad-' + lamaran.id,
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

  const existingAkadIndex = state.akadList.findIndex((a) => a.id === newAkad.id || a.proyekId === newAkad.proyekId)
  const updatedAkad =
    existingAkadIndex >= 0
      ? state.akadList.map((a, i) => (i === existingAkadIndex ? newAkad : a))
      : [newAkad, ...state.akadList]

  saveAkadState({
    ...state,
    lamaranList: updatedLamaran,
    akadList: updatedAkad
  })

  try {
    fetch(`/api/lamaran/${lamaranId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    }).catch(() => {})

    fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lamaran.id,
        proyekId: lamaran.proyekId,
        lamaranId: lamaran.id,
        totalAmount: nominalTotal,
        dpAmount: nominalDP,
        dpPaid: true,
        fullPaid: false,
        status: 'PENGERJAAN'
      })
    }).catch(() => {})
  } catch {
  }

  return { success: true, akad: newAkad }
}

export function rejectLamaran(lamaranId: string): boolean {
  const state = getAkadState()
  const updated = state.lamaranList.map((l) =>
    l.id === lamaranId ? { ...l, status: 'REJECTED' as const } : l
  )
  saveAkadState({
    ...state,
    lamaranList: updated
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

export function uploadDeliverableWork(
  akadId: string,
  item: Omit<DeliverableItem, 'id' | 'uploadedAt'>
): boolean {
  const state = getAkadState()
  const targetAkad = state.akadList.find(
    (a) => a.id === akadId || a.proyekId === akadId || a.id === 'akad-' + akadId
  )
  if (!targetAkad) return false

  const newDeliverable: DeliverableItem = {
    id: 'deliv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    ...item,
    uploadedAt: new Date().toISOString()
  }

  const newDeliverablesList = [...targetAkad.deliverables, newDeliverable]

  const updated = state.akadList.map((a) => {
    if (a.id === targetAkad.id) {
      return {
        ...a,
        step: 3 as const,
        deliverables: newDeliverablesList
      }
    }
    return a
  })

  saveAkadState({
    ...state,
    akadList: updated
  })

  sendAkadChat({
    proyekId: targetAkad.proyekId,
    judulProyek: targetAkad.judulProyek,
    senderId: targetAkad.pelajarId,
    senderName: targetAkad.namaPelajar,
    senderRole: 'pelajar',
    recipientId: targetAkad.umkmId,
    recipientName: targetAkad.namaUsaha,
    namaUsaha: targetAkad.namaUsaha,
    text: `[Penyerahan Karya]: Berkas "${item.fileName}" telah saya serahkan untuk ditinjau.`
  })

  try {
    fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetAkad.id.replace('akad-', ''),
        proyekId: targetAkad.proyekId,
        lamaranId: targetAkad.id.replace('akad-', ''),
        totalAmount: targetAkad.nominalTotal,
        dpAmount: targetAkad.nominalDP,
        dpPaid: true,
        fullPaid: false,
        status: 'SUBMITTED',
        submitUrl: item.fileUrl || item.fileName,
        catatanPelajar: item.catatan || `Berkas ${item.fileName} diserahkan`,
        deliverablesJson: JSON.stringify(newDeliverablesList)
      })
    }).catch(() => {})
  } catch {
  }

  return true
}

export const submitPelajarDeliverable = uploadDeliverableWork

export function requestRevisionWork(akadId: string, catatanRevisi: string): boolean {
  const state = getAkadState()
  const targetAkad = state.akadList.find(
    (a) => a.id === akadId || a.proyekId === akadId || a.id === 'akad-' + akadId
  )
  if (!targetAkad || targetAkad.step === 4) return false

  const updated = state.akadList.map((a) => {
    if (a.id === targetAkad.id) {
      return {
        ...a,
        step: 2 as const,
        ulasan: catatanRevisi
      }
    }
    return a
  })

  saveAkadState({
    ...state,
    akadList: updated
  })

  sendAkadChat({
    proyekId: targetAkad.proyekId,
    judulProyek: targetAkad.judulProyek,
    senderId: targetAkad.umkmId || 'umkm-default',
    senderName: targetAkad.namaUsaha || 'Pemilik UMKM',
    senderRole: 'umkm',
    recipientId: targetAkad.pelajarId,
    recipientName: targetAkad.namaPelajar,
    namaUsaha: targetAkad.namaUsaha,
    text: `[Permintaan Revisi]: ${catatanRevisi}`
  })

  try {
    fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetAkad.id.replace('akad-', ''),
        proyekId: targetAkad.proyekId,
        lamaranId: targetAkad.id.replace('akad-', ''),
        totalAmount: targetAkad.nominalTotal,
        dpAmount: targetAkad.nominalDP,
        dpPaid: true,
        fullPaid: false,
        status: 'DIREVISE',
        catatanUMKM: catatanRevisi
      })
    }).catch(() => {})
  } catch {
  }

  return true
}

export function completeAkadAndPayout(akadId: string, rating: number, ulasan?: string): boolean {
  const state = getAkadState()
  const targetAkad = state.akadList.find(
    (a) => a.id === akadId || a.proyekId === akadId || a.id === 'akad-' + akadId
  )
  if (!targetAkad) return false

  releaseProjectCompletionToPelajar({
    proyekId: targetAkad.proyekId,
    pelajarId: targetAkad.pelajarId,
    namaPelajar: targetAkad.namaPelajar,
    nominalTotal: targetAkad.nominalTotal,
    nominalDP: targetAkad.nominalDP,
    umkmId: targetAkad.umkmId,
    namaUsaha: targetAkad.namaUsaha,
    judulProyek: targetAkad.judulProyek
  })

  const updated = state.akadList.map((a) => {
    if (a.id === targetAkad.id) {
      return {
        ...a,
        step: 4 as const,
        rating,
        ulasan: ulasan || 'Pekerjaan diselesaikan dengan sangat baik sesuai spesifikasi.',
        completedAt: new Date().toISOString()
      }
    }
    return a
  })

  saveAkadState({
    ...state,
    akadList: updated
  })

  try {
    fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetAkad.id.replace('akad-', ''),
        proyekId: targetAkad.proyekId,
        lamaranId: targetAkad.id.replace('akad-', ''),
        totalAmount: targetAkad.nominalTotal,
        dpAmount: targetAkad.nominalDP,
        dpPaid: true,
        fullPaid: true,
        status: 'SELESAI',
        rating,
        catatanUMKM: ulasan || 'Pekerjaan diselesaikan dengan sangat baik.',
        deliverablesJson: JSON.stringify(targetAkad.deliverables)
      })
    }).catch(() => {})
  } catch {
  }

  return true
}

export function updateAkadStatusDirectly(
  akadId: string,
  newStep: 1 | 2 | 3 | 4,
  catatan?: string
): boolean {
  const state = getAkadState()
  const targetAkad = state.akadList.find(
    (a) => a.id === akadId || a.proyekId === akadId || a.id === 'akad-' + akadId
  )
  if (!targetAkad || (targetAkad.step === 4 && newStep !== 4)) return false

  if (newStep === 4) {
    releaseProjectCompletionToPelajar({
      proyekId: targetAkad.proyekId,
      pelajarId: targetAkad.pelajarId,
      namaPelajar: targetAkad.namaPelajar,
      nominalTotal: targetAkad.nominalTotal,
      nominalDP: targetAkad.nominalDP,
      umkmId: targetAkad.umkmId,
      namaUsaha: targetAkad.namaUsaha,
      judulProyek: targetAkad.judulProyek
    })
  }

  const updated = state.akadList.map((a) => {
    if (a.id === targetAkad.id) {
      return {
        ...a,
        step: newStep,
        ulasan: catatan || a.ulasan,
        completedAt: newStep === 4 ? new Date().toISOString() : a.completedAt
      }
    }
    return a
  })

  saveAkadState({
    ...state,
    akadList: updated
  })

  const serverStatus =
    newStep === 4 ? 'SELESAI' : newStep === 3 ? 'SUBMITTED' : newStep === 2 ? 'PENGERJAAN' : 'MENUNGGU_PEMBAYARAN'

  try {
    fetch('/api/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetAkad.id.replace('akad-', ''),
        proyekId: targetAkad.proyekId,
        lamaranId: targetAkad.id.replace('akad-', ''),
        totalAmount: targetAkad.nominalTotal,
        dpAmount: targetAkad.nominalDP,
        dpPaid: true,
        fullPaid: newStep === 4,
        status: serverStatus,
        catatanUMKM: catatan || (newStep === 4 ? 'Proyek disetujui & diselesaikan oleh UMKM' : undefined),
        deliverablesJson: JSON.stringify(targetAkad.deliverables)
      })
    }).catch(() => {})
  } catch {
  }

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
