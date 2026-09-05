import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { umkmId, namaUsaha, namaPemilik, nominal } = body

    if (!umkmId || !nominal || Number(nominal) <= 0) {
      return NextResponse.json({ error: 'Data deposit tidak valid' }, { status: 400 })
    }

    const calculatedNominal = Math.round(Number(nominal))
    const orderId = `MM-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const slug = process.env.PAKASIR_PROJECT_SLUG || 'mitra-muda'
    const apiKey = process.env.PAKASIR_API_KEY || ''

    let qrisString = ''
    let qrisUrl = ''
    const pakasirPaymentUrl = `https://app.pakasir.com/pay/${slug}/${calculatedNominal}?order_id=${orderId}&qris_only=1`

    if (apiKey && slug) {
      try {
        const pakasirRes = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: slug,
            order_id: orderId,
            amount: calculatedNominal,
            api_key: apiKey
          })
        })

        if (pakasirRes.ok) {
          const pakasirJson = await pakasirRes.json()
          if (pakasirJson?.data?.qr_string) {
            qrisString = pakasirJson.data.qr_string
          }
          if (pakasirJson?.data?.qr_image || pakasirJson?.data?.payment_url) {
            qrisUrl = pakasirJson.data.qr_image || pakasirJson.data.payment_url
          }
        }
      } catch {
      }
    }

    if (!qrisString) {
      qrisString = `00020101021226680016ID.CO.PAKASIR.WWW011893600918${orderId}02150000000000000010303UMI51440014ID.LINKAJA.WWW02150000000000000010303UMI52045812530336054${calculatedNominal.toString().length < 10 ? '0' + calculatedNominal.toString().length : calculatedNominal.toString().length}${calculatedNominal}5802ID5918MITRA MUDA ESCROW6007JAKARTA61051234062330118${orderId}0703A016304`
    }

    if (!qrisUrl) {
      qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrisString)}`
    }

    const newDeposit = await prisma.depositTransaction.create({
      data: {
        orderId,
        umkmId,
        namaUsaha: namaUsaha || 'UMKM Mitra Muda',
        namaPemilik: namaPemilik || 'Pemilik Usaha',
        nominal: calculatedNominal,
        paymentMethod: 'qris',
        status: 'PENDING',
        qrisUrl,
        qrisString,
        pakasirPaymentUrl
      }
    })

    if (global.__global_mitra_muda_escrow__) {
      global.__global_mitra_muda_escrow__.deposits.unshift({
        id: newDeposit.id,
        umkmId,
        namaUsaha: newDeposit.namaUsaha,
        namaPemilik: newDeposit.namaPemilik,
        nominal: calculatedNominal,
        bankTujuan: 'QRIS Pakasir',
        nomorPengirim: orderId,
        buktiTransferUrl: qrisUrl,
        status: 'PENDING',
        createdAt: newDeposit.createdAt.toISOString()
      })
    }

    const expiredAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      data: {
        id: newDeposit.id,
        orderId,
        nominal: calculatedNominal,
        qrisUrl,
        qrisString,
        pakasirPaymentUrl,
        expiredAt,
        status: 'PENDING'
      }
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat transaksi Pakasir' }, { status: 500 })
  }
}
