import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSupabaseAuthUser } from '@/lib/sync-supabase-auth'
import { signJwt } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')
    const kategori = request.nextUrl.searchParams.get('kategori')
    const verifiedOnly = request.nextUrl.searchParams.get('verifiedOnly')

    const where: Record<string, unknown> = {}
    if (verifiedOnly === 'true') {
      where.isVerified = true
    }
    if (search) {
      where.OR = [
        { namaUsaha: { contains: search, mode: 'insensitive' } },
        { namaPemilik: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (kategori) where.kategori = kategori

    const data = await prisma.uMKM.findMany({
      where,
      select: {
        id: true,
        namaUsaha: true,
        namaPemilik: true,
        email: true,
        nomorWa: true,
        fotoUsaha: true,
        kategori: true,
        ukuranBisnis: true,
        alamat: true,
        isVerified: true,
        verifikasiType: true,
        buktiLegalitas: true,
        createdAt: true,
        _count: { select: { proyek: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data UMKM' }, { status: 500 })
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['namaPemilik', 'namaUsaha', 'email', 'password', 'nomorWa']
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

    const existingEmail = await prisma.uMKM.findUnique({ where: { email: body.email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email ini sudah terdaftar sebagai akun UMKM. Silakan masuk.' }, { status: 409 })
    }

    const existingWa = await prisma.uMKM.findFirst({ where: { nomorWa: body.nomorWa } })
    if (existingWa) {
      return NextResponse.json({ error: 'Nomor WhatsApp ini sudah terdaftar pada akun UMKM lain.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const umkm = await prisma.uMKM.create({
      data: {
        namaPemilik: body.namaPemilik,
        namaUsaha: body.namaUsaha,
        email: body.email,
        password: hashedPassword,
        nomorWa: body.nomorWa,
        ukuranBisnis: body.ukuranBisnis || 'KECIL',
        kategori: body.kategori || 'Kuliner & F&B',
        alamat: body.alamat || null,
        buktiLegalitas: body.buktiLegalitas || null,
        verifikasiType: body.buktiLegalitas ? 'Dokumen Legalitas / NIB' : 'Verifikasi Manual Admin',
        isVerified: false,
      },
      select: {
        id: true,
        namaUsaha: true,
        namaPemilik: true,
        email: true,
        nomorWa: true,
        isVerified: true,
        createdAt: true,
      },
    })

    
    createSupabaseAuthUser({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      nama: body.namaPemilik || body.namaUsaha,
      role: 'umkm'
    }).catch(() => {})

    
    const { sendConfirmationEmail } = await import('@/lib/mail')
    sendConfirmationEmail({
      to: body.email.trim().toLowerCase(),
      userNama: body.namaPemilik || body.namaUsaha,
      role: 'UMKM'
    }).catch((e) => console.error('Gagal kirim email konfirmasi UMKM:', e))

    const token = signJwt({
      id: umkm.id,
      email: umkm.email,
      role: 'umkm',
      nama: umkm.namaUsaha
    })

    const response = NextResponse.json({ data: umkm, token }, { status: 201 })
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
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email atau nomor WhatsApp sudah terdaftar di sistem' }, { status: 409 })
    }
    const msg = error?.message || String(error)
    return NextResponse.json({ error: 'Gagal mendaftarkan akun UMKM', details: msg }, { status: 500 })
  }
}
