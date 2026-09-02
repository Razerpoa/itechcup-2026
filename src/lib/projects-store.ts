'use client'

import { useSyncExternalStore } from 'react'

export interface ProyekItem {
  id: string
  judul: string
  keteranganSingkat: string
  namaUsaha: string
  budgetMin: number
  budgetMax: number
  dpPersen: number
  tags: string[]
  createdAt: string
  jumlahPelamar: number
  fotoUsaha?: string
  umkmId?: string
  durasi?: string
}

let cachedList: ProyekItem[] = []
let isFetching = false
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

interface ApiProyekResponse {
  id: string
  judul: string
  keteranganSingkat: string
  budgetMin: number
  budgetMax: number
  dpPersen: number
  tags?: string[]
  createdAt: string
  umkmId?: string
  umkm?: {
    namaUsaha?: string
    fotoUsaha?: string
  }
  fotoBanner?: string
  fotoProfil?: string
  _count?: {
    lamaran?: number
  }
}

export async function syncProjectsWithDB(): Promise<ProyekItem[]> {
  if (isFetching) return cachedList
  isFetching = true
  try {
    const res = await fetch('/api/proyek', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json.data)) {
        const formatted: ProyekItem[] = json.data.map((item: ApiProyekResponse) => ({
          id: item.id,
          judul: item.judul,
          keteranganSingkat: item.keteranganSingkat,
          namaUsaha: item.umkm?.namaUsaha || 'UMKM Mitra Muda',
          budgetMin: item.budgetMin,
          budgetMax: item.budgetMax,
          dpPersen: item.dpPersen,
          tags: item.tags || [],
          createdAt: item.createdAt,
          jumlahPelamar: item._count?.lamaran || 0,
          fotoUsaha: item.umkm?.fotoUsaha || item.fotoBanner || item.fotoProfil,
          umkmId: item.umkmId
        }))

        cachedList = formatted
        emitChange()
        return formatted
      }
    }
  } catch {
  } finally {
    isFetching = false
  }
  return cachedList
}

export function getAllProjects(): ProyekItem[] {
  return cachedList
}

export async function addProject(item: Omit<ProyekItem, 'id' | 'createdAt' | 'jumlahPelamar'>): Promise<ProyekItem> {
  try {
    const res = await fetch('/api/proyek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        umkmId: item.umkmId,
        namaUsaha: item.namaUsaha,
        judul: item.judul,
        keteranganSingkat: item.keteranganSingkat,
        keteranganPanjang: item.keteranganSingkat,
        budgetMin: item.budgetMin,
        budgetMax: item.budgetMax,
        dpPersen: item.dpPersen,
        tags: item.tags,
        fotoBanner: item.fotoUsaha
      })
    })

    if (res.ok) {
      const json = await res.json()
      if (json.data) {
        await syncProjectsWithDB()
        return {
          id: json.data.id,
          judul: json.data.judul,
          keteranganSingkat: json.data.keteranganSingkat,
          namaUsaha: json.data.umkm?.namaUsaha || item.namaUsaha,
          budgetMin: json.data.budgetMin,
          budgetMax: json.data.budgetMax,
          dpPersen: json.data.dpPersen,
          tags: json.data.tags || [],
          createdAt: json.data.createdAt,
          jumlahPelamar: 0,
          fotoUsaha: json.data.umkm?.fotoUsaha || item.fotoUsaha,
          umkmId: json.data.umkmId
        }
      }
    }
  } catch (err) {
    console.error('Failed to post project to DB:', err)
  }

  const fallbackItem: ProyekItem = {
    ...item,
    id: 'proj-' + Date.now(),
    createdAt: new Date().toISOString(),
    jumlahPelamar: 0
  }
  cachedList = [fallbackItem, ...cachedList]
  emitChange()
  return fallbackItem
}

export async function removeProject(proyekId: string) {
  cachedList = cachedList.filter((p) => p.id !== proyekId)
  emitChange()

  try {
    await fetch(`/api/proyek/${proyekId}`, {
      method: 'DELETE'
    })
    await syncProjectsWithDB()
  } catch {
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  syncProjectsWithDB()
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): ProyekItem[] {
  return cachedList
}

const EMPTY_PROJECTS: ProyekItem[] = []

function getServerSnapshot(): ProyekItem[] {
  return EMPTY_PROJECTS
}

export function useProjects(): ProyekItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
