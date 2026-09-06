import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJwt } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-server'

function maskSensitive(val?: string): string {
  if (!val) return ''
  if (val.length <= 4) return '***'
  return val.slice(0, 4) + '****' + val.slice(-3)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminCookie = request.cookies.get('mitra_muda_admin_session')?.value
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
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

    if (!isAdmin && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Hanya admin yang memiliki izin mengubah status transaksi' },
        { status: 403 }
      )
    }

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
          bankTujuan: updatedDeposit.bankTujuan || 'QRIS Pakasir',
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminCookie = request.cookies.get('mitra_muda_admin_session')?.value
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
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

    const existingDeposit = await prisma.depositTransaction.findFirst({
      where: {
        OR: [{ id }, { orderId: id }]
      }
    })

    if (existingDeposit) {
      const isOwner = user && user.id === existingDeposit.umkmId
      return NextResponse.json({
        data: {
          id: existingDeposit.id,
          umkmId: existingDeposit.umkmId,
          namaUsaha: existingDeposit.namaUsaha,
          namaPemilik: existingDeposit.namaPemilik,
          nominal: existingDeposit.nominal,
          bankTujuan: existingDeposit.bankTujuan || 'QRIS Pakasir',
          nomorPengirim: (isAdmin || isOwner) ? (existingDeposit.nomorPengirim || existingDeposit.orderId) : maskSensitive(existingDeposit.nomorPengirim || existingDeposit.orderId),
          buktiTransferUrl: (isAdmin || isOwner) ? (existingDeposit.buktiTransferUrl || existingDeposit.qrisUrl || undefined) : undefined,
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
