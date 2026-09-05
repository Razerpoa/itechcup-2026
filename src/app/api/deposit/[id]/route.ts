import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, status, catatanAdmin } = body
    const newStatus = status || (action === 'APPROVE' ? 'APPROVED' : 'REJECTED')
    const approvedAt = newStatus === 'APPROVED' ? new Date() : undefined

    const existingDeposit = await prisma.depositTransaction.findFirst({
      where: {
        OR: [{ id }, { orderId: id }]
      }
    })

    if (existingDeposit) {
      const updatedDeposit = await prisma.depositTransaction.update({
        where: { id: existingDeposit.id },
        data: {
          status: newStatus,
          catatanAdmin: catatanAdmin || (newStatus === 'APPROVED' ? 'Disetujui oleh Master Admin Escrow' : 'Ditolak oleh Admin'),
          approvedAt
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updatedDeposit.id,
          umkmId: updatedDeposit.umkmId,
          namaUsaha: updatedDeposit.namaUsaha,
          namaPemilik: updatedDeposit.namaPemilik,
          nominal: updatedDeposit.nominal,
          bankTujuan: updatedDeposit.bankTujuan || 'BCA',
          nomorPengirim: updatedDeposit.nomorPengirim || updatedDeposit.orderId,
          buktiTransferUrl: updatedDeposit.buktiTransferUrl || updatedDeposit.qrisUrl || undefined,
          status: updatedDeposit.status,
          catatanAdmin: updatedDeposit.catatanAdmin,
          createdAt: updatedDeposit.createdAt.toISOString(),
          approvedAt: updatedDeposit.approvedAt?.toISOString()
        }
      })
    }

    const existingWithdrawal = await prisma.withdrawalTransaction.findUnique({
      where: { id }
    })

    if (existingWithdrawal) {
      const updatedWithdrawal = await prisma.withdrawalTransaction.update({
        where: { id },
        data: {
          status: newStatus,
          catatanAdmin: catatanAdmin || (newStatus === 'APPROVED' ? 'Pencairan diproses ke e-wallet' : 'Pencairan ditolak'),
          approvedAt
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updatedWithdrawal.id,
          pelajarId: updatedWithdrawal.pelajarId,
          namaPelajar: updatedWithdrawal.namaPelajar,
          nominal: updatedWithdrawal.nominal,
          eWalletType: updatedWithdrawal.eWalletType,
          eWalletNomor: updatedWithdrawal.eWalletNomor,
          status: updatedWithdrawal.status,
          catatanAdmin: updatedWithdrawal.catatanAdmin,
          createdAt: updatedWithdrawal.createdAt.toISOString(),
          approvedAt: updatedWithdrawal.approvedAt?.toISOString()
        }
      })
    }

    return NextResponse.json({ error: 'Transaksi tidak ditemukan di database' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui status transaksi di database' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existingDeposit = await prisma.depositTransaction.findFirst({
      where: {
        OR: [{ id }, { orderId: id }]
      }
    })

    if (existingDeposit) {
      return NextResponse.json({
        data: {
          id: existingDeposit.id,
          umkmId: existingDeposit.umkmId,
          namaUsaha: existingDeposit.namaUsaha,
          namaPemilik: existingDeposit.namaPemilik,
          nominal: existingDeposit.nominal,
          bankTujuan: existingDeposit.bankTujuan || 'QRIS Pakasir',
          nomorPengirim: existingDeposit.nomorPengirim || existingDeposit.orderId,
          buktiTransferUrl: existingDeposit.buktiTransferUrl || existingDeposit.qrisUrl || undefined,
          status: existingDeposit.status,
          catatanAdmin: existingDeposit.catatanAdmin,
          createdAt: existingDeposit.createdAt.toISOString(),
          approvedAt: existingDeposit.approvedAt?.toISOString()
        }
      })
    }

    return NextResponse.json({ error: 'Deposit tidak ditemukan' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data deposit' }, { status: 500 })
  }
}
