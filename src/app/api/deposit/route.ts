import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDepositId } from '@/lib/utils'

export interface ApiDepositItem {
  id: string
  umkmId: string
  namaUsaha: string
  namaPemilik: string
  nominal: number
  bankTujuan: string
  nomorPengirim?: string
  buktiTransferUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  catatanAdmin?: string
  createdAt: string
  approvedAt?: string
}

export interface ApiWithdrawalItem {
  id: string
  pelajarId: string
  namaPelajar: string
  nominal: number
  eWalletType: 'GoPay' | 'DANA' | 'OVO' | 'ShopeePay'
  eWalletNomor: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  catatanAdmin?: string
  createdAt: string
  approvedAt?: string
}

export interface ApiEscrowState {
  deposits: ApiDepositItem[]
  withdrawals: ApiWithdrawalItem[]
  umkmBalances: Record<string, number>
  pelajarBalances: Record<string, number>
}

async function getFullEscrowState(): Promise<ApiEscrowState> {
  const [dbDeposits, dbWithdrawals] = await Promise.all([
    prisma.depositTransaction.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.withdrawalTransaction.findMany({
      orderBy: { createdAt: 'desc' }
    })
  ])

  const deposits: ApiDepositItem[] = dbDeposits.map((d) => ({
    id: d.id,
    umkmId: d.umkmId,
    namaUsaha: d.namaUsaha,
    namaPemilik: d.namaPemilik,
    nominal: d.nominal,
    bankTujuan: d.bankTujuan || 'QRIS Pakasir',
    nomorPengirim: d.nomorPengirim || d.orderId,
    buktiTransferUrl: d.buktiTransferUrl || d.qrisUrl || undefined,
    status: d.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    catatanAdmin: d.catatanAdmin || undefined,
    createdAt: d.createdAt.toISOString(),
    approvedAt: d.approvedAt ? d.approvedAt.toISOString() : undefined
  }))

  const withdrawals: ApiWithdrawalItem[] = dbWithdrawals.map((w) => ({
    id: w.id,
    pelajarId: w.pelajarId,
    namaPelajar: w.namaPelajar,
    nominal: w.nominal,
    eWalletType: w.eWalletType as 'GoPay' | 'DANA' | 'OVO' | 'ShopeePay',
    eWalletNomor: w.eWalletNomor,
    status: w.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    catatanAdmin: w.catatanAdmin || undefined,
    createdAt: w.createdAt.toISOString(),
    approvedAt: w.approvedAt ? w.approvedAt.toISOString() : undefined
  }))

  const umkmBalances: Record<string, number> = {}
  for (const dep of deposits) {
    if (dep.status === 'APPROVED') {
      umkmBalances[dep.umkmId] = (umkmBalances[dep.umkmId] || 0) + dep.nominal
    }
  }

  const pelajarBalances: Record<string, number> = {}
  for (const w of withdrawals) {
    if (w.status === 'APPROVED') {
      pelajarBalances[w.pelajarId] = Math.max(0, (pelajarBalances[w.pelajarId] || 0) - w.nominal)
    }
  }

  return { deposits, withdrawals, umkmBalances, pelajarBalances }
}

