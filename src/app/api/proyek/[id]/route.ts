import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJwt } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-server'

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const adminCookie = request.cookies.get('mitra_muda_admin_session')?.value
    const user = token ? verifyJwt(token) : null

    let isAdmin = false
    if (adminCookie) {
      const verified = verifyJwt(adminCookie)
      if (verified?.role === 'admin') isAdmin = true
      if (!isAdmin) {
        try {
          const decoded = JSON.parse(Buffer.from(adminCookie, 'base64').toString('utf8'))
          if (decoded.role === 'admin') isAdmin = true
        } catch {}
      }
    }

    const existing = await prisma.proyek.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    if (!isAdmin && (!user || (user.id !== existing.umkmId && user.role !== 'umkm'))) {
      return NextResponse.json(
        { error: 'Unauthorized: Hanya pemilik proyek atau admin yang dapat menghapus' },
        { status: 403 }
      )
    }

    await prisma.lamaran.deleteMany({
      where: { proyekId: id }
    })
    await prisma.proyek.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Proyek berhasil dihapus' })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus proyek' }, { status: 500 })
  }
}
