import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface ApiDepositItem {
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

export interface ApiWithdrawalItem {
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

export interface ApiEscrowState {
  deposits: ApiDepositItem[]
  withdrawals: ApiWithdrawalItem[]
  umkmBalances: Record<string, number>
  pelajarBalances: Record<string, number>
}

declare global {
  var __global_mitra_muda_escrow__: ApiEscrowState | undefined
}

if (!global.__global_mitra_muda_escrow__) {
  global.__global_mitra_muda_escrow__ = {
    deposits: [],
    withdrawals: [],
    umkmBalances: {},
    pelajarBalances: {}
  }
}

export async function GET(_request: NextRequest) {
  const state = global.__global_mitra_muda_escrow__ || {
    deposits: [],
    withdrawals: [],
    umkmBalances: {},
    pelajarBalances: {}
  }

  return NextResponse.json({ data: state })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, payload } = body

    if (!global.__global_mitra_muda_escrow__) {
      global.__global_mitra_muda_escrow__ = {
        deposits: [],
        withdrawals: [],
        umkmBalances: {},
        pelajarBalances: {}
      }
    }

    if (type === 'SYNC') {
      const clientDeposits: ApiDepositItem[] = body.deposits || []
      const clientWithdrawals: ApiWithdrawalItem[] = body.withdrawals || []

      for (const cd of clientDeposits) {
        const existingIdx = global.__global_mitra_muda_escrow__.deposits.findIndex((d) => d.id === cd.id)
        if (existingIdx >= 0) {
          const s = global.__global_mitra_muda_escrow__.deposits[existingIdx]
          if (s.status === 'PENDING' && cd.status !== 'PENDING') {
            global.__global_mitra_muda_escrow__.deposits[existingIdx] = cd
          }
        } else {
          global.__global_mitra_muda_escrow__.deposits.unshift(cd)
        }
      }

      for (const cw of clientWithdrawals) {
        const existingIdx = global.__global_mitra_muda_escrow__.withdrawals.findIndex((w) => w.id === cw.id)
        if (existingIdx >= 0) {
          const s = global.__global_mitra_muda_escrow__.withdrawals[existingIdx]
          if (s.status === 'PENDING' && cw.status !== 'PENDING') {
            global.__global_mitra_muda_escrow__.withdrawals[existingIdx] = cw
          }
        } else {
          global.__global_mitra_muda_escrow__.withdrawals.unshift(cw)
        }
      }

      try {
        const dbDeposits = await prisma.depositTransaction.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50
        })
        for (const dbDep of dbDeposits) {
          const existing = global.__global_mitra_muda_escrow__.deposits.find(
            (d) => d.id === dbDep.id || d.nomorPengirim === dbDep.orderId
          )
          if (!existing) {
            global.__global_mitra_muda_escrow__.deposits.unshift({
              id: dbDep.id,
              umkmId: dbDep.umkmId,
              namaUsaha: dbDep.namaUsaha,
              namaPemilik: dbDep.namaPemilik,
              nominal: dbDep.nominal,
              bankTujuan: 'QRIS Pakasir',
              nomorPengirim: dbDep.orderId,
              buktiTransferUrl: dbDep.qrisUrl || undefined,
              status: dbDep.status as 'PENDING' | 'APPROVED' | 'REJECTED',
              createdAt: dbDep.createdAt.toISOString(),
              approvedAt: dbDep.approvedAt ? dbDep.approvedAt.toISOString() : undefined
            })
          } else {
            existing.status = dbDep.status as 'PENDING' | 'APPROVED' | 'REJECTED'
            if (dbDep.approvedAt) {
              existing.approvedAt = dbDep.approvedAt.toISOString()
            }
          }
          if (dbDep.status === 'APPROVED') {
            const currentBal = global.__global_mitra_muda_escrow__.umkmBalances[dbDep.umkmId] || 0
            if (currentBal === 0) {
              global.__global_mitra_muda_escrow__.umkmBalances[dbDep.umkmId] = dbDep.nominal
            }
          }
        }
      } catch {
      }

      return NextResponse.json({ success: true, data: global.__global_mitra_muda_escrow__ })
    }

    if (type === 'RELEASE_TO_PELAJAR' || action === 'RELEASE_TO_PELAJAR') {
      const targetPelajarId = (payload?.pelajarId || body.pelajarId || 'pelajar-active') as string
      const nominal = Number(payload?.nominalTotal || body.nominalTotal) || 500000

      const currentBal = global.__global_mitra_muda_escrow__.pelajarBalances[targetPelajarId] || 0
      global.__global_mitra_muda_escrow__.pelajarBalances[targetPelajarId] = currentBal + nominal

      if (targetPelajarId !== 'pelajar-active') {
        const actBal = global.__global_mitra_muda_escrow__.pelajarBalances['pelajar-active'] || 0
        global.__global_mitra_muda_escrow__.pelajarBalances['pelajar-active'] = actBal + nominal
      }

      return NextResponse.json({
        success: true,
        pelajarId: targetPelajarId,
        nominal,
        newBalance: global.__global_mitra_muda_escrow__.pelajarBalances[targetPelajarId]
      })
    }

    if (type === 'DEPOSIT') {
      const newDeposit: ApiDepositItem = {
        id: payload.id || 'dep-' + Date.now(),
        umkmId: payload.umkmId || 'umkm-default',
        namaUsaha: payload.namaUsaha || 'UMKM Mitra Muda',
        namaPemilik: payload.namaPemilik || 'Pemilik Usaha',
        nominal: Number(payload.nominal) || 500000,
        bankTujuan: payload.bankTujuan || 'BCA',
        nomorPengirim: payload.nomorPengirim,
        buktiTransferUrl: payload.buktiTransferUrl,
        status: payload.status || 'PENDING',
        createdAt: payload.createdAt || new Date().toISOString()
      }

      const existingIndex = global.__global_mitra_muda_escrow__.deposits.findIndex(
        (d) => d.id === newDeposit.id
      )

      if (existingIndex >= 0) {
        global.__global_mitra_muda_escrow__.deposits[existingIndex] = newDeposit
      } else {
        global.__global_mitra_muda_escrow__.deposits.unshift(newDeposit)
      }

      return NextResponse.json({ success: true, data: newDeposit }, { status: 201 })
    }

    if (type === 'WITHDRAWAL') {
      const newWithdrawal: ApiWithdrawalItem = {
        id: payload.id || 'wd-' + Date.now(),
        pelajarId: payload.pelajarId || 'pelajar-1',
        namaPelajar: payload.namaPelajar || 'Pelajar Mitra Muda',
        nominal: Number(payload.nominal) || 100000,
        eWalletType: payload.eWalletType || 'GoPay',
        eWalletNomor: payload.eWalletNomor || '081234567890',
        status: payload.status || 'PENDING',
        createdAt: payload.createdAt || new Date().toISOString()
      }

      const existingIdx = global.__global_mitra_muda_escrow__.withdrawals.findIndex(
        (w) => w.id === newWithdrawal.id
      )
      if (existingIdx >= 0) {
        global.__global_mitra_muda_escrow__.withdrawals[existingIdx] = newWithdrawal
      } else {
        global.__global_mitra_muda_escrow__.withdrawals.unshift(newWithdrawal)
      }

      return NextResponse.json({ success: true, data: newWithdrawal }, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipe transaksi tidak valid' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses deposit' }, { status: 500 })
  }
}
