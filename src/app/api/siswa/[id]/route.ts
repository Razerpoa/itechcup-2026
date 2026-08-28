import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await prisma.pelajar.findUnique({
      where: { id },
      include: { sekolah: true, profil: true },
    })

    if (!data) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data siswa' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.pelajar.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    const data = await prisma.pelajar.update({
      where: { id },
      data: {
        namaLengkap: body.namaLengkap,
        nis: body.nis,
        kelas: body.kelas,
        verificationStatus: body.verificationStatus as VerificationStatus | undefined,
        catatanPenolakan: body.verificationStatus === 'VERIFIED' && body.catatanPenolakan === undefined ? null : body.catatanPenolakan,
      },
      include: { sekolah: true, profil: true },
    })

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NIS sudah digunakan' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Gagal memperbarui siswa' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await prisma.pelajar.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    await prisma.pelajar.delete({ where: { id } })
    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus siswa' }, { status: 500 })
  }
}
