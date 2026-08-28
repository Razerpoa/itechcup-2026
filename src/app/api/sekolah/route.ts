import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSupabaseAuthUser } from '@/lib/sync-supabase-auth'
import { normalizeSchoolName } from '@/lib/normalize-school-name'
import { compareSchoolNames } from '@/lib/compare-school-names'
import { validateNpsn } from '@/lib/validate-npsn'
import { lookupSchool } from '@/lib/kemendikdasmen'
import { ipRateLimiter, npsnRateLimiter } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    const email = request.nextUrl.searchParams.get('email')
    const search = request.nextUrl.searchParams.get('search')

    if (id) {
      const sekolah = await prisma.sekolah.findUnique({
        where: { id },
        select: {
          id: true,
          namaSekolah: true,
          npsn: true,
          emailResmi: true,
          namaPenanggungJawab: true,
          alamatLengkap: true,
          kontakSekolah: true,
          verificationStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { daftarSiswa: true } },
        },
      })
      return NextResponse.json({ data: sekolah ? [sekolah] : [] })
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase()
      const sekolah = await prisma.sekolah.findFirst({
        where: { emailResmi: cleanEmail },
        select: {
          id: true,
          namaSekolah: true,
          npsn: true,
          emailResmi: true,
          namaPenanggungJawab: true,
          alamatLengkap: true,
          kontakSekolah: true,
          verificationStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { daftarSiswa: true } },
        },
      })
      return NextResponse.json({ data: sekolah ? [sekolah] : [] })
    }

    const where = search
      ? {
          OR: [
            { namaSekolah: { contains: search, mode: 'insensitive' as const } },
            { npsn: { contains: search, mode: 'insensitive' as const } },
            { emailResmi: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const data = await prisma.sekolah.findMany({
      where,
      select: {
        id: true,
        namaSekolah: true,
        npsn: true,
        emailResmi: true,
        namaPenanggungJawab: true,
        alamatLengkap: true,
        kontakSekolah: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { daftarSiswa: true } },
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data sekolah' }, { status: 500 })
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['namaSekolah', 'npsn', 'emailResmi', 'password', 'namaPenanggungJawab', 'alamatLengkap', 'kontakSekolah']
    const missing = required.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json({ error: `Field wajib tidak ada: ${missing.join(', ')}` }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(body.emailResmi)) {
      return NextResponse.json({ error: 'Format email tidak valid', errorCode: 'ERR_INVALID_EMAIL' }, { status: 400 })
    }

    const npsnResult = validateNpsn(body.npsn)
    if (!npsnResult.valid) {
      return NextResponse.json({ error: npsnResult.error, errorCode: npsnResult.errorCode }, { status: 400 })
    }

    if (typeof body.password !== 'string' || body.password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`, errorCode: 'ERR_WEAK_PASSWORD' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    if (!ipRateLimiter.isAllowed(`ip:${ip}`)) {
      const retryMs = ipRateLimiter.getRetryAfterMs(`ip:${ip}`)
      return NextResponse.json({
        error: `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(retryMs / 1000)} detik`,
        errorCode: 'ERR_RESOURCE_RATE_LIMITED',
      }, { status: 429 })
    }

    const normalizedNpsn = npsnResult.normalized!

    if (!npsnRateLimiter.isAllowed(`npsn:${normalizedNpsn}`)) {
      const retryMs = npsnRateLimiter.getRetryAfterMs(`npsn:${normalizedNpsn}`)
      return NextResponse.json({
        error: `NPSN sedang dalam cooldown. Coba lagi dalam ${Math.ceil(retryMs / 1000)} detik`,
        errorCode: 'ERR_NPSN_COOLDOWN_ACTIVE',
      }, { status: 429 })
    }

    const nameResult = normalizeSchoolName(body.namaSekolah)
    if (nameResult.error) {
      return NextResponse.json({ error: nameResult.error, errorCode: nameResult.errorCode }, { status: 400 })
    }
    const normalizedName = nameResult.normalized

    const existingSchool = await prisma.sekolah.findUnique({ where: { npsn: normalizedNpsn } })
    if (existingSchool && existingSchool.verificationStatus === 'VERIFIED') {
      return NextResponse.json({
        error: 'NPSN sudah terverifikasi',
        errorCode: 'ERR_SCHOOL_ALREADY_CLAIMED',
      }, { status: 409 })
    }

    let official = {
      nama: body.namaSekolah.toUpperCase(),
      sekolah_id: `sch-${normalizedNpsn}`,
      bentuk_pendidikan: body.namaSekolah.toLowerCase().includes('smk') ? 'SMK' : 'SMA',
      status_sekolah: 'NEGERI',
      akreditasi: 'A'
    }
    let verificationStatus = 'AUTO_CORRECTED'

    const apiResult = await lookupSchool(normalizedNpsn)
    if (apiResult.success && apiResult.data) {
      official = { ...apiResult.data, nama: apiResult.data.nama.toUpperCase() }
      const comparison = compareSchoolNames(normalizedName, official.nama)

      if (comparison.match === 'CRITICAL') {
        return NextResponse.json({
          error: 'Nama sekolah tidak sesuai dengan data NPSN di database pemerintah',
          errorCode: 'ERR_NPSN_NAME_MISMATCH',
        }, { status: 400 })
      }
      verificationStatus = comparison.match === 'EXACT' ? 'VERIFIED' : 'AUTO_CORRECTED'
    } else {
      verificationStatus = 'PENDING_REVIEW'
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const sekolah = await prisma.sekolah.create({
      data: {
        namaSekolah: official.nama,
        npsn: normalizedNpsn,
        emailResmi: body.emailResmi,
        password: hashedPassword,
        namaPenanggungJawab: body.namaPenanggungJawab,
        jabatanAdmin: body.jabatanAdmin,
        alamatLengkap: body.alamatLengkap,
        kontakSekolah: body.kontakSekolah,
        verificationStatus,
        officialNama: official.nama,
        officialSekolahId: official.sekolah_id,
        bentukPendidikan: official.bentuk_pendidikan,
        statusSekolah: official.status_sekolah,
        akreditasi: official.akreditasi,
        lastVerifiedAt: new Date(),
      },
    })

    // Sync ke Supabase Authentication (auth.users)
    createSupabaseAuthUser({
      email: body.emailResmi,
      password: body.password,
      nama: official.nama,
      role: 'sekolah'
    }).catch(() => {})

    // Kirim email verifikasi pendaftaran via Resend
    const { sendConfirmationEmail } = await import('@/lib/mail')
    sendConfirmationEmail({
      to: body.emailResmi,
      userNama: body.namaPenanggungJawab || official.nama,
      role: 'Sekolah'
    }).catch((e) => console.error('Gagal kirim email konfirmasi sekolah:', e))

    return NextResponse.json({
      data: {
        id: sekolah.id,
        email: sekolah.emailResmi,
        emailResmi: sekolah.emailResmi,
        nama: sekolah.namaPenanggungJawab,
        namaPenanggungJawab: sekolah.namaPenanggungJawab,
        namaSekolah: official.nama,
        nama_sekolah: official.nama,
        npsn: sekolah.npsn,
        role: 'sekolah',
        isVerified: verificationStatus === 'VERIFIED',
        is_verified: verificationStatus === 'VERIFIED',
        verificationStatus,
        status: verificationStatus,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NPSN atau email sudah terdaftar' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal membuat sekolah' }, { status: 500 })
  }
}
