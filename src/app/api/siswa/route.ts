import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const sekolahId = request.nextUrl.searchParams.get('sekolahId')
    const status = request.nextUrl.searchParams.get('status') as VerificationStatus | null

    const where: Record<string, unknown> = {}
    if (sekolahId) where.sekolahId = sekolahId
    if (status && Object.values(VerificationStatus).includes(status)) where.verificationStatus = status

    const data = await prisma.pelajar.findMany({
      where,
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        nis: true,
        kelas: true,
        verificationStatus: true,
        sekolahId: true,
        createdAt: true,
        updatedAt: true,
        sekolah: { select: { id: true, namaSekolah: true, npsn: true } },
      },
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data siswa' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['namaLengkap', 'nis', 'kelas', 'sekolahId', 'email', 'password']
    const missing = required.filter((f) => !body[f])
    if (missing.length > 0) {
      return NextResponse.json({ error: `Field wajib tidak ada: ${missing.join(', ')}` }, { status: 400 })
    }

    const sekolah = await prisma.sekolah.findUnique({ where: { id: body.sekolahId } })
    if (!sekolah) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const raw = await prisma.pelajar.create({
      data: {
        namaLengkap: body.namaLengkap,
        email: body.email,
        password: hashedPassword,
        nis: body.nis,
        kelas: body.kelas,
        sekolahId: body.sekolahId,
      },
      include: { sekolah: { select: { id: true, namaSekolah: true, npsn: true } } },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...data } = raw

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NIS atau Email sudah terdaftar' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal membuat siswa' }, { status: 500 })
  }
}