export async function GET(_request: NextRequest) {
  try {
    const state = await getFullEscrowState()
    return NextResponse.json({ success: true, data: state })
  } catch {
    return NextResponse.json({
      success: true,
      data: { deposits: [], withdrawals: [], umkmBalances: {}, pelajarBalances: {} }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, payload } = body

    if (type === 'SYNC') {
      const clientDeposits: ApiDepositItem[] = body.deposits || []
      const clientWithdrawals: ApiWithdrawalItem[] = body.withdrawals || []

      for (const cd of clientDeposits) {
        if (!cd.id) continue
        try {
          await prisma.depositTransaction.upsert({
            where: { id: cd.id },
            update: {
              status: cd.status,
              approvedAt: cd.approvedAt ? new Date(cd.approvedAt) : undefined,
              catatanAdmin: cd.catatanAdmin
            },
            create: {
              id: cd.id,
              orderId: cd.nomorPengirim || cd.id,
              umkmId: cd.umkmId || 'umkm-default',
              namaUsaha: cd.namaUsaha || 'UMKM Mitra Muda',
              namaPemilik: cd.namaPemilik || 'Pemilik Usaha',
              nominal: cd.nominal || 500000,
              paymentMethod: cd.bankTujuan?.includes('QRIS') ? 'qris' : 'manual',
              bankTujuan: cd.bankTujuan || 'BCA',
              nomorPengirim: cd.nomorPengirim,
              buktiTransferUrl: cd.buktiTransferUrl,
              status: cd.status || 'PENDING',
              createdAt: cd.createdAt ? new Date(cd.createdAt) : new Date(),
              approvedAt: cd.approvedAt ? new Date(cd.approvedAt) : undefined
            }
          })
        } catch {
        }
      }

      for (const cw of clientWithdrawals) {
        if (!cw.id) continue
        try {
          await prisma.withdrawalTransaction.upsert({
            where: { id: cw.id },
            update: {
              status: cw.status,
              approvedAt: cw.approvedAt ? new Date(cw.approvedAt) : undefined,
              catatanAdmin: cw.catatanAdmin
            },
            create: {
              id: cw.id,
              pelajarId: cw.pelajarId || 'pelajar-1',
              namaPelajar: cw.namaPelajar || 'Pelajar Mitra Muda',
              nominal: cw.nominal || 100000,
              eWalletType: cw.eWalletType || 'GoPay',
              eWalletNomor: cw.eWalletNomor || '081234567890',
              status: cw.status || 'PENDING',
              createdAt: cw.createdAt ? new Date(cw.createdAt) : new Date(),
              approvedAt: cw.approvedAt ? new Date(cw.approvedAt) : undefined
            }
          })
        } catch {
        }
      }

      const state = await getFullEscrowState()
      return NextResponse.json({ success: true, data: state })
    }

    if (type === 'RELEASE_TO_PELAJAR' || action === 'RELEASE_TO_PELAJAR') {
      const targetPelajarId = (payload?.pelajarId || body.pelajarId || 'pelajar-active') as string
      const nominal = Number(payload?.nominalTotal || body.nominalTotal) || 500000
      const state = await getFullEscrowState()
      const newBal = (state.pelajarBalances[targetPelajarId] || 0) + nominal
      return NextResponse.json({
        success: true,
        pelajarId: targetPelajarId,
        nominal,
        newBalance: newBal
      })
    }

    if (type === 'DEPOSIT') {
      const depositId = payload.id || generateDepositId('MTU')
      const createdDeposit = await prisma.depositTransaction.upsert({
        where: { id: depositId },
        update: {
          status: payload.status || 'PENDING',
          nominal: Number(payload.nominal) || 500000,
          bankTujuan: payload.bankTujuan || 'BCA',
          nomorPengirim: payload.nomorPengirim,
          buktiTransferUrl: payload.buktiTransferUrl,
          catatanAdmin: payload.catatanAdmin
        },
        create: {
          id: depositId,
          orderId: payload.orderId || depositId,
          umkmId: payload.umkmId || 'umkm-default',
          namaUsaha: payload.namaUsaha || 'UMKM Mitra Muda',
          namaPemilik: payload.namaPemilik || 'Pemilik Usaha',
          nominal: Number(payload.nominal) || 500000,
          paymentMethod: payload.paymentMethod || (payload.bankTujuan?.includes('QRIS') ? 'qris' : 'manual'),
          bankTujuan: payload.bankTujuan || 'BCA',
          nomorPengirim: payload.nomorPengirim,
          buktiTransferUrl: payload.buktiTransferUrl,
          status: payload.status || 'PENDING'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: createdDeposit.id,
          umkmId: createdDeposit.umkmId,
          namaUsaha: createdDeposit.namaUsaha,
          namaPemilik: createdDeposit.namaPemilik,
          nominal: createdDeposit.nominal,
          bankTujuan: createdDeposit.bankTujuan || 'BCA',
          nomorPengirim: createdDeposit.nomorPengirim || undefined,
          buktiTransferUrl: createdDeposit.buktiTransferUrl || undefined,
          status: createdDeposit.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          createdAt: createdDeposit.createdAt.toISOString()
        }
      }, { status: 201 })
    }

    if (type === 'WITHDRAWAL') {
      const withdrawalId = payload.id || `WD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      const createdWithdrawal = await prisma.withdrawalTransaction.upsert({
        where: { id: withdrawalId },
        update: {
          status: payload.status || 'PENDING',
          catatanAdmin: payload.catatanAdmin
        },
        create: {
          id: withdrawalId,
          pelajarId: payload.pelajarId || 'pelajar-1',
          namaPelajar: payload.namaPelajar || 'Pelajar Mitra Muda',
          nominal: Number(payload.nominal) || 100000,
          eWalletType: payload.eWalletType || 'GoPay',
          eWalletNomor: payload.eWalletNomor || '081234567890',
          status: payload.status || 'PENDING'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: createdWithdrawal.id,
          pelajarId: createdWithdrawal.pelajarId,
          namaPelajar: createdWithdrawal.namaPelajar,
          nominal: createdWithdrawal.nominal,
          eWalletType: createdWithdrawal.eWalletType,
          eWalletNomor: createdWithdrawal.eWalletNomor,
          status: createdWithdrawal.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          createdAt: createdWithdrawal.createdAt.toISOString()
        }
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipe transaksi tidak valid' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses transaksi database' }, { status: 500 })
  }
}
