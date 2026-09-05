'use client'

import { useSyncExternalStore } from 'react'
import { generateDepositId } from '@/lib/utils'

export interface UMKMDepositItem {
  id: string
  umkmId: string
  namaUsaha: string
  namaPemilik: string
  nominal: number
  bankTujuan: string
  nomorPengirim?: string
  buktiTransferUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  catatanAdmin?: string
  createdAt: string
  approvedAt?: string
}

export interface PelajarWithdrawalItem {
  id: string
  pelajarId: string
  namaPelajar: string
  nominal: number
  eWalletType: 'GoPay' | 'DANA' | 'OVO' | 'ShopeePay'
  eWalletNomor: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  catatanAdmin?: string
  createdAt: string
  approvedAt?: string
}

export interface EscrowHoldingItem {
  id: string
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
  pelajarId: string
  namaPelajar: string
  nominalTotal: number
  nominalDP: number
  dpStatus: 'HELD_IN_ESCROW' | 'RELEASED_TO_PELAJAR' | 'REFUNDED_TO_UMKM'
  pelunasanStatus: 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED_TO_PELAJAR' | 'REFUNDED_TO_UMKM'
  createdAt: string
  updatedAt: string
}

export interface EscrowStoreData {
  deposits: UMKMDepositItem[]
  withdrawals: PelajarWithdrawalItem[]
  escrows: EscrowHoldingItem[]
  umkmBalances: Record<string, number>
  pelajarBalances: Record<string, number>
}

const INITIAL_DATA: EscrowStoreData = {
  deposits: [],
  withdrawals: [],
  escrows: [],
  umkmBalances: {},
  pelajarBalances: {}
}

let cachedData: EscrowStoreData = INITIAL_DATA
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('mitra_muda_escrow_store_v1')
  } catch {
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function getEscrowState(): EscrowStoreData {
  return cachedData
}

function saveEscrowState(data: EscrowStoreData) {
  cachedData = data
  emitChange()
}

export async function syncEscrowWithDB(): Promise<EscrowStoreData> {
  try {
    const res = await fetch('/api/deposit', {
      cache: 'no-store'
    })
    if (res.ok) {
      const json = await res.json()
      if (json.data) {
        const apiDeposits: UMKMDepositItem[] = json.data.deposits || []
        const apiWithdrawals: PelajarWithdrawalItem[] = json.data.withdrawals || []
        const apiUmkmBalances: Record<string, number> = json.data.umkmBalances || {}
        const apiPelajarBalances: Record<string, number> = json.data.pelajarBalances || {}

        cachedData = {
          ...cachedData,
          deposits: apiDeposits,
          withdrawals: apiWithdrawals,
          umkmBalances: apiUmkmBalances,
          pelajarBalances: {
            ...cachedData.pelajarBalances,
            ...apiPelajarBalances
          }
        }
        emitChange()
        return cachedData
      }
    }
  } catch {
  }
  return cachedData
}

export function getUMKMBalance(umkmId: string): number {
  const state = getEscrowState()
  return state.umkmBalances[umkmId] || 0
}

export function getPelajarBalance(pelajarId: string): number {
  const state = getEscrowState()
  const targetKey = pelajarId || 'pelajar-active'
  const releasedForStudent = state.escrows
    .filter(
      (e) =>
        (e.pelajarId === targetKey || targetKey === 'pelajar-active' || e.pelajarId === 'pelajar-active') &&
        e.pelunasanStatus === 'RELEASED_TO_PELAJAR'
    )
    .reduce((sum, e) => sum + (e.nominalTotal || 0), 0)

  const totalWithdrawn = state.withdrawals
    .filter((w) => (w.pelajarId === targetKey || targetKey === 'pelajar-active' || w.pelajarId === 'pelajar-active') && w.status !== 'REJECTED')
    .reduce((sum, w) => sum + (w.nominal || 0), 0)

  if (releasedForStudent > 0) {
    return Math.max(0, releasedForStudent - totalWithdrawn)
  }

  return state.pelajarBalances[targetKey] || 0
}

export function submitUMKMDeposit(payload: {
  id?: string
  umkmId: string
  namaUsaha: string
  namaPemilik: string
  nominal: number
  bankTujuan: string
  nomorPengirim?: string
  buktiTransferUrl?: string
}): UMKMDepositItem {
  const depositId = payload.id || generateDepositId('MTU')
  const newDeposit: UMKMDepositItem = {
    id: depositId,
    umkmId: payload.umkmId,
    namaUsaha: payload.namaUsaha,
    namaPemilik: payload.namaPemilik,
    nominal: payload.nominal,
    bankTujuan: payload.bankTujuan,
    nomorPengirim: payload.nomorPengirim,
    buktiTransferUrl: payload.buktiTransferUrl,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }

  cachedData = {
    ...cachedData,
    deposits: [newDeposit, ...cachedData.deposits.filter((d) => d.id !== depositId)]
  }
  emitChange()

  try {
    fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DEPOSIT', payload: newDeposit })
    })
      .then(() => syncEscrowWithDB())
      .catch(() => {})
  } catch {
  }

  return newDeposit
}

