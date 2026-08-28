import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSupabaseAuthUser } from '@/lib/sync-supabase-auth'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')

    const where = search
      ? {
          OR: [
            { namaLengkap: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const data = await prisma.pelajar.findMany({
      where,
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        nis: true,
        kelas: true,
        verificationStatus: true,
        catatanPenolakan: true,
        fotoKartuPelajar: true,
        sekolahId: true,
        sekolah: { select: { namaSekolah: true } },
        profil: { select: { displayName: true, fotoProfil: true, kontakWa: true, ratingRata: true, jumlahProyekSelesai: true } },
        createdAt: true,
      },
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data pelajar' }, { status: 500 })
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

import { signJwt } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['namaLengkap', 'email', 'password']
    const missing = required.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json({ error: `Field wajib tidak ada: ${missing.join(', ')}` }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    if (typeof body.password !== 'string' || body.password.length < 8) {
      return NextResponse.json({ error: 'Kata sandi minimal 8 karakter' }, { status: 400 })
    }

    const cleanEmail = body.email.trim().toLowerCase()
    const existing = await prisma.pelajar.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    let matchedSekolahId: string | null = null
    let schoolDisplayName = body.sekolah?.trim() || 'SMK Terdaftar'

    if (body.sekolahId && typeof body.sekolahId === 'string' && body.sekolahId.trim() !== '') {
      const sch = await prisma.sekolah.findUnique({ where: { id: body.sekolahId } })
      if (sch) {
        matchedSekolahId = sch.id
        schoolDisplayName = sch.namaSekolah
      }
    } else if (body.sekolah && typeof body.sekolah === 'string' && body.sekolah.trim() !== '') {
      const sch = await prisma.sekolah.findFirst({
        where: {
          OR: [
            { namaSekolah: { equals: body.sekolah.trim(), mode: 'insensitive' } },
            { namaSekolah: { contains: body.sekolah.trim(), mode: 'insensitive' } }
          ]
        }
      })
      if (sch) {
        matchedSekolahId = sch.id
        schoolDisplayName = sch.namaSekolah
      }
    }

    const randomCode = Math.floor(10000 + Math.random() * 90000).toString()
    const registrationId = `MM-2026-${randomCode}`
    const finalNis = (body.nisn || body.nis || '').toString().trim() || registrationId

    const validGender = body.jenisKelamin === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI_LAKI'

    let parsedDate: Date | undefined = undefined
    if (body.tanggalLahir && typeof body.tanggalLahir === 'string' && body.tanggalLahir.trim() !== '') {
      const t = Date.parse(body.tanggalLahir)
      if (!isNaN(t)) {
        parsedDate = new Date(t)
      }
    }

    const pelajar = await prisma.pelajar.create({
      data: {
        namaLengkap: body.namaLengkap.trim(),
        email: cleanEmail,
        password: hashedPassword,
        jenisKelamin: validGender,
        tempatLahir: body.tempatLahir?.trim() || null,
        tanggalLahir: parsedDate,
        namaIbu: body.namaIbu?.trim() || null,
        nis: finalNis,
        kelas: schoolDisplayName,
        sekolahId: matchedSekolahId,
        verificationStatus: 'PENDING',
        fotoKartuPelajar: body.fotoKartuPelajar || null,
        profil: {
          create: {
            kontakWa: body.nomorWa?.trim() || '',
            bidangKeahlian: body.bidangKeahlian ?? [],
            skills: [],
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        nis: true,
        kelas: true,
        sekolahId: true,
        verificationStatus: true,
        createdAt: true,
        sekolah: { select: { id: true, namaSekolah: true } }
      },
    })

    createSupabaseAuthUser({
      email: cleanEmail,
      password: body.password,
      nama: body.namaLengkap.trim(),
      role: 'pelajar'
    }).catch(() => {})

    const { sendConfirmationEmail } = await import('@/lib/mail')
    sendConfirmationEmail({
      to: cleanEmail,
      userNama: body.namaLengkap.trim(),
      role: 'Pelajar'
    }).catch(() => {})

    const token = signJwt({
      id: pelajar.id,
      email: pelajar.email,
      role: 'pelajar',
      nama: pelajar.namaLengkap
    })

    const userSession = {
      id: pelajar.id,
      nama: pelajar.namaLengkap,
      email: pelajar.email,
      role: 'pelajar',
      sekolah: pelajar.sekolah?.namaSekolah || pelajar.kelas || schoolDisplayName,
      nisn: pelajar.nis,
      registrationId: pelajar.nis || registrationId,
      isVerified: false,
      verificationStatus: 'PENDING'
    }

    const response = NextResponse.json({
      data: userSession,
      token,
      registrationId: pelajar.nis || registrationId
    }, { status: 201 })

    const isProd = process.env.NODE_ENV === 'production'
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error: any) {
    console.error('API Error creating Pelajar:', error)
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email atau NISN sudah terdaftar di sistem' }, { status: 409 })
    }
    const msg = error?.message || String(error)
    return NextResponse.json({ error: 'Gagal mendaftarkan akun pelajar', details: msg }, { status: 500 })
  }
}
