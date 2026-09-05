import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, order_id, project, status, payment_method, completed_at } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id wajib disertakan' }, { status: 400 })
    }

    const isCompleted = status === 'completed' || status === 'COMPLETED' || status === 'success' || status === 'PAID'

    if (!isCompleted) {
      return NextResponse.json({ message: 'Status belum completed, diabaikan' })
    }

    const existingDeposit = await prisma.depositTransaction.findUnique({
      where: { orderId: order_id }
    })

    if (!existingDeposit) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    if (existingDeposit.status === 'APPROVED') {
      return NextResponse.json({ success: true, message: 'Transaksi telah diselesaikan sebelumnya' })
    }

    const approvedAt = completed_at ? new Date(completed_at) : new Date()

    await prisma.depositTransaction.update({
      where: { orderId: order_id },
      data: {
        status: 'APPROVED',
        paymentMethod: payment_method || 'qris',
        approvedAt
      }
    })

    if (global.__global_mitra_muda_escrow__) {
      const idx = global.__global_mitra_muda_escrow__.deposits.findIndex(
        (d) => d.nomorPengirim === order_id || d.id === existingDeposit.id
      )
      if (idx >= 0) {
        global.__global_mitra_muda_escrow__.deposits[idx].status = 'APPROVED'
        global.__global_mitra_muda_escrow__.deposits[idx].approvedAt = approvedAt.toISOString()
      }

      const currentBalance = global.__global_mitra_muda_escrow__.umkmBalances[existingDeposit.umkmId] || 0
      global.__global_mitra_muda_escrow__.umkmBalances[existingDeposit.umkmId] = currentBalance + existingDeposit.nominal
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit berhasil diverifikasi dan saldo UMKM telah ditambahkan',
      orderId: order_id,
      nominal: existingDeposit.nominal
    })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses webhook Pakasir' }, { status: 500 })
  }
}
