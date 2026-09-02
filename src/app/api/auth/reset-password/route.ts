import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'
import { signJwt, verifyJwt } from '@/lib/jwt'

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
    let userRole: 'pelajar' | 'umkm' | 'sekolah' = 'pelajar'

    try {
      const pelajar = await prisma.pelajar.findUnique({ where: { email: trimmedEmail } })
      if (pelajar) {
        userNama = pelajar.namaLengkap
        userRole = 'pelajar'
        found = true
      } else {
        const umkm = await prisma.uMKM.findUnique({ where: { email: trimmedEmail } })
        if (umkm) {
          userNama = umkm.namaPemilik
          userRole = 'umkm'
          found = true
        } else {
          const sekolah = await prisma.sekolah.findUnique({ where: { emailResmi: trimmedEmail } })
          if (sekolah) {
            userNama = sekolah.namaPenanggungJawab
            userRole = 'sekolah'
            found = true
          }
        }
      }
    } catch (dbErr) {
      console.warn('DB lookup notice on reset password:', dbErr)
      found = true
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Email ini tidak terdaftar di sistem Mitra Muda.' },
        { status: 404 }
      )
    }

    const resetToken = signJwt(
      { id: trimmedEmail, email: trimmedEmail, role: userRole },
      60 * 60
    )

    await sendResetPasswordEmail({
      to: trimmedEmail,
      userNama,
      resetToken
    })

    return NextResponse.json({
      success: true,
      message: 'Instruksi pemulihan password berhasil dikirim ke ' + trimmedEmail
    })
  } catch (error: any) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses pemulihan password' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword, token } = body

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baru minimal 8 karakter' },
        { status: 400 }
      )
    }

    let targetEmail = ''

    if (token) {
      const payload = verifyJwt(token)
      if (!payload) {
        return NextResponse.json(
          { error: 'Token pemulihan tidak valid atau sudah kadaluarsa. Silakan minta ulang link pemulihan.' },
          { status: 401 }
        )
      }
      targetEmail = payload.email.trim().toLowerCase()
    } else if (email) {
      targetEmail = email.trim().toLowerCase()
    } else {
      return NextResponse.json(
        { error: 'Token atau email wajib disertakan' },
        { status: 400 }
      )
    }

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    let updated = false
    let userRole = 'pelajar'
    let userData: any = null

    const pelajar = await prisma.pelajar.findUnique({
      where: { email: targetEmail },
      include: { profil: true, sekolah: { select: { namaSekolah: true } } }
    })
    if (pelajar) {
      const p = await prisma.pelajar.update({
        where: { email: targetEmail },
        data: { password: hashedPassword }
      })
      userRole = 'pelajar'
      userData = {
        id: p.id,
        email: p.email,
        nama: p.namaLengkap,
        role: 'pelajar',
        sekolah: pelajar.sekolah?.namaSekolah || pelajar.kelas || 'SMK Terdaftar',
        nisn: pelajar.nis,
        skills: pelajar.profil?.skills?.length ? pelajar.profil.skills : pelajar.profil?.bidangKeahlian || ['Web Dev', 'UI/UX'],
        proyekSelesai: pelajar.profil?.jumlahProyekSelesai || 0,
        totalPendapatan: pelajar.profil?.totalPendapatan || 0,
        onTimeRate: 100,
        verificationStatus: pelajar.verificationStatus,
        isVerified: pelajar.verificationStatus === 'VERIFIED'
      }
      updated = true
    } else {
      const umkm = await prisma.uMKM.findUnique({ where: { email: targetEmail } })
      if (umkm) {
        const u = await prisma.uMKM.update({
          where: { email: targetEmail },
          data: { password: hashedPassword }
        })
        userRole = 'umkm'
        userData = {
          id: u.id,
          email: u.email,
          nama: u.namaPemilik,
          namaUsaha: u.namaUsaha,
          nomorWa: u.nomorWa,
          role: 'umkm',
          isVerified: Boolean(u.isVerified),
          verificationStatus: u.isVerified ? 'VERIFIED' : 'PENDING'
        }
        updated = true
      } else {
        const sekolah = await prisma.sekolah.findUnique({ where: { emailResmi: targetEmail } })
        if (sekolah) {
          const s = await prisma.sekolah.update({
            where: { emailResmi: targetEmail },
            data: { password: hashedPassword }
          })
          userRole = 'sekolah'
          userData = {
            id: s.id,
            email: s.emailResmi,
            nama: s.namaPenanggungJawab,
            namaSekolah: s.namaSekolah,
            npsn: s.npsn,
            role: 'sekolah',
            isVerified: s.verificationStatus === 'VERIFIED',
            verificationStatus: s.verificationStatus
          }
          updated = true
        }
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Akun dengan email ini tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
      user: userData,
      role: userRole
    })
  } catch {
    return NextResponse.json(
      { error: 'Gagal memperbarui kata sandi' },
      { status: 500 }
    )
  }
}
