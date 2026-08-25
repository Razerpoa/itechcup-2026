import { NextRequest, NextResponse } from 'next/server'

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
    const { type, payload } = body

    if (!global.__global_mitra_muda_escrow__) {
      global.__global_mitra_muda_escrow__ = {
        deposits: [],
        withdrawals: [],
        umkmBalances: {},
        pelajarBalances: {}
      }
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

      global.__global_mitra_muda_escrow__.withdrawals.unshift(newWithdrawal)
      return NextResponse.json({ success: true, data: newWithdrawal }, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipe transaksi tidak valid' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses deposit' }, { status: 500 })
  }
}
