import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const sekolahId = request.nextUrl.searchParams.get('sekolahId')
    const status = request.nextUrl.searchParams.get('status') as VerificationStatus | null

    let school: { id: string; namaSekolah: string; npsn: string } | null = null
    if (sekolahId && sekolahId !== 'sekolah-active') {
      school = await prisma.sekolah.findUnique({
        where: { id: sekolahId },
        select: { id: true, namaSekolah: true, npsn: true }
      })
    }

    const where: Record<string, unknown> = {}
    if (status && Object.values(VerificationStatus).includes(status)) {
      where.verificationStatus = status
    }

    if (school) {
      where.OR = [
        { sekolahId: school.id },
        { kelas: { contains: school.namaSekolah, mode: 'insensitive' } },
        { kelas: { contains: school.npsn, mode: 'insensitive' } },
        { nis: { contains: school.npsn } }
      ]
    } else if (sekolahId) {
      where.sekolahId = sekolahId
    }

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
      orderBy: { createdAt: 'desc' }
    })

    // If school was found, auto-link unlinked students found by name
    if (school && data.length > 0) {
      const unlinkedIds = data.filter((d) => !d.sekolahId).map((d) => d.id)
      if (unlinkedIds.length > 0) {
        prisma.pelajar.updateMany({
          where: { id: { in: unlinkedIds } },
          data: { sekolahId: school.id }
        }).catch(() => {})
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching siswa list:', error)
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
