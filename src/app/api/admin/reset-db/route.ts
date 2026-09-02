import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const adminCookie = request.cookies.get('mitra_muda_admin_session')?.value
    if (!adminCookie) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses khusus admin / pengelola sistem.' },
        { status: 401 }
      )
    }

    try {
      const decoded = JSON.parse(Buffer.from(adminCookie, 'base64').toString('utf8'))
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Akses ditolak.' },
          { status: 403 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    if (body?.confirmation !== 'RESET') {
      return NextResponse.json(
        { error: 'Kata konfirmasi salah. Harap ketik "RESET" untuk melakukan pembersihan database.' },
        { status: 400 }
      )
    }

    // 1. Bersihkan seluruh data transaksi dan entitas terkait (urutan aman foreign key)
    await prisma.transaksi.deleteMany()
    await prisma.lamaran.deleteMany()
    await prisma.proyek.deleteMany()
    await prisma.jasa.deleteMany()
    await prisma.pelajarProfile.deleteMany()
    await prisma.pelajar.deleteMany()
    await prisma.uMKM.deleteMany()
    await prisma.sekolah.deleteMany()

    // 2. Hash default untuk akun-akun dasar
    const defaultHash = await bcrypt.hash('password123', 10)

    // 3. Seed Sekolah Resmi Kemendikdasmen RI
    const smk2Tasik = await prisma.sekolah.create({
      data: {
        namaSekolah: 'SMK NEGERI 2 TASIKMALAYA',
        npsn: '20224591',
        emailResmi: 'smkn2tsm@disdik.jabar.go.id',
        password: defaultHash,
        namaPenanggungJawab: 'Drs. H. Ahmad Junaedi, M.Pd.',
        jabatanAdmin: 'Kepala Sekolah',
        alamatLengkap: 'Jl. Noenoeng Tisnasaputra, Kahuripan, Kec. Tawang, Kota Tasikmalaya, Jawa Barat 46115',
        kontakSekolah: '0265-331839',
        verificationStatus: 'VERIFIED',
        officialNama: 'SMK NEGERI 2 TASIKMALAYA',
        bentukPendidikan: 'SMK',
        statusSekolah: 'NEGERI',
        akreditasi: 'A'
      }
    })

    const smk1Jakarta = await prisma.sekolah.create({
      data: {
        namaSekolah: 'SMK NEGERI 1 JAKARTA',
        npsn: '20100142',
        emailResmi: 'smkn1jakarta@disdik.dki.go.id',
        password: defaultHash,
        namaPenanggungJawab: 'Dr. Dra. Siti Rahmah, M.Pd.',
        jabatanAdmin: 'Wakasek Hubin',
        alamatLengkap: 'Jl. Budi Utomo No.7, Ps. Baru, Sawah Besar, Jakarta Pusat, DKI Jakarta 10710',
        kontakSekolah: '021-3841123',
        verificationStatus: 'VERIFIED',
        officialNama: 'SMK NEGERI 1 JAKARTA',
        bentukPendidikan: 'SMK',
        statusSekolah: 'NEGERI',
        akreditasi: 'A'
      }
    })

    const sma3Surabaya = await prisma.sekolah.create({
      data: {
        namaSekolah: 'SMA NEGERI 3 SURABAYA',
        npsn: '20535352',
        emailResmi: 'sman3surabaya@surabaya.go.id',
        password: defaultHash,
        namaPenanggungJawab: 'Drs. H. Budi Santoso, M.M.',
        jabatanAdmin: 'Koordinator Karir',
        alamatLengkap: 'Jl. Mpu Supodro No.47, Gubeng, Kec. Gubeng, Kota Surabaya, Jawa Timur 60281',
        kontakSekolah: '031-5021888',
        verificationStatus: 'VERIFIED',
        officialNama: 'SMA NEGERI 3 SURABAYA',
        bentukPendidikan: 'SMA',
        statusSekolah: 'NEGERI',
        akreditasi: 'A'
      }
    })

    // 4. Seed Akun Pelajar & Portofolio
    const siswaRaffa = await prisma.pelajar.create({
      data: {
        namaLengkap: 'Raffa Maulana',
        email: 'raffa@example.com',
        password: defaultHash,
        nis: '2024001',
        kelas: 'XII RPL 1',
        sekolahId: smk2Tasik.id,
        verificationStatus: 'VERIFIED',
        profil: {
          create: {
            displayName: 'Raffa',
            bio: 'Siswa jurusan RPL yang berfokus pada Frontend Development (React/Next.js) dan UI/UX Design.',
            bidangKeahlian: ['Web Development', 'UI/UX Design'],
            skills: ['React', 'Next.js', 'Tailwind CSS', 'Figma'],
            ratingRata: 4.9,
            jumlahUlasan: 6,
            jumlahProyekSelesai: 5,
            totalPendapatan: 2500000,
            eWalletType: 'GOPAY',
            eWalletNomor: '081234567891'
          }
        }
      }
    })

    await prisma.pelajar.create({
      data: {
        namaLengkap: 'Siti Nurhaliza',
        email: 'siti@example.com',
        password: defaultHash,
        nis: '2024002',
        kelas: 'XII DKV 2',
        sekolahId: smk2Tasik.id,
        verificationStatus: 'PENDING',
        profil: {
          create: {
            displayName: 'Siti',
            bio: 'Desainer grafis muda berpengalaman membuat kemasan produk, poster promosi, dan feed medsos.',
            bidangKeahlian: ['Desain Grafis', 'Branding'],
            skills: ['Photoshop', 'Illustrator', 'Canva Pro'],
            ratingRata: 5.0,
            jumlahUlasan: 2,
            jumlahProyekSelesai: 2,
            totalPendapatan: 800000
          }
        }
      }
    })

    await prisma.pelajar.create({
      data: {
        namaLengkap: 'Budi Kurniawan',
        email: 'budi@example.com',
        password: defaultHash,
        nis: '2024003',
        kelas: 'XI RPL 2',
        sekolahId: smk1Jakarta.id,
        verificationStatus: 'VERIFIED',
        profil: {
          create: {
            displayName: 'Budi',
            bio: 'Pengembang web dan integrasi API untuk digitalisasi UMKM.',
            bidangKeahlian: ['Web Development'],
            skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
            ratingRata: 4.8,
            jumlahUlasan: 3,
            jumlahProyekSelesai: 3,
            totalPendapatan: 1500000
          }
        }
      }
    })

    // 5. Seed Akun UMKM
    const umkmKopi = await prisma.uMKM.create({
      data: {
        namaPemilik: 'Hendra Pratama',
        namaUsaha: 'Kopi Karsa Nusantara',
        email: 'kopikarsa@example.com',
        password: defaultHash,
        nomorWa: '081234567890',
        isWaVerified: true,
        isVerified: true,
        kategori: 'Kuliner & F&B',
        alamat: 'Jl. R.E. Martadinata No. 88, Kota Tasikmalaya',
        bioUsaha: 'Kedai kopi artisan yang mengolah biji kopi lokal Jawa Barat untuk pasar anak muda.'
      }
    })

    const umkmBatik = await prisma.uMKM.create({
      data: {
        namaPemilik: 'Ibu Ratna Dewi',
        namaUsaha: 'Batik Tulis Srikandi',
        email: 'batiksrikandi@example.com',
        password: defaultHash,
        nomorWa: '081298765432',
        isWaVerified: true,
        isVerified: true,
        kategori: 'Fashion & Kerajinan',
        alamat: 'Jl. Malioboro No. 45, D.I. Yogyakarta',
        bioUsaha: 'Pengrajin batik tulis tradisional modern yang memberdayakan ibu rumah tangga sekitar.'
      }
    })

    // 6. Seed Lowongan Proyek Resmi UMKM
    await prisma.proyek.create({
      data: {
        umkmId: umkmKopi.id,
        judul: 'Desain Kemasan & Label Botol Cold Brew Kopi Karsa',
        keteranganSingkat: 'Dibutuhkan desain label modern dan estetik untuk produk baru Cold Brew 250ml siap cetak.',
        keteranganPanjang: 'Kami mencari talenta pelajar jurusan DKV atau Multimedia untuk membuat desain label botol kaca 250ml. Spesifikasi desain: minimalis, warna earth-tone, menyertakan komposisi dan logo brand. File akhir dalam format AI/PSD dan PDF siap cetak.',
        budgetMin: 500000,
        budgetMax: 1000000,
        dpPersen: 30,
        status: 'OPEN',
        tags: ['Desain Grafis', 'Branding', 'Packaging']
      }
    })

    await prisma.proyek.create({
      data: {
        umkmId: umkmBatik.id,
        judul: 'Pembuatan Website Katalog & Profil Usaha Batik Srikandi',
        keteranganSingkat: 'Website profil responsif untuk memamerkan ragam motif batik tulis dan kontak pemesanan.',
        keteranganPanjang: 'Membutuhkan website responsif sederhana yang memuat galeri motif batik tulis, filosofi motif, formulir pemesanan via WhatsApp, dan lokasi galeri fisik. Dikerjakan menggunakan Next.js / HTML modern.',
        budgetMin: 1000000,
        budgetMax: 2000000,
        dpPersen: 50,
        status: 'OPEN',
        tags: ['Web Dev', 'UI/UX', 'Landing Page']
      }
    })

    // 7. Seed Jasa Pelajar
    await prisma.jasa.create({
      data: {
        pelajarId: siswaRaffa.id,
        judul: 'Jasa Pembuatan Landing Page Responsif UMKM',
        keteranganSingkat: 'Website landing page modern, mobile friendly, dan cepat untuk memperkenalkan brand Anda.',
        keteranganPanjang: 'Saya menawarkan pembuatan landing page profil bisnis atau toko online sederhana yang cepat diakses, tampilan estetik, dan terintegrasi langsung ke WhatsApp bisnis Anda.',
        kategori: 'Web Dev',
        tags: ['Web Dev', 'Next.js', 'Landing Page'],
        hargaBasic: 350000,
        deskripsiBasic: '1 Halaman Landing Page responsif + Tombol WhatsApp',
        hargaStandard: 750000,
        deskripsiStandard: 'Hingga 3 Halaman + Desain custom + Form kontak',
        hargaPremium: 1500000,
        deskripsiPremium: 'Website lengkap 5 halaman + Optimasi SEO dasar + Revisi tanpa batas'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database berhasil di-reset dan data awal resmi telah berhasil di-seed ulang.',
      details: {
        sekolahCount: 3,
        pelajarCount: 3,
        umkmCount: 2,
        proyekCount: 2,
        jasaCount: 1
      }
    })
  } catch (error: any) {
    console.error('Error saat mereset database:', error)
    return NextResponse.json(
      { error: 'Gagal mereset database: ' + (error?.message || 'Terjadi kesalahan internal') },
      { status: 500 }
    )
  }
}