export function adminApproveDeposit(depositId: string, catatanAdmin?: string): boolean {
  const state = getEscrowState()
  const deposit = state.deposits.find((d) => d.id === depositId)
  if (!deposit || deposit.status !== 'PENDING') return false

  const updatedDeposits = state.deposits.map((d) =>
    d.id === depositId
      ? {
          ...d,
          status: 'APPROVED' as const,
          catatanAdmin: catatanAdmin || 'Disetujui oleh Master Admin Escrow',
          approvedAt: new Date().toISOString()
        }
      : d
  )

  const currentBal = state.umkmBalances[deposit.umkmId] || 0
  const updatedBalances = {
    ...state.umkmBalances,
    [deposit.umkmId]: currentBal + deposit.nominal
  }

  cachedData = {
    ...state,
    deposits: updatedDeposits,
    umkmBalances: updatedBalances
  }
  emitChange()

  try {
    fetch(`/api/deposit/${depositId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'APPROVE', catatanAdmin })
    })
      .then(() => syncEscrowWithDB())
      .catch(() => {})
  } catch {
  }

  return true
}

export function adminRejectDeposit(depositId: string, reason?: string): boolean {
  const state = getEscrowState()
  const deposit = state.deposits.find((d) => d.id === depositId)
  if (!deposit || deposit.status !== 'PENDING') return false

  const updatedDeposits = state.deposits.map((d) =>
    d.id === depositId
      ? {
          ...d,
          status: 'REJECTED' as const,
          catatanAdmin: reason || 'Bukti transfer tidak valid atau belum masuk ke rekening admin',
          approvedAt: new Date().toISOString()
        }
      : d
  )

  cachedData = {
    ...state,
    deposits: updatedDeposits
  }
  emitChange()

  try {
    fetch(`/api/deposit/${depositId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REJECT', catatanAdmin: reason })
    })
      .then(() => syncEscrowWithDB())
      .catch(() => {})
  } catch {
  }

  return true
}

export function submitPelajarWithdrawal(payload: {
  id?: string
  pelajarId: string
  namaPelajar: string
  nominal: number
  eWalletType: 'GoPay' | 'DANA' | 'OVO' | 'ShopeePay'
  eWalletNomor: string
}): { success: boolean; error?: string; withdrawal?: PelajarWithdrawalItem } {
  const state = getEscrowState()
  const currentBal = state.pelajarBalances[payload.pelajarId] || 0

  const withdrawalId = payload.id || `WD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const newWithdrawal: PelajarWithdrawalItem = {
    id: withdrawalId,
    pelajarId: payload.pelajarId,
    namaPelajar: payload.namaPelajar,
    nominal: payload.nominal,
    eWalletType: payload.eWalletType,
    eWalletNomor: payload.eWalletNomor,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }

  const updatedWithdrawals = [newWithdrawal, ...state.withdrawals.filter((w) => w.id !== withdrawalId)]
  const updatedBalances = {
    ...state.pelajarBalances,
    [payload.pelajarId]: Math.max(0, currentBal - payload.nominal)
  }

  cachedData = {
    ...state,
    withdrawals: updatedWithdrawals,
    pelajarBalances: updatedBalances
  }
  emitChange()

  try {
    fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'WITHDRAWAL', payload: newWithdrawal })
    })
      .then(() => {
        syncEscrowWithDB()
      })
      .catch(() => {})
  } catch {
  }

  return { success: true, withdrawal: newWithdrawal }
}

export function adminApproveWithdrawal(withdrawalId: string, catatanAdmin?: string): boolean {
  const state = getEscrowState()
  const wd = state.withdrawals.find((w) => w.id === withdrawalId)
  if (!wd || wd.status !== 'PENDING') return false

  const updatedWithdrawals = state.withdrawals.map((w) =>
    w.id === withdrawalId
      ? {
          ...w,
          status: 'APPROVED' as const,
          catatanAdmin: catatanAdmin || `Dana berhasil ditransfer ke e-wallet ${w.eWalletType} (${w.eWalletNomor})`,
          approvedAt: new Date().toISOString()
        }
      : w
  )

  cachedData = {
    ...state,
    withdrawals: updatedWithdrawals
  }
  emitChange()

  try {
    fetch(`/api/deposit/${withdrawalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'APPROVE', catatanAdmin })
    })
      .then(() => syncEscrowWithDB())
      .catch(() => {})
  } catch {
  }

  return true
}

