import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransaksiStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const proyekId = request.nextUrl.searchParams.get('proyekId')
    const lamaranId = request.nextUrl.searchParams.get('lamaranId')
    const id = request.nextUrl.searchParams.get('id')

    const where: Record<string, unknown> = {}
    if (id) where.id = id
    if (proyekId) where.proyekId = proyekId
    if (lamaranId) where.lamaranId = lamaranId

    const data = await prisma.transaksi.findMany({
      where,
      include: {
        proyek: {
          include: {
            umkm: { select: { id: true, namaUsaha: true, namaPemilik: true, email: true, nomorWa: true } }
          }
        },
        lamaran: {
          include: {
            pelajar: { select: { id: true, namaLengkap: true, email: true, nis: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching Transaksi:', error)
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      proyekId,
      lamaranId,
      totalAmount,
      dpAmount,
      dpPaid,
      fullPaid,
      status,
      submitUrl,
      catatanPelajar,
      catatanUMKM
    } = body

    if (!proyekId || !lamaranId) {
      return NextResponse.json({ error: 'proyekId dan lamaranId wajib diisi' }, { status: 400 })
    }

    
    const proyek = await prisma.proyek.findUnique({ where: { id: proyekId } })
    if (!proyek) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan di sistem' }, { status: 404 })
    }

    const lamaran = await prisma.lamaran.findUnique({ where: { id: lamaranId } })
    if (!lamaran || lamaran.proyekId !== proyekId) {
      return NextResponse.json({ error: 'Lamaran tidak valid atau tidak cocok dengan proyek' }, { status: 400 })
    }

    
    const calculatedTotal = Number(lamaran.hargaTawar) || Number(proyek.budgetMax) || 500000
    const dpPercentage = proyek.dpPersen || 30
    const calculatedDP = Math.round(calculatedTotal * (dpPercentage / 100))

    const validStatus = Object.values(TransaksiStatus).includes(status) ? status : 'MENUNGGU_PEMBAYARAN'

    const transaksi = await prisma.transaksi.upsert({
      where: {
        proyekId: proyekId
      },
      create: {
        id: id || undefined,
        proyekId,
        lamaranId,
        totalAmount: calculatedTotal,
        dpAmount: calculatedDP,
        dpPaid: Boolean(dpPaid),
        fullPaid: Boolean(fullPaid),
        status: validStatus,
        submitUrl: submitUrl || null,
        catatanPelajar: catatanPelajar || null,
        catatanUMKM: catatanUMKM || null
      },
      update: {
        dpPaid: dpPaid !== undefined ? Boolean(dpPaid) : undefined,
        fullPaid: fullPaid !== undefined ? Boolean(fullPaid) : undefined,
        status: validStatus,
        submitUrl: submitUrl !== undefined ? submitUrl : undefined,
        catatanPelajar: catatanPelajar !== undefined ? catatanPelajar : undefined,
        catatanUMKM: catatanUMKM !== undefined ? catatanUMKM : undefined
      },
      include: {
        proyek: {
          include: {
            umkm: { select: { id: true, namaUsaha: true, namaPemilik: true } }
          }
        },
        lamaran: {
          include: {
            pelajar: { select: { id: true, namaLengkap: true } }
          }
        }
      }
    })

    return NextResponse.json({ data: transaksi }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating Transaksi:', error)
    return NextResponse.json({ error: 'Gagal memproses transaksi di database' }, { status: 500 })
  }
}
