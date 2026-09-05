import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 })
    }

    const deposit = await prisma.depositTransaction.findUnique({
      where: { orderId }
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    if (deposit.status !== 'APPROVED') {
      const slug = process.env.PAKASIR_PROJECT_SLUG || 'mitra-muda'
      const apiKey = process.env.PAKASIR_API_KEY || ''

      if (apiKey && slug) {
        try {
          const detailRes = await fetch(
            `https://app.pakasir.com/api/transactiondetail?project=${slug}&amount=${deposit.nominal}&order_id=${orderId}&api_key=${apiKey}`,
            { cache: 'no-store' }
          )

          if (detailRes.ok) {
            const detailJson = await detailRes.json()
            const status = detailJson?.data?.status || detailJson?.status
            if (status === 'completed' || status === 'COMPLETED' || status === 'PAID') {
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
                  (d) => d.nomorPengirim === orderId || d.id === deposit.id
                )
                if (idx >= 0) {
                  global.__global_mitra_muda_escrow__.deposits[idx].status = 'APPROVED'
                  global.__global_mitra_muda_escrow__.deposits[idx].approvedAt = approvedAt.toISOString()
                }

                const currentBalance = global.__global_mitra_muda_escrow__.umkmBalances[deposit.umkmId] || 0
                global.__global_mitra_muda_escrow__.umkmBalances[deposit.umkmId] = currentBalance + deposit.nominal
              }

              return NextResponse.json({
                success: true,
                status: 'APPROVED',
                deposit: { ...deposit, status: 'APPROVED', approvedAt }
              })
            }
          }
        } catch {
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: deposit.status,
      deposit
    })
  } catch {
    return NextResponse.json({ error: 'Gagal memeriksa status pembayaran' }, { status: 500 })
  }
}
