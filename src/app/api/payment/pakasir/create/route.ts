import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNoResi, calculatePakasirFee } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { umkmId, namaUsaha, namaPemilik, nominal } = body

    if (!umkmId || !nominal || Number(nominal) <= 0) {
      return NextResponse.json({ error: 'Data deposit tidak valid' }, { status: 400 })
    }

    const calculatedNominal = Math.round(Number(nominal))
    const orderId = generateNoResi('MTU')
    const slug = process.env.PAKASIR_PROJECT_SLUG || 'mitra-muda'
    const apiKey = process.env.PAKASIR_API_KEY || ''

    let qrisString = ''
    let qrisUrl = ''
    let fee = 0
    const pakasirPaymentUrl = `https://app.pakasir.com/pay/${slug}/${calculatedNominal}?order_id=${orderId}`

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
          const paymentData = pakasirJson?.payment || pakasirJson?.data || pakasirJson
          if (paymentData?.payment_number || paymentData?.qr_string) {
            qrisString = paymentData.payment_number || paymentData.qr_string
          }
          if (paymentData?.qr_image || paymentData?.payment_url) {
            qrisUrl = paymentData.qr_image || paymentData.payment_url
          }
          if (paymentData?.fee !== undefined && !isNaN(Number(paymentData.fee))) {
            fee = Math.round(Number(paymentData.fee))
          } else if (paymentData?.total_payment && Number(paymentData.total_payment) > calculatedNominal) {
            fee = Math.round(Number(paymentData.total_payment) - calculatedNominal)
          } else if (paymentData?.total_amount && Number(paymentData.total_amount) > calculatedNominal) {
            fee = Math.round(Number(paymentData.total_amount) - calculatedNominal)
          }
        }
      } catch {
      }
    }

    if (!fee) {
      fee = calculatePakasirFee(calculatedNominal)
    }

    const totalPayment = calculatedNominal + fee

    if (!qrisString) {
      qrisString = `00020101021226680016ID.CO.PAKASIR.WWW011893600918${orderId}02150000000000000010303UMI51440014ID.LINKAJA.WWW02150000000000000010303UMI52045812530336054${totalPayment.toString().length < 10 ? '0' + totalPayment.toString().length : totalPayment.toString().length}${totalPayment}5802ID5918MITRA MUDA ESCROW6007JAKARTA61051234062330118${orderId}0703A016304`
    }

    if (!qrisUrl) {
      qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrisString)}`
    }

    const newDeposit = await prisma.depositTransaction.create({
      data: {
        id: orderId,
        orderId,
        umkmId,
        namaUsaha: namaUsaha || 'UMKM Mitra Muda',
        namaPemilik: namaPemilik || 'Pemilik Usaha',
        nominal: calculatedNominal,
        paymentMethod: 'qris',
        status: 'PENDING',
        qrisUrl,
        qrisString,
        pakasirPaymentUrl,
        catatanAdmin: `Biaya Layanan Pakasir: Rp ${fee.toLocaleString('id-ID')} | Total: Rp ${totalPayment.toLocaleString('id-ID')}`
      }
    })

    const expiredAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      data: {
        id: newDeposit.id,
        orderId,
        nominal: calculatedNominal,
        fee,
        totalPayment,
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
