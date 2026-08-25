import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await prisma.pelajar.findUnique({
      where: { id },
      include: {
        profil: true,
        sekolah: true,
        jasa: true,
        lamaran: true
      }
    })

    if (!data) {
      return NextResponse.json({ error: 'Pelajar tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data pelajar' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.namaLengkap !== undefined) {
      updateData.namaLengkap = body.namaLengkap
    }
    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus
    }
    if (body.catatanPenolakan !== undefined) {
      updateData.catatanPenolakan = body.catatanPenolakan
    }
    if (body.nis !== undefined) {
      updateData.nis = body.nis
    }
    if (body.kelas !== undefined) {
      updateData.kelas = body.kelas
    }

    if (body.nomorWa !== undefined || body.bio !== undefined || body.fotoProfil !== undefined) {
      updateData.profil = {
        upsert: {
          create: {
            kontakWa: body.nomorWa,
            bio: body.bio,
            fotoProfil: body.fotoProfil
          },
          update: {
            kontakWa: body.nomorWa !== undefined ? body.nomorWa : undefined,
            bio: body.bio !== undefined ? body.bio : undefined,
            fotoProfil: body.fotoProfil !== undefined ? body.fotoProfil : undefined
          }
        }
      }
    }

    const updated = await prisma.pelajar.update({
      where: { id },
      data: updateData,
      include: { profil: true }
    })

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui status pelajar' }, { status: 500 })
  }
}
