import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { RateLimiter } from '@/lib/rate-limiter'

const loginRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 10 })

import { signJwt } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-server'

function createAuthResponse(user: any, status: number = 200) {
  const token = signJwt({
    id: user.id,
    email: user.email,
    role: user.role,
    nama: user.nama
  })

  const response = NextResponse.json({ user, token }, { status })

  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })

  return response
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    if (!loginRateLimiter.isAllowed(ip)) {
      const retryAfter = Math.ceil(loginRateLimiter.getRetryAfterMs(ip) / 1000)
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfter} detik.` },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) }
        }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const rawInput = email.trim()
    const trimmedEmail = rawInput.toLowerCase()

    const pelajar = await prisma.pelajar.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { nis: rawInput }
        ]
      },
      include: {
        profil: true,
        sekolah: { select: { namaSekolah: true } }
      }
    })

    if (pelajar) {
      const isMatch = await bcrypt.compare(password, pelajar.password)
      if (!isMatch) {
        return NextResponse.json({ error: 'Password salah. Periksa kembali password Anda.' }, { status: 401 })
      }

      return createAuthResponse({
        id: pelajar.id,
        email: pelajar.email,
        nama: pelajar.namaLengkap,
        role: 'pelajar',
        sekolah: pelajar.sekolah?.namaSekolah || pelajar.kelas || 'SMK Terdaftar',
        nisn: pelajar.nis,
        skills: pelajar.profil?.skills?.length ? pelajar.profil.skills : pelajar.profil?.bidangKeahlian || ['Web Dev', 'UI/UX'],
        proyekSelesai: pelajar.profil?.jumlahProyekSelesai || 0,
        totalPendapatan: pelajar.profil?.totalPendapatan || 0,
        onTimeRate: 100,
        verificationStatus: pelajar.verificationStatus,
        isVerified: pelajar.verificationStatus === 'VERIFIED'
      })
    }

    const umkm = await prisma.uMKM.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { nomorWa: rawInput }
        ]
      }
    })

    if (umkm) {
      const isMatch = await bcrypt.compare(password, umkm.password)
      if (!isMatch) {
        return NextResponse.json({ error: 'Password salah. Periksa kembali password Anda.' }, { status: 401 })
      }

      return createAuthResponse({
        id: umkm.id,
        email: umkm.email,
        nama: umkm.namaPemilik,
        namaUsaha: umkm.namaUsaha,
        nomorWa: umkm.nomorWa,
        role: 'umkm'
      })
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        OR: [
          { emailResmi: trimmedEmail },
          { npsn: rawInput }
        ]
      }
    })

    if (sekolah) {
      const isMatch = await bcrypt.compare(password, sekolah.password)
      if (!isMatch) {
        return NextResponse.json({ error: 'Password salah. Periksa kembali password Anda.' }, { status: 401 })
      }

      return createAuthResponse({
        id: sekolah.id,
        email: sekolah.emailResmi,
        nama: sekolah.namaPenanggungJawab,
        namaSekolah: sekolah.namaSekolah,
        npsn: sekolah.npsn,
        role: 'sekolah'
      })
    }

    return NextResponse.json(
      { error: 'Akun dengan email/identitas ini tidak ditemukan. Silakan registrasi terlebih dahulu.' },
      { status: 404 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses login' },
      { status: 500 }
    )
  }
}
