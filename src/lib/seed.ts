import 'dotenv/config'
import { PrismaClient, VerificationStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const sekolahData = [
  {
    namaSekolah: 'SMK NEGERI 2 TASIKMALAYA',
    npsn: '20224591',
    emailResmi: 'smkn2tsm@disdik.jabar.go.id',
    namaPenanggungJawab: 'Drs. H. Ahmad Junaedi, M.Pd.',
    alamatLengkap: 'Jl. Noenoeng Tisnasaputra, Kahuripan, Kec. Tawang, Kota Tasikmalaya, Jawa Barat 46115',
    kontakSekolah: '0265-331839',
    verificationStatus: 'VERIFIED',
    officialNama: 'SMK NEGERI 2 TASIKMALAYA',
    bentukPendidikan: 'SMK',
    statusSekolah: 'NEGERI',
    akreditasi: 'A',
  },
  {
    namaSekolah: 'SMK NEGERI 1 JAKARTA',
    npsn: '20100142',
    emailResmi: 'smkn1jakarta@disdik.dki.go.id',
    namaPenanggungJawab: 'Dr. Dra. Siti Rahmah, M.Pd.',
    alamatLengkap: 'Jl. Budi Utomo No.7, Ps. Baru, Sawah Besar, Jakarta Pusat, DKI Jakarta 10710',
    kontakSekolah: '021-3841123',
    verificationStatus: 'VERIFIED',
    officialNama: 'SMK NEGERI 1 JAKARTA',
    bentukPendidikan: 'SMK',
    statusSekolah: 'NEGERI',
    akreditasi: 'A',
  },
  {
    namaSekolah: 'SMA NEGERI 3 SURABAYA',
    npsn: '20535352',
    emailResmi: 'sman3surabaya@surabaya.go.id',
    namaPenanggungJawab: 'Drs. H. Budi Santoso, M.M.',
    alamatLengkap: 'Jl. Mpu Supodro No.47, Gubeng, Kec. Gubeng, Kota Surabaya, Jawa Timur 60281',
    kontakSekolah: '031-5021888',
    verificationStatus: 'VERIFIED',
    officialNama: 'SMA NEGERI 3 SURABAYA',
    bentukPendidikan: 'SMA',
    statusSekolah: 'NEGERI',
    akreditasi: 'A',
  },
]

const siswaData = [
  { namaLengkap: 'Raffa Maulana', email: 'raffa@example.com', nis: '2024001', kelas: 'XII RPL 1', index: 0, status: VerificationStatus.VERIFIED },
  { namaLengkap: 'Siti Nurhaliza', email: 'siti@example.com', nis: '2024002', kelas: 'XII MM 2', index: 0, status: VerificationStatus.PENDING },
  { namaLengkap: 'Budi Kurniawan', email: 'budi@example.com', nis: '2024003', kelas: 'XI RPL 2', index: 1, status: VerificationStatus.VERIFIED },
  { namaLengkap: 'Dewi Anggraini', email: 'dewi@example.com', nis: '2024004', kelas: 'XI DKV 1', index: 1, status: VerificationStatus.REJECTED, catatanPenolakan: 'Data NIS tidak sesuai' },
  { namaLengkap: 'Rizky Ramadhan', email: 'rizky@example.com', nis: '2024005', kelas: 'XII IPA 1', index: 2, status: VerificationStatus.PENDING },
  { namaLengkap: 'Putri Maharani', email: 'putri@example.com', nis: '2024006', kelas: 'XII IPS 2', index: 2, status: VerificationStatus.VERIFIED },
]

async function main() {
  try {
    const defaultHash = await bcrypt.hash('password123', 10)

    for (const data of sekolahData) {
      const existing = await prisma.sekolah.findUnique({ where: { npsn: data.npsn } })
      if (existing) continue
      await prisma.sekolah.create({
        data: {
          ...data,
          password: defaultHash,
        },
      })
    }

    const allSekolah = await prisma.sekolah.findMany()

    for (const siswa of siswaData) {
      const existing = await prisma.pelajar.findUnique({ where: { email: siswa.email } })
      if (existing) continue
      const sekolah = allSekolah[siswa.index]
      if (!sekolah) continue
      await prisma.pelajar.create({
        data: {
          namaLengkap: siswa.namaLengkap,
          email: siswa.email,
          password: defaultHash,
          nis: siswa.nis,
          kelas: siswa.kelas,
          sekolahId: sekolah.id,
          verificationStatus: siswa.status,
          catatanPenolakan: siswa.catatanPenolakan,
          profil: {
            create: {
              displayName: siswa.namaLengkap.split(' ')[0],
              bio: 'Talenta pelajar siap berkarya dan membantu UMKM Indonesia berkembang.',
              bidangKeahlian: ['Web Development', 'UI/UX Design'],
              skills: ['React', 'Tailwind CSS', 'Figma'],
              ratingRata: 4.9,
              jumlahProyekSelesai: 5,
              totalPendapatan: 2500000,
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
