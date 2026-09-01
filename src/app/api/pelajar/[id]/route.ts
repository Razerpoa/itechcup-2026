import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    let raw = await prisma.pelajar.findUnique({
      where: { id },
      include: {
        profil: true,
        sekolah: true,
        jasa: true,
        lamaran: true
      }
    })

    if (!raw) {
      // Fallback 1: Cek apakah ID yang dikirim merupakan ID Jasa
      const jasaItem = await prisma.jasa.findUnique({
        where: { id },
        select: { pelajarId: true }
      })
      if (jasaItem?.pelajarId) {
        raw = await prisma.pelajar.findUnique({
          where: { id: jasaItem.pelajarId },
          include: {
            profil: true,
            sekolah: true,
            jasa: true,
            lamaran: true
          }
        })
      }
    }

    if (!raw) {
      // Fallback 2: Cek apakah ID yang dikirim berupa email atau NIS
      raw = await prisma.pelajar.findFirst({
        where: {
          OR: [
            { email: id },
            { nis: id }
          ]
        },
        include: {
          profil: true,
          sekolah: true,
          jasa: true,
          lamaran: true
        }
      })
    }

    if (!raw) {
      return NextResponse.json({ error: 'Pelajar tidak ditemukan' }, { status: 404 })
    }

    const safeData = { ...raw }
    delete (safeData as Record<string, unknown>).password

    return NextResponse.json({ data: safeData })
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
      if (body.verificationStatus === 'VERIFIED' && body.catatanPenolakan === undefined) {
        updateData.catatanPenolakan = null
      }
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

    const rawUpdated = await prisma.pelajar.update({
      where: { id },
      data: updateData,
      include: { profil: true }
    })

    const safeUpdated = { ...rawUpdated }
    delete (safeUpdated as Record<string, unknown>).password

    return NextResponse.json({ data: safeUpdated })
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui status pelajar', details: error?.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PATCH(request, context)
}
