import 'dotenv/config';
import { PrismaClient, VerificationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const sekolahData = [
  {
    namaSekolah: 'SDN 01 Menteng',
    npsn: '20108017',
    emailResmi: 'sdn01menteng@jakarta.go.id',
    password: 'hashed_password_1',
    namaPenanggungJawab: 'Dra. Siti Aminah, M.Pd.',
    alamatLengkap: 'Jl. Besuki No.1, Menteng, Kec. Menteng, Kota Jakarta Pusat, DKI Jakarta 10310',
    kontakSekolah: '021-31906265',
    jabatanAdmin: 'Kepala Sekolah',
  },
  {
    namaSekolah: 'SMP Negeri 5 Bandung',
    npsn: '20254602',
    emailResmi: 'smpn5bandung@disdik.jabar.go.id',
    password: 'hashed_password_2',
    namaPenanggungJawab: 'Dr. H. Ahmad Fauzi, S.Pd., M.M.',
    alamatLengkap: 'Jl. Belitung No.1, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113',
    kontakSekolah: '022-4205367',
    jabatanAdmin: 'Wakil Kepala Sekolah',
  },
  {
    namaSekolah: 'SMA Negeri 3 Surabaya',
    npsn: '20535352',
    emailResmi: 'sman3surabaya@surabaya.go.id',
    password: 'hashed_password_3',
    namaPenanggungJawab: 'Drs. H. Budi Santoso, M.M.',
    alamatLengkap: 'Jl. Mpu Supodro No.47, Gubeng, Kec. Gubeng, Kota Surabaya, Jawa Timur 60281',
    kontakSekolah: '031-5021888',
    jabatanAdmin: 'Kepala Sekolah',
  },
  {
    namaSekolah: 'SD Islam Al-Azhar 1 Jakarta',
    npsn: '20108154',
    emailResmi: 'sdalazhar1@al-azhar.sch.id',
    password: 'hashed_password_4',
    namaPenanggungJawab: 'Hj. Ratna Dewi, S.Pd.I.',
    alamatLengkap: 'Jl. Sisingamangaraja No.1, Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta 12110',
    kontakSekolah: '021-7203145',
    jabatanAdmin: 'Kepala Sekolah',
  },
  {
    namaSekolah: 'SMP Islam Terpadu Integral',
    npsn: '20260811',
    emailResmi: 'smpintegral@yayasanintegral.sch.id',
    password: 'hashed_password_5',
    namaPenanggungJawab: 'Ustadz Muhammad Ridwan, S.Pd.',
    alamatLengkap: 'Jl. Raya Bogor Km.30, Cibinong, Kab. Bogor, Jawa Barat 16914',
    kontakSekolah: '021-87901234',
    jabatanAdmin: 'Sekretaris',
  },
];

const siswaData = [
  { namaLengkap: 'Andi Pratama', nis: '2024001', kelas: '6A', index: 0, status: VerificationStatus.VERIFIED },
  { namaLengkap: 'Siti Nurhaliza', nis: '2024002', kelas: '6A', index: 0, status: VerificationStatus.PENDING },
  { namaLengkap: 'Budi Kurniawan', nis: '2024003', kelas: '9B', index: 1, status: VerificationStatus.VERIFIED },
  { namaLengkap: 'Dewi Anggraini', nis: '2024004', kelas: '9A', index: 1, status: VerificationStatus.REJECTED, catatanPenolakan: 'Data NIS tidak sesuai' },
  { namaLengkap: 'Rizki Ramadhan', nis: '2024005', kelas: '12 IPA 1', index: 2, status: VerificationStatus.PENDING },
  { namaLengkap: 'Putri Maharani', nis: '2024006', kelas: '12 IPS 2', index: 2, status: VerificationStatus.VERIFIED },
  { namaLengkap: 'Fajar Nugroho', nis: '2024007', kelas: '5B', index: 3, status: VerificationStatus.PENDING },
  { namaLengkap: 'Aisyah Putri', nis: '2024008', kelas: '8A', index: 4, status: VerificationStatus.REJECTED, catatanPenolakan: 'Usia tidak memenuhi syarat' },
];

async function main() {
  try {
    console.log('🌱 Seeding database...');

    for (const data of sekolahData) {
      const existing = await prisma.sekolah.findUnique({ where: { npsn: data.npsn } });
      if (existing) {
        console.log(`⏭  Sekolah "${data.namaSekolah}" already exists, skipping.`);
        continue;
      }
      await prisma.sekolah.create({ data });
      console.log(`✅ Created sekolah: ${data.namaSekolah}`);
    }

    const allSekolah = await prisma.sekolah.findMany();

    for (const siswa of siswaData) {
      const existing = await prisma.siswa.findUnique({ where: { nis: siswa.nis } });
      if (existing) {
        console.log(`⏭  Siswa "${siswa.namaLengkap}" already exists, skipping.`);
        continue;
      }
      const sekolah = allSekolah[siswa.index];
      if (!sekolah) continue;
      await prisma.siswa.create({
        data: {
          namaLengkap: siswa.namaLengkap,
          nis: siswa.nis,
          kelas: siswa.kelas,
          sekolahId: sekolah.id,
          verificationStatus: siswa.status,
          catatanPenolakan: siswa.catatanPenolakan,
        },
      });
      console.log(`✅ Created siswa: ${siswa.namaLengkap} (${siswa.status})`);
    }

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
