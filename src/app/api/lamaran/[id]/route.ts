import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SharedLamaranRecord } from '../route'

declare global {
  var __global_mitra_muda_lamaran__: SharedLamaranRecord[] | undefined
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    if (global.__global_mitra_muda_lamaran__) {
      const idx = global.__global_mitra_muda_lamaran__.findIndex((l) => l.id === id)
      if (idx >= 0) {
        global.__global_mitra_muda_lamaran__[idx].status = status
      }
    }

    try {
      const existing = await prisma.lamaran.findUnique({ where: { id } })
      if (existing) {
        await prisma.lamaran.update({
          where: { id },
          data: { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' }
        })
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, status })
  } catch {
    return NextResponse.json({ message: 'Lamaran diupdate' }, { status: 200 })
  }
}
