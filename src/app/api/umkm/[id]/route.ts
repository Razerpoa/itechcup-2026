import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await prisma.uMKM.findUnique({
      where: { id },
      include: {
        proyek: true
      }
    })

    if (!raw) {
      return NextResponse.json({ error: 'UMKM tidak ditemukan' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...data } = raw

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data UMKM' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.isVerified !== undefined) {
      updateData.isVerified = Boolean(body.isVerified)
    }
    if (body.verifikasiType !== undefined) {
      updateData.verifikasiType = body.verifikasiType
    }
    if (body.buktiLegalitas !== undefined) {
      updateData.buktiLegalitas = body.buktiLegalitas
    }

    const rawUpdated = await prisma.uMKM.update({
      where: { id },
      data: updateData
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...updated } = rawUpdated

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui status UMKM' }, { status: 500 })
  }
}
