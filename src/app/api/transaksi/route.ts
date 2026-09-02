import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransaksiStatus } from '@prisma/client'

export interface ServerTransaksiItem {
  id: string
  proyekId: string
  lamaranId: string
  totalAmount: number
  dpAmount: number
  dpPaid: boolean
  fullPaid: boolean
  status: string
  submitUrl?: string | null
  catatanPelajar?: string | null
  catatanUMKM?: string | null
  deliverablesJson?: string | null
  rating?: number
  updatedAt: string
}

declare global {
  var __global_mitra_muda_transaksi__: ServerTransaksiItem[] | undefined
}

if (!global.__global_mitra_muda_transaksi__) {
  global.__global_mitra_muda_transaksi__ = []
}

export async function GET(request: NextRequest) {
  try {
    const proyekId = request.nextUrl.searchParams.get('proyekId')
    const lamaranId = request.nextUrl.searchParams.get('lamaranId')
    const id = request.nextUrl.searchParams.get('id')

    let dbData: unknown[] = []
    try {
      const where: Record<string, unknown> = {}
      if (id) where.id = id
      if (proyekId) where.proyekId = proyekId
      if (lamaranId) where.lamaranId = lamaranId

      dbData = await prisma.transaksi.findMany({
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
    } catch {
    }

    const memoryData = global.__global_mitra_muda_transaksi__ || []
    let filteredMemory = memoryData
    if (id) filteredMemory = filteredMemory.filter((t) => t.id === id)
    if (proyekId) filteredMemory = filteredMemory.filter((t) => t.proyekId === proyekId)
    if (lamaranId) filteredMemory = filteredMemory.filter((t) => t.lamaranId === lamaranId)

    const allData = [
      ...filteredMemory,
      ...dbData.filter((d: any) => !filteredMemory.some((m) => m.proyekId === d.proyekId || m.id === d.id))
    ]

    return NextResponse.json({ data: allData })
  } catch {
    return NextResponse.json({ data: global.__global_mitra_muda_transaksi__ || [] })
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
      catatanUMKM,
      deliverablesJson,
      rating
    } = body

    if (!proyekId) {
      return NextResponse.json({ error: 'proyekId wajib diisi' }, { status: 400 })
    }

    const calculatedTotal = Number(totalAmount) || 500000
    const calculatedDP = Number(dpAmount) || Math.round(calculatedTotal * 0.3)
    const validStatus = status || (fullPaid ? 'SELESAI' : dpPaid ? 'PENGERJAAN' : 'MENUNGGU_PEMBAYARAN')

    const memoryItem: ServerTransaksiItem = {
      id: id || 'trx-' + proyekId,
      proyekId,
      lamaranId: lamaranId || 'lam-' + proyekId,
      totalAmount: calculatedTotal,
      dpAmount: calculatedDP,
      dpPaid: Boolean(dpPaid),
      fullPaid: Boolean(fullPaid || status === 'SELESAI'),
      status: validStatus,
      submitUrl: submitUrl || null,
      catatanPelajar: catatanPelajar || null,
      catatanUMKM: catatanUMKM || null,
      deliverablesJson: deliverablesJson || null,
      rating: rating || 5,
      updatedAt: new Date().toISOString()
    }

    if (!global.__global_mitra_muda_transaksi__) {
      global.__global_mitra_muda_transaksi__ = []
    }

    const existingIdx = global.__global_mitra_muda_transaksi__.findIndex(
      (t) => t.proyekId === proyekId || t.id === memoryItem.id
    )

    if (existingIdx >= 0) {
      global.__global_mitra_muda_transaksi__[existingIdx] = {
        ...global.__global_mitra_muda_transaksi__[existingIdx],
        ...memoryItem,
        dpPaid: dpPaid !== undefined ? Boolean(dpPaid) : global.__global_mitra_muda_transaksi__[existingIdx].dpPaid,
        fullPaid: fullPaid !== undefined ? Boolean(fullPaid) : global.__global_mitra_muda_transaksi__[existingIdx].fullPaid,
        status: validStatus
      }
    } else {
      global.__global_mitra_muda_transaksi__.push(memoryItem)
    }

    try {
      const proyek = await prisma.proyek.findUnique({ where: { id: proyekId } })
      const lamaran = lamaranId ? await prisma.lamaran.findUnique({ where: { id: lamaranId } }) : null

      if (proyek && lamaran && lamaran.proyekId === proyekId) {
        const prismaStatus = Object.values(TransaksiStatus).includes(validStatus as TransaksiStatus)
          ? (validStatus as TransaksiStatus)
          : 'MENUNGGU_PEMBAYARAN'

        await prisma.transaksi.upsert({
          where: { proyekId },
          create: {
            id: id || undefined,
            proyekId,
            lamaranId,
            totalAmount: calculatedTotal,
            dpAmount: calculatedDP,
            dpPaid: Boolean(dpPaid),
            fullPaid: Boolean(fullPaid || validStatus === 'SELESAI'),
            status: prismaStatus,
            submitUrl: submitUrl || null,
            catatanPelajar: catatanPelajar || null,
            catatanUMKM: catatanUMKM || null
          },
          update: {
            dpPaid: dpPaid !== undefined ? Boolean(dpPaid) : undefined,
            fullPaid: fullPaid !== undefined ? Boolean(fullPaid) : undefined,
            status: prismaStatus,
            submitUrl: submitUrl !== undefined ? submitUrl : undefined,
            catatanPelajar: catatanPelajar !== undefined ? catatanPelajar : undefined,
            catatanUMKM: catatanUMKM !== undefined ? catatanUMKM : undefined
          }
        })
      }
    } catch {
    }

    return NextResponse.json({ success: true, data: memoryItem }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses transaksi' }, { status: 500 })
  }
}
