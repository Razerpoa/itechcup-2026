import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')
    const kategori = request.nextUrl.searchParams.get('kategori')
    const pelajarId = request.nextUrl.searchParams.get('pelajarId')

    const where: Record<string, unknown> = { isActive: true }

    if (pelajarId) where.pelajarId = pelajarId
    if (kategori && kategori !== 'Semua') where.kategori = kategori
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { keteranganSingkat: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    const data = await prisma.jasa.findMany({
      where,
      include: {
        pelajar: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            verificationStatus: true,
            profil: {
              select: {
                fotoProfil: true,
                ratingRata: true,
                jumlahProyekSelesai: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const mapped = data.map((j) => ({
      id: j.id,
      pelajarId: j.pelajarId,
      namaPelajar: j.pelajar?.namaLengkap || 'Pelajar Mitra Muda',
      fotoProfil: j.pelajar?.profil?.fotoProfil || undefined,
      ratingRata: j.pelajar?.profil?.ratingRata || 5.0,
      jumlahProyekSelesai: j.pelajar?.profil?.jumlahProyekSelesai || 0,
      judul: j.judul,
      keteranganSingkat: j.keteranganSingkat,
      keteranganPanjang: j.keteranganPanjang,
      kategori: j.kategori,
      tags: j.tags,
      foto: j.foto || undefined,
      hargaBasic: j.hargaBasic,
      deskripsiBasic: j.deskripsiBasic || undefined,
      hargaStandard: j.hargaStandard || undefined,
      deskripsiStandard: j.deskripsiStandard || undefined,
      hargaPremium: j.hargaPremium || undefined,
      deskripsiPremium: j.deskripsiPremium || undefined,
      createdAt: j.createdAt.toISOString()
    }))

    return NextResponse.json({ data: mapped })
  } catch (error) {
    console.error('Error fetching Jasa:', error)
    return NextResponse.json({ error: 'Gagal mengambil data jasa dari database' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pelajarId,
      namaPelajar,
      email,
      judul,
      keteranganSingkat,
      keteranganPanjang,
      kategori,
      tags,
      foto,
      hargaBasic,
      deskripsiBasic,
      hargaStandard,
      deskripsiStandard,
      hargaPremium,
      deskripsiPremium
    } = body

    if (!judul || !keteranganSingkat) {
      return NextResponse.json({ error: 'Judul dan keterangan singkat wajib diisi' }, { status: 400 })
    }

    let targetPelajarId = pelajarId
    if (targetPelajarId) {
      const existing = await prisma.pelajar.findUnique({ where: { id: targetPelajarId } })
      if (!existing) {
        targetPelajarId = null
      }
    }

    if (!targetPelajarId) {
      const fallbackEmail = email || `pelajar-${Date.now()}@mitramuda.id`
      const newPelajar = await prisma.pelajar.create({
        data: {
          namaLengkap: namaPelajar || 'Pelajar Mitra Muda',
          email: fallbackEmail,
          password: 'pelajar-default-password',
          kelas: 'SMK Terdaftar',
          verificationStatus: 'VERIFIED',
          profil: {
            create: {
              bidangKeahlian: tags ?? ['Web Dev', 'UI/UX'],
              skills: tags ?? ['Web Dev', 'UI/UX']
            }
          }
        }
      })
      targetPelajarId = newPelajar.id
    }

    const jasa = await prisma.jasa.create({
      data: {
        pelajarId: targetPelajarId,
        judul,
        keteranganSingkat,
        keteranganPanjang: keteranganPanjang || keteranganSingkat,
        kategori: kategori || 'Desain Grafis',
        tags: tags ?? [],
        foto: foto || null,
        hargaBasic: Number(hargaBasic) || 100000,
        deskripsiBasic: deskripsiBasic || null,
        hargaStandard: hargaStandard ? Number(hargaStandard) : null,
        deskripsiStandard: deskripsiStandard || null,
        hargaPremium: hargaPremium ? Number(hargaPremium) : null,
        deskripsiPremium: deskripsiPremium || null,
        isActive: true
      },
      include: {
        pelajar: {
          select: {
            id: true,
            namaLengkap: true,
            profil: { select: { fotoProfil: true, ratingRata: true, jumlahProyekSelesai: true } }
          }
        }
      }
    })

    return NextResponse.json({ data: jasa }, { status: 201 })
  } catch (error) {
    console.error('Error creating Jasa in DB:', error)
    return NextResponse.json({ error: 'Gagal membuat jasa ke database' }, { status: 500 })
  }
}
