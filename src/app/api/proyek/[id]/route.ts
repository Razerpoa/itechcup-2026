import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proyek = await prisma.proyek.findUnique({
      where: { id },
      include: {
        umkm: {
          select: {
            id: true,
            namaUsaha: true,
            namaPemilik: true,
            fotoUsaha: true,
            nomorWa: true,
            alamat: true,
          }
        },
        _count: { select: { lamaran: true } }
      }
    })

    if (!proyek) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: proyek })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil detail proyek' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    try {
      await prisma.lamaran.deleteMany({
        where: { proyekId: id }
      })
      await prisma.proyek.delete({
        where: { id }
      })
    } catch {
    }

    return NextResponse.json({ success: true, message: 'Proyek berhasil dihapus' })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus proyek' }, { status: 500 })
  }
}
