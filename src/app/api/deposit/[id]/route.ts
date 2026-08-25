import { NextRequest, NextResponse } from 'next/server'
import { ApiEscrowState } from '../route'

declare global {
  var __global_mitra_muda_escrow__: ApiEscrowState | undefined
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, status, catatanAdmin } = body

    if (!global.__global_mitra_muda_escrow__) {
      global.__global_mitra_muda_escrow__ = {
        deposits: [],
        withdrawals: [],
        umkmBalances: {},
        pelajarBalances: {}
      }
    }

    const depositIndex = global.__global_mitra_muda_escrow__.deposits.findIndex((d) => d.id === id)
    if (depositIndex >= 0) {
      const deposit = global.__global_mitra_muda_escrow__.deposits[depositIndex]
      const newStatus = status || (action === 'APPROVE' ? 'APPROVED' : 'REJECTED')
      
      global.__global_mitra_muda_escrow__.deposits[depositIndex] = {
        ...deposit,
        status: newStatus,
        catatanAdmin: catatanAdmin || (newStatus === 'APPROVED' ? 'Disetujui oleh Master Admin Escrow' : 'Ditolak oleh Admin'),
        approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : undefined
      }

      if (newStatus === 'APPROVED') {
        const curBal = global.__global_mitra_muda_escrow__.umkmBalances[deposit.umkmId] || 0
        global.__global_mitra_muda_escrow__.umkmBalances[deposit.umkmId] = curBal + deposit.nominal
      }

      return NextResponse.json({ success: true, data: global.__global_mitra_muda_escrow__.deposits[depositIndex] })
    }

    const withdrawalIndex = global.__global_mitra_muda_escrow__.withdrawals.findIndex((w) => w.id === id)
    if (withdrawalIndex >= 0) {
      const withdrawal = global.__global_mitra_muda_escrow__.withdrawals[withdrawalIndex]
      const newStatus = status || (action === 'APPROVE' ? 'APPROVED' : 'REJECTED')

      global.__global_mitra_muda_escrow__.withdrawals[withdrawalIndex] = {
        ...withdrawal,
        status: newStatus,
        catatanAdmin: catatanAdmin || (newStatus === 'APPROVED' ? 'Pencairan diproses ke e-wallet' : 'Pencairan ditolak'),
        approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : undefined
      }

      return NextResponse.json({ success: true, data: global.__global_mitra_muda_escrow__.withdrawals[withdrawalIndex] })
    }

    return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 })
  }
}
