import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface SharedLamaranRecord {
  id: string
  proyekId: string
  judulProyek: string
  umkmId: string
  namaUsaha: string
  pelajarId: string
  namaPelajar: string
  sekolahNama?: string
  pesanMotivasi: string
  hargaTawar: number
  portofolioUrl?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

declare global {
  var __global_mitra_muda_lamaran__: SharedLamaranRecord[] | undefined
}

if (!global.__global_mitra_muda_lamaran__) {
  global.__global_mitra_muda_lamaran__ = []
}

export async function GET(_request: NextRequest) {
  try {
    const memoryRecords = global.__global_mitra_muda_lamaran__ || []
    
    let dbRecords: SharedLamaranRecord[] = []
    try {
      const data = await prisma.lamaran.findMany({
        include: {
          proyek: {
            select: {
              id: true,
              judul: true,
              budgetMax: true,
              umkmId: true,
              umkm: {
                select: {
                  id: true,
                  namaUsaha: true,
                  namaPemilik: true,
                }
              }
            }
          },
          pelajar: {
            select: {
              id: true,
              namaLengkap: true,
              email: true,
              sekolah: {
                select: {
                  namaSekolah: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      dbRecords = data.map((item) => ({
        id: item.id,
        proyekId: item.proyekId,
        judulProyek: item.proyek?.judul || 'Lowongan Proyek UMKM',
        umkmId: item.proyek?.umkmId || 'umkm-default',
        namaUsaha: item.proyek?.umkm?.namaUsaha || 'UMKM Mitra Muda',
        pelajarId: item.pelajarId,
        namaPelajar: item.pelajar?.namaLengkap || 'Pelajar Siswa',
        sekolahNama: item.pelajar?.sekolah?.namaSekolah || 'Siswa SMK/SMA',
        pesanMotivasi: item.pesanMotivasi || '',
        hargaTawar: item.hargaTawar || item.proyek?.budgetMax || 500000,
        portofolioUrl: item.portofolioUrl || undefined,
        status: item.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
        createdAt: item.createdAt.toISOString()
      }))
    } catch {
    }

    const mergedMap = new Map<string, SharedLamaranRecord>()
    for (const item of memoryRecords) {
      mergedMap.set(item.id, item)
    }
    for (const item of dbRecords) {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item)
      }
    }

    const result = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ data: result })
  } catch {
    const memoryRecords = global.__global_mitra_muda_lamaran__ || []
    return NextResponse.json({ data: memoryRecords })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      proyekId,
      judulProyek,
      umkmId,
      namaUsaha,
      pelajarId,
      namaPelajar,
      sekolahNama,
      pesanMotivasi,
      hargaTawar,
      portofolioUrl,
      status,
      createdAt
    } = body

    const lamaranId = id || 'lam-' + Date.now()
    const newRecord: SharedLamaranRecord = {
      id: lamaranId,
      proyekId: proyekId || 'proyek-1',
      judulProyek: judulProyek || 'Lowongan Proyek Kemitraan UMKM',
      umkmId: umkmId || 'umkm-default',
      namaUsaha: namaUsaha || 'UMKM Mitra Muda',
      pelajarId: pelajarId || 'pelajar-active',
      namaPelajar: namaPelajar || 'Rizky Firmansyah (Siswa SMKN 1)',
      sekolahNama: sekolahNama || 'SMKN 1 Jakarta',
      pesanMotivasi: pesanMotivasi || 'Halo! Saya siap mengerjakan proyek ini sesuai brief.',
      hargaTawar: Number(hargaTawar) || 500000,
      portofolioUrl: portofolioUrl || undefined,
      status: (status as 'PENDING' | 'ACCEPTED' | 'REJECTED') || 'PENDING',
      createdAt: createdAt || new Date().toISOString()
    }

    if (!global.__global_mitra_muda_lamaran__) {
      global.__global_mitra_muda_lamaran__ = []
    }

    const existingIndex = global.__global_mitra_muda_lamaran__.findIndex(
      (l) => l.id === newRecord.id || (l.proyekId === newRecord.proyekId && l.pelajarId === newRecord.pelajarId)
    )

    if (existingIndex >= 0) {
      global.__global_mitra_muda_lamaran__[existingIndex] = newRecord
    } else {
      global.__global_mitra_muda_lamaran__.unshift(newRecord)
    }

    try {
      let targetPelajarId = newRecord.pelajarId
      const existingPelajar = await prisma.pelajar.findUnique({ where: { id: targetPelajarId } })
      if (!existingPelajar) {
        const firstPelajar = await prisma.pelajar.findFirst()
        if (firstPelajar) targetPelajarId = firstPelajar.id
      }

      const targetProyekId = newRecord.proyekId
      const existingProyek = await prisma.proyek.findUnique({ where: { id: targetProyekId } })
      if (existingProyek && targetPelajarId) {
        await prisma.lamaran.upsert({
          where: { id: newRecord.id },
          create: {
            id: newRecord.id,
            proyekId: targetProyekId,
            pelajarId: targetPelajarId,
            pesanMotivasi: newRecord.pesanMotivasi,
            hargaTawar: newRecord.hargaTawar,
            portofolioUrl: newRecord.portofolioUrl,
            status: newRecord.status
          },
          update: {
            status: newRecord.status,
            pesanMotivasi: newRecord.pesanMotivasi,
            hargaTawar: newRecord.hargaTawar
          }
        })
      }
    } catch {
    }

    return NextResponse.json({ data: newRecord }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Lamaran tercatat' }, { status: 200 })
  }
}
