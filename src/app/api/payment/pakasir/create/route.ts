import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNoResi, calculatePakasirFee, SUPPORTED_BANKS, generateVirtualAccountNumber } from '@/lib/utils'

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

    const requestedMethod = (body.paymentMethod || body.method || 'qris').toLowerCase()
    const requestedBank = (body.bank || (requestedMethod !== 'qris' ? requestedMethod : 'bca')).toLowerCase()
    const isBank = requestedMethod !== 'qris'

    const matchedBank = SUPPORTED_BANKS.find(
      (b) => b.id.toLowerCase() === requestedBank || b.code.toLowerCase() === requestedBank
    ) || SUPPORTED_BANKS[0]

    const paymentMethod = isBank ? matchedBank.id : 'qris'
    const bankTujuan = isBank ? matchedBank.name : 'QRIS Pakasir'

    let qrisString = ''
    let qrisUrl = ''
    let vaNumber = ''
    let fee = 0
    const pakasirPaymentUrl = `https://app.pakasir.com/pay/${slug}/${calculatedNominal}?order_id=${orderId}`

    if (apiKey && slug) {
      const endpointMethod = isBank ? matchedBank.pakasirMethod : 'qris'
      try {
        const pakasirRes = await fetch(`https://app.pakasir.com/api/transactioncreate/${endpointMethod}`, {
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
          if (paymentData?.payment_number) {
            if (isBank) {
              vaNumber = paymentData.payment_number
            } else {
              qrisString = paymentData.payment_number
            }
          }
          if (paymentData?.qr_string) {
            qrisString = paymentData.qr_string
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

    if (!vaNumber) {
      vaNumber = generateVirtualAccountNumber(matchedBank.id, orderId)
    }

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
        paymentMethod,
        status: 'PENDING',
        qrisUrl,
        qrisString,
        pakasirPaymentUrl,
        bankTujuan,
        nomorPengirim: isBank ? vaNumber : orderId,
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
        paymentMethod,
        bankTujuan,
        vaNumber,
        accountName: 'MITRA MUDA ESCROW (PAKASIR)',
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

