import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Alamat email wajib diisi' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    let userNama = 'Pengguna Mitra Muda'
    let found = false

    const pelajar = await prisma.pelajar.findUnique({ where: { email: trimmedEmail } })
    if (pelajar) {
      userNama = pelajar.namaLengkap
      found = true
    } else {
      const umkm = await prisma.uMKM.findUnique({ where: { email: trimmedEmail } })
      if (umkm) {
        userNama = umkm.namaPemilik
        found = true
      } else {
        const sekolah = await prisma.sekolah.findUnique({ where: { emailResmi: trimmedEmail } })
        if (sekolah) {
          userNama = sekolah.namaPenanggungJawab
          found = true
        }
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Email ini tidak terdaftar di sistem Mitra Muda.' },
        { status: 404 }
      )
    }

    const resetToken = 'rst-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)

    const result = await sendResetPasswordEmail({
      to: trimmedEmail,
      userNama,
      resetToken
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Gagal mengirim email pemulihan. Pastikan RESEND_API_KEY terpasang dengan benar.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Instruksi pemulihan password berhasil dikirim ke ' + trimmedEmail,
      simulated: result.simulated ?? false
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses pemulihan password' },
      { status: 500 }
    )
  }
}
