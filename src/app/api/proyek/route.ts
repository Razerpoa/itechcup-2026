import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const umkmId = request.nextUrl.searchParams.get('umkmId')
    const status = request.nextUrl.searchParams.get('status')
    const tags = request.nextUrl.searchParams.get('tags')
    const budgetMin = request.nextUrl.searchParams.get('budgetMin')
    const budgetMax = request.nextUrl.searchParams.get('budgetMax')

    const where: Record<string, unknown> = {}

    if (umkmId) where.umkmId = umkmId
    if (status) where.status = status
    else where.status = 'OPEN'
    if (tags) where.tags = { hasSome: tags.split(',') }
    if (budgetMin) where.budgetMin = { gte: parseInt(budgetMin) }
    if (budgetMax) where.budgetMax = { lte: parseInt(budgetMax) }

    const data = await prisma.proyek.findMany({
      where,
      include: {
        umkm: { select: { id: true, namaUsaha: true, fotoUsaha: true, namaPemilik: true, alamat: true } },
        _count: { select: { lamaran: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data proyek' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      umkmId,
      namaUsaha,
      namaPemilik,
      email,
      nomorWa,
      judul,
      keteranganSingkat,
      keteranganPanjang,
      tema,
      fotoProfil,
      fotoBanner,
      ketentuan,
      tags,
      budgetMin,
      budgetMax,
      dpPersen
    } = body

    if (!judul || !keteranganSingkat) {
      return NextResponse.json({ error: 'Judul dan keterangan singkat wajib diisi' }, { status: 400 })
    }

    let targetUmkmId = umkmId

    if (targetUmkmId) {
      const existing = await prisma.uMKM.findUnique({ where: { id: targetUmkmId } })
      if (!existing) {
        targetUmkmId = null
      }
    }

    if (!targetUmkmId) {
      const fallbackEmail = email || `umkm-${Date.now()}@mitramuda.id`
      const fallbackWa = nomorWa || `08${Math.floor(1000000000 + Math.random() * 9000000000)}`
      
      const newUmkm = await prisma.uMKM.create({
        data: {
          namaPemilik: namaPemilik || 'Pemilik UMKM',
          namaUsaha: namaUsaha || 'UMKM Mitra Muda',
          email: fallbackEmail,
          password: 'umkm-default-password',
          nomorWa: fallbackWa,
          fotoUsaha: fotoBanner || fotoProfil || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(namaUsaha || 'umkm')}`
        }
      })
      targetUmkmId = newUmkm.id
    }

    const minBud = Number(budgetMin) || Math.round((Number(budgetMax) || 1000000) * 0.7)
    const maxBud = Number(budgetMax) || 1000000

    const proyek = await prisma.proyek.create({
      data: {
        umkmId: targetUmkmId,
        judul,
        keteranganSingkat,
        keteranganPanjang: keteranganPanjang || keteranganSingkat,
        tema: tema || 'Umum',
        fotoProfil: fotoProfil || null,
        fotoBanner: fotoBanner || null,
        ketentuan: ketentuan || null,
        tags: tags ?? [],
        budgetMin: minBud,
        budgetMax: maxBud,
        dpPersen: Number(dpPersen) || 30,
        status: 'OPEN'
      },
      include: {
        umkm: { select: { id: true, namaUsaha: true, fotoUsaha: true, namaPemilik: true, alamat: true } },
        _count: { select: { lamaran: true } }
      }
    })

    return NextResponse.json({ data: proyek }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat proyek ke database' }, { status: 500 })
  }
}
