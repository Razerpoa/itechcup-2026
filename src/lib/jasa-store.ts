'use client'

import { useSyncExternalStore } from 'react'

export interface JasaItem {
  id: string
  pelajarId?: string
  namaPelajar: string
  fotoProfil?: string
  judul: string
  keteranganSingkat: string
  keteranganPanjang?: string
  kategori: string
  tags: string[]
  foto?: string
  hargaBasic: number
  deskripsiBasic?: string
  hargaStandard?: number
  deskripsiStandard?: string
  hargaPremium?: number
  deskripsiPremium?: string
  ratingRata: number
  jumlahProyekSelesai: number
  isActive: boolean
  createdAt: string
}

let cachedList: JasaItem[] = []
let isFetching = false
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export async function syncJasaWithDB() {
  if (isFetching) return
  isFetching = true
  try {
    const res = await fetch('/api/jasa')
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json.data)) {
        cachedList = json.data
        emitChange()
      }
    }
  } catch {
    // ignore
  } finally {
    isFetching = false
  }
}

export function getAllJasa(): JasaItem[] {
  return cachedList
}

export async function addJasa(item: Omit<JasaItem, 'id' | 'createdAt' | 'ratingRata' | 'jumlahProyekSelesai' | 'isActive'>): Promise<JasaItem> {
  try {
    const res = await fetch('/api/jasa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })

    if (res.ok) {
      const json = await res.json()
      if (json.data) {
        await syncJasaWithDB()
        return json.data
      }
    }
  } catch (err) {
    console.error('Failed to post Jasa to DB:', err)
  }

  const fallbackItem: JasaItem = {
    ...item,
    id: 'jasa-' + Date.now(),
    ratingRata: 5.0,
    jumlahProyekSelesai: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  cachedList = [fallbackItem, ...cachedList]
  emitChange()
  return fallbackItem
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  syncJasaWithDB()
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): JasaItem[] {
  return cachedList
}

const EMPTY_JASA: JasaItem[] = []

function getServerSnapshot(): JasaItem[] {
  return EMPTY_JASA
}

export function useJasaStore(): JasaItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
