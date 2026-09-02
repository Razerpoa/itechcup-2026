import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    const pelajar = await prisma.pelajar.findUnique({
      where: { email: trimmedEmail },
      include: { profil: true, sekolah: { select: { namaSekolah: true } } }
    })

    if (pelajar) {
      return NextResponse.json({
        exists: true,
        user: {
          id: pelajar.id,
          email: pelajar.email,
          nama: pelajar.namaLengkap,
          role: 'pelajar',
          sekolah: pelajar.sekolah?.namaSekolah || pelajar.kelas || 'SMK Terdaftar',
          nisn: pelajar.nis,
          skills: pelajar.profil?.skills?.length ? pelajar.profil.skills : pelajar.profil?.bidangKeahlian || ['Web Dev', 'UI/UX'],
          proyekSelesai: pelajar.profil?.jumlahProyekSelesai || 0,
          totalPendapatan: pelajar.profil?.totalPendapatan || 0,
          onTimeRate: 100,
          verificationStatus: pelajar.verificationStatus,
          isVerified: pelajar.verificationStatus === 'VERIFIED'
        }
      })
    }

    const umkm = await prisma.uMKM.findUnique({
      where: { email: trimmedEmail }
    })

    if (umkm) {
      return NextResponse.json({
        exists: true,
        user: {
          id: umkm.id,
          email: umkm.email,
          nama: umkm.namaPemilik,
          namaUsaha: umkm.namaUsaha,
          nomorWa: umkm.nomorWa,
          role: 'umkm',
          isVerified: Boolean(umkm.isVerified),
          verificationStatus: umkm.isVerified ? 'VERIFIED' : 'PENDING'
        }
      })
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: { emailResmi: trimmedEmail }
    })

    if (sekolah) {
      const isSekolahVerified = sekolah.verificationStatus === 'VERIFIED'
      return NextResponse.json({
        exists: true,
        user: {
          id: sekolah.id,
          email: sekolah.emailResmi,
          nama: sekolah.namaPenanggungJawab,
          namaSekolah: sekolah.namaSekolah,
          npsn: sekolah.npsn,
          role: 'sekolah',
          isVerified: isSekolahVerified,
          verificationStatus: (sekolah.verificationStatus as any) || 'PENDING_REVIEW'
        }
      })
    }

    
    const rawNama = body.nama || trimmedEmail.split('@')[0]
    const formattedNama = rawNama.charAt(0).toUpperCase() + rawNama.slice(1)

    return NextResponse.json({
      exists: false,
      email: trimmedEmail,
      nama: formattedNama,
      message: 'Akun dengan email ini belum terdaftar. Silakan pilih peran dan daftarkan diri Anda.'
    })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses validasi akun Google' }, { status: 500 })
  }
}
