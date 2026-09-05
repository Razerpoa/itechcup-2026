import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 })
    }

    const existingDeposit = await prisma.depositTransaction.findUnique({
      where: { orderId }
    })

    if (!existingDeposit) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    const slug = process.env.PAKASIR_PROJECT_SLUG || 'mitra-muda'
    const apiKey = process.env.PAKASIR_API_KEY || ''

    if (apiKey && slug) {
      try {
        await fetch('https://app.pakasir.com/api/paymentsimulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: slug,
            order_id: orderId,
            amount: existingDeposit.nominal,
            api_key: apiKey
          })
        })
      } catch {
      }
    }

    const approvedAt = new Date()

    await prisma.depositTransaction.update({
      where: { orderId },
      data: {
        status: 'APPROVED',
        approvedAt
      }
    })

    if (global.__global_mitra_muda_escrow__) {
      const idx = global.__global_mitra_muda_escrow__.deposits.findIndex(
        (d) => d.nomorPengirim === orderId || d.id === existingDeposit.id
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
      message: 'Simulasi pembayaran berhasil! Saldo deposit telah masuk.',
      orderId,
      nominal: existingDeposit.nominal,
      approvedAt: approvedAt.toISOString()
    })
  } catch {
    return NextResponse.json({ error: 'Gagal menjalankan simulasi pembayaran' }, { status: 500 })
  }
}