export function adminRejectWithdrawal(withdrawalId: string, reason?: string): boolean {
  const state = getEscrowState()
  const wd = state.withdrawals.find((w) => w.id === withdrawalId)
  if (!wd || wd.status !== 'PENDING') return false

  const updatedWithdrawals = state.withdrawals.map((w) =>
    w.id === withdrawalId
      ? {
          ...w,
          status: 'REJECTED' as const,
          catatanAdmin: reason || 'Nomor e-wallet tidak valid atau tidak terdaftar',
          approvedAt: new Date().toISOString()
        }
      : w
  )

  const currentBal = state.pelajarBalances[wd.pelajarId] || 0
  const updatedBalances = {
    ...state.pelajarBalances,
    [wd.pelajarId]: currentBal + wd.nominal
  }

  cachedData = {
    ...state,
    withdrawals: updatedWithdrawals,
    pelajarBalances: updatedBalances
  }
  emitChange()

  try {
    fetch(`/api/deposit/${withdrawalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REJECT', catatanAdmin: reason })
    })
      .then(() => syncEscrowWithDB())
      .catch(() => {})
  } catch {
  }

  return true
}

export function payProjectDPWithDeposit(payload: {
  umkmId: string
  namaUsaha: string
  proyekId: string
  judulProyek: string
  pelajarId: string
  namaPelajar: string
  nominalTotal: number
  nominalDP: number
}): { success: boolean; error?: string } {
  const state = getEscrowState()
  const umkmBal = state.umkmBalances[payload.umkmId] || 0

  const newEscrow: EscrowHoldingItem = {
    id: 'esc-' + Date.now(),
    proyekId: payload.proyekId,
    judulProyek: payload.judulProyek,
    umkmId: payload.umkmId,
    namaUsaha: payload.namaUsaha,
    pelajarId: payload.pelajarId,
    namaPelajar: payload.namaPelajar,
    nominalTotal: payload.nominalTotal,
    nominalDP: payload.nominalDP,
    dpStatus: 'HELD_IN_ESCROW',
    pelunasanStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const existingIndex = state.escrows.findIndex((e) => e.proyekId === payload.proyekId)
  const updatedEscrows =
    existingIndex >= 0
      ? state.escrows.map((e, idx) => (idx === existingIndex ? newEscrow : e))
      : [newEscrow, ...state.escrows]

  const updatedUmkmBalances = {
    ...state.umkmBalances,
    [payload.umkmId]: Math.max(0, umkmBal - payload.nominalDP)
  }

  cachedData = {
    ...state,
    escrows: updatedEscrows,
    umkmBalances: updatedUmkmBalances
  }
  emitChange()

  return { success: true }
}

export function releaseProjectCompletionToPelajar(
  payloadOrId: string | {
    proyekId: string
    pelajarId: string
    namaPelajar?: string
    nominalTotal: number
    nominalDP?: number
    umkmId?: string
    namaUsaha?: string
    judulProyek?: string
  }
): { success: boolean; error?: string } {
  const state = getEscrowState()

  const isObj = typeof payloadOrId === 'object' && payloadOrId !== null
  const proyekId = isObj ? payloadOrId.proyekId : payloadOrId
  const pelajarId = isObj ? payloadOrId.pelajarId : ''
  const namaPelajar = isObj ? payloadOrId.namaPelajar || 'Pelajar Mitra Muda' : 'Pelajar Mitra Muda'
  const nominalTotal = isObj ? payloadOrId.nominalTotal || 500000 : 500000
  const nominalDP = isObj ? payloadOrId.nominalDP || Math.round(nominalTotal * 0.3) : Math.round(nominalTotal * 0.3)
  const umkmId = isObj ? payloadOrId.umkmId || 'umkm-default' : 'umkm-default'
  const namaUsaha = isObj ? payloadOrId.namaUsaha || 'UMKM Mitra Muda' : 'UMKM Mitra Muda'
  const judulProyek = isObj ? payloadOrId.judulProyek || 'Proyek Mitra Muda' : 'Proyek Mitra Muda'

  const existingIndex = state.escrows.findIndex(
    (e) => e.id === proyekId || e.proyekId === proyekId || ('esc-' + e.proyekId) === proyekId
  )

  let effectivePelajarId = pelajarId
  let effectiveNominal = nominalTotal

  let updatedEscrows = [...state.escrows]
  if (existingIndex >= 0) {
    const existing = state.escrows[existingIndex]
    if (existing.pelunasanStatus === 'RELEASED_TO_PELAJAR' && existing.dpStatus === 'RELEASED_TO_PELAJAR') {
      return { success: true }
    }
    effectivePelajarId = existing.pelajarId || pelajarId
    effectiveNominal = existing.nominalTotal || nominalTotal
    updatedEscrows[existingIndex] = {
      ...existing,
      dpStatus: 'RELEASED_TO_PELAJAR',
      pelunasanStatus: 'RELEASED_TO_PELAJAR',
      updatedAt: new Date().toISOString()
    }
  } else {
    const newReleasedEscrow: EscrowHoldingItem = {
      id: 'esc-' + Date.now(),
      proyekId: proyekId,
      judulProyek: judulProyek,
      umkmId: umkmId,
      namaUsaha: namaUsaha,
      pelajarId: effectivePelajarId || 'pelajar-active',
      namaPelajar: namaPelajar,
      nominalTotal: effectiveNominal,
      nominalDP: nominalDP,
      dpStatus: 'RELEASED_TO_PELAJAR',
      pelunasanStatus: 'RELEASED_TO_PELAJAR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    updatedEscrows = [newReleasedEscrow, ...updatedEscrows]
  }

  const targetKey = effectivePelajarId || 'pelajar-active'
  const totalEarnedForStudent = updatedEscrows
    .filter((e) => (e.pelajarId === targetKey || targetKey === 'pelajar-active' || e.pelajarId === 'pelajar-active') && e.pelunasanStatus === 'RELEASED_TO_PELAJAR')
    .reduce((sum, e) => sum + (e.nominalTotal || 0), 0)

  const totalWithdrawnForStudent = state.withdrawals
    .filter((w) => (w.pelajarId === targetKey || targetKey === 'pelajar-active' || w.pelajarId === 'pelajar-active') && w.status !== 'REJECTED')
    .reduce((sum, w) => sum + (w.nominal || 0), 0)

  const accurateBalance = Math.max(0, totalEarnedForStudent - totalWithdrawnForStudent)

  const updatedPelajarBalances: Record<string, number> = {
    ...state.pelajarBalances,
    [targetKey]: accurateBalance,
    'pelajar-active': accurateBalance
  }

  cachedData = {
    ...state,
    escrows: updatedEscrows,
    pelajarBalances: updatedPelajarBalances
  }
  emitChange()

  try {
    fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RELEASE_TO_PELAJAR',
        proyekId,
        pelajarId: targetKey,
        nominalTotal: effectiveNominal
      })
    }).catch(() => {})
  } catch {
  }

  return { success: true }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function useEscrowStore(): EscrowStoreData {
  return useSyncExternalStore(subscribe, getEscrowState, () => INITIAL_DATA)
}
