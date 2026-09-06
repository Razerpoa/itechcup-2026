import { prisma } from './prisma'
import fs from 'fs'
import path from 'path'

export async function restoreSnapshot() {
  const snapshotPath = path.join(process.cwd(), 'prisma', 'backup_snapshot.json')
  if (!fs.existsSync(snapshotPath)) {
    throw new Error('File backup snapshot tidak ditemukan di: ' + snapshotPath)
  }

  const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))

  if (Array.isArray(data.sekolah)) {
    for (const item of data.sekolah) {
      await prisma.sekolah.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Sekolah restored:', data.sekolah.length)
  }

  if (Array.isArray(data.pelajar)) {
    for (const item of data.pelajar) {
      await prisma.pelajar.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Pelajar restored:', data.pelajar.length)
  }

  if (Array.isArray(data.pelajarProfile)) {
    for (const item of data.pelajarProfile) {
      await prisma.pelajarProfile.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('PelajarProfile restored:', data.pelajarProfile.length)
  }

  if (Array.isArray(data.umkm)) {
    for (const item of data.umkm) {
      await prisma.uMKM.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('UMKM restored:', data.umkm.length)
  }

  if (Array.isArray(data.proyek)) {
    for (const item of data.proyek) {
      await prisma.proyek.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Proyek restored:', data.proyek.length)
  }

  if (Array.isArray(data.jasa)) {
    for (const item of data.jasa) {
      await prisma.jasa.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Jasa restored:', data.jasa.length)
  }

  if (Array.isArray(data.lamaran)) {
    for (const item of data.lamaran) {
      await prisma.lamaran.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Lamaran restored:', data.lamaran.length)
  }

  if (Array.isArray(data.transaksi)) {
    for (const item of data.transaksi) {
      await prisma.transaksi.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('Transaksi restored:', data.transaksi.length)
  }

  if (Array.isArray(data.chatMessage)) {
    for (const item of data.chatMessage) {
      await prisma.chatMessage.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('ChatMessage restored:', data.chatMessage.length)
  }

  if (Array.isArray(data.deliverableWork)) {
    for (const item of data.deliverableWork) {
      await prisma.deliverableWork.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('DeliverableWork restored:', data.deliverableWork.length)
  }

  if (Array.isArray(data.depositTransaction)) {
    for (const item of data.depositTransaction) {
      await prisma.depositTransaction.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('DepositTransaction restored:', data.depositTransaction.length)
  }

  if (Array.isArray(data.withdrawalTransaction)) {
    for (const item of data.withdrawalTransaction) {
      await prisma.withdrawalTransaction.upsert({
        where: { id: item.id },
        update: item,
        create: item
      })
    }
    console.log('WithdrawalTransaction restored:', data.withdrawalTransaction.length)
  }

  console.log('All snapshot data restored successfully!')
}

if (process.argv[1] && process.argv[1].includes('restore.ts')) {
  restoreSnapshot()
    .catch((err) => {
      console.error('Error during restore:', err)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
