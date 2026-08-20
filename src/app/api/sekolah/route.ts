import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { normalizeSchoolName } from '@/lib/normalize-school-name'
import { compareSchoolNames } from '@/lib/compare-school-names'
import { validateNpsn } from '@/lib/validate-npsn'
import { lookupSchool } from '@/lib/kemendikdasmen'
import { ipRateLimiter, npsnRateLimiter } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')

    const where = search
      ? {
          OR: [
            { namaSekolah: { contains: search, mode: 'insensitive' as const } },
            { npsn: { contains: search, mode: 'insensitive' as const } },
            { emailResmi: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const data = await prisma.sekolah.findMany({ where })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET /api/sekolah error:', error)
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

    const npsnResult = validateNpsn(body.npsn)
    if (!npsnResult.valid) {
      return NextResponse.json({ error: npsnResult.error, errorCode: npsnResult.errorCode }, { status: 400 })
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

    const apiResult = await lookupSchool(normalizedNpsn)
    if (!apiResult.success) {
      return NextResponse.json({ error: apiResult.error, errorCode: apiResult.errorCode }, { status: 400 })
    }
    const official = apiResult.data!

    const comparison = compareSchoolNames(normalizedName, official.nama)

    if (comparison.match === 'CRITICAL') {
      return NextResponse.json({
        error: 'Nama sekolah tidak sesuai dengan data NPSN di database pemerintah',
        errorCode: 'ERR_NPSN_NAME_MISMATCH',
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const verificationStatus = comparison.match === 'EXACT' ? 'VERIFIED' : 'AUTO_CORRECTED'

    await prisma.sekolah.create({
      data: {
        namaSekolah: official.nama,
        npsn: normalizedNpsn,
        emailResmi: body.emailResmi,
        password: hashedPassword,
        namaPenanggungJawab: body.namaPenanggungJawab,
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

    return NextResponse.json({ data: { is_verified: true } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sekolah error:', error)
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NPSN atau email sudah terdaftar' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal membuat sekolah' }, { status: 500 })
  }
}
