-- =========================================================
-- MITRA MUDA - SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- Project: https://tqjgcmjgyndtkwejtuqp.supabase.co
-- =========================================================

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SchoolVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'AUTO_CORRECTED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProyekStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LamaranStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TransaksiStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'DP_DIBAYAR', 'DIKERJAKAN', 'MENUNGGU_REVIEW', 'SELESAI', 'DIBATALKAN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "UkuranBisnis" AS ENUM ('MIKRO', 'KECIL', 'MENENGAH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Sekolah" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "namaSekolah" TEXT NOT NULL,
  "npsn" TEXT UNIQUE NOT NULL,
  "emailResmi" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "namaPenanggungJawab" TEXT NOT NULL,
  "jabatanAdmin" TEXT,
  "alamatLengkap" TEXT NOT NULL,
  "kontakSekolah" TEXT NOT NULL,
  "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "officialNama" TEXT,
  "officialSekolahId" TEXT,
  "bentukPendidikan" TEXT,
  "statusSekolah" TEXT,
  "akreditasi" TEXT,
  "lastVerifiedAt" TIMESTAMP(3),
  "verificationCooldownUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Pelajar" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "namaLengkap" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "jenisKelamin" "JenisKelamin",
  "tempatLahir" TEXT,
  "tanggalLahir" TIMESTAMP(3),
  "namaIbu" TEXT,
  "fotoKartuPelajar" TEXT,
  "nis" TEXT UNIQUE,
  "kelas" TEXT,
  "sekolahId" TEXT REFERENCES "Sekolah"("id") ON DELETE SET NULL,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "catatanPenolakan" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PelajarProfile" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pelajarId" TEXT UNIQUE NOT NULL REFERENCES "Pelajar"("id") ON DELETE CASCADE,
  "displayName" TEXT,
  "fotoProfil" TEXT,
  "fotoBanner" TEXT,
  "bio" TEXT,
  "alamat" TEXT,
  "bidangKeahlian" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "githubUrl" TEXT,
  "websiteUrl" TEXT,
  "kontakWa" TEXT,
  "kontakTelegram" TEXT,
  "socialMedia" JSONB,
  "eWalletType" TEXT,
  "eWalletNomor" TEXT,
  "ratingRata" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "jumlahUlasan" INTEGER NOT NULL DEFAULT 0,
  "jumlahProyekSelesai" INTEGER NOT NULL DEFAULT 0,
  "totalPendapatan" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UMKM" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "namaPemilik" TEXT NOT NULL,
  "namaUsaha" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "nomorWa" TEXT UNIQUE NOT NULL,
  "isWaVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "npwp" TEXT,
  "nib" TEXT,
  "fotoUsaha" TEXT,
  "bannerUsaha" TEXT,
  "bioUsaha" TEXT,
  "alamat" TEXT,
  "websiteUrl" TEXT,
  "tahunBerdiri" INTEGER,
  "ukuranBisnis" "UkuranBisnis",
  "kategori" TEXT,
  "subkategori" TEXT,
  "socialMedia" JSONB,
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verifikasiType" TEXT,
  "buktiLegalitas" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Proyek" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "umkmId" TEXT NOT NULL REFERENCES "UMKM"("id") ON DELETE CASCADE,
  "judul" TEXT NOT NULL,
  "keteranganSingkat" TEXT NOT NULL,
  "keteranganPanjang" TEXT NOT NULL,
  "tema" TEXT,
  "fotoProfil" TEXT,
  "fotoBanner" TEXT,
  "ketentuan" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "budgetMin" INTEGER NOT NULL,
  "budgetMax" INTEGER NOT NULL,
  "dpPersen" INTEGER NOT NULL DEFAULT 30,
  "status" "ProyekStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jasa" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pelajarId" TEXT NOT NULL REFERENCES "Pelajar"("id") ON DELETE CASCADE,
  "judul" TEXT NOT NULL,
  "keteranganSingkat" TEXT NOT NULL,
  "keteranganPanjang" TEXT NOT NULL,
  "kategori" TEXT NOT NULL,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "foto" TEXT,
  "hargaBasic" INTEGER NOT NULL,
  "deskripsiBasic" TEXT,
  "hargaStandard" INTEGER,
  "deskripsiStandard" TEXT,
  "hargaPremium" INTEGER,
  "deskripsiPremium" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Lamaran" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "proyekId" TEXT NOT NULL REFERENCES "Proyek"("id") ON DELETE CASCADE,
  "pelajarId" TEXT NOT NULL REFERENCES "Pelajar"("id") ON DELETE CASCADE,
  "pesanMotivasi" TEXT,
  "portofolioUrl" TEXT,
  "hargaTawar" INTEGER,
  "status" "LamaranStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Transaksi" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "proyekId" TEXT UNIQUE NOT NULL REFERENCES "Proyek"("id") ON DELETE CASCADE,
  "lamaranId" TEXT UNIQUE NOT NULL REFERENCES "Lamaran"("id") ON DELETE CASCADE,
  "totalAmount" INTEGER NOT NULL,
  "dpAmount" INTEGER NOT NULL,
  "dpPaid" BOOLEAN NOT NULL DEFAULT FALSE,
  "fullPaid" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" "TransaksiStatus" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
  "submitUrl" TEXT,
  "catatanPelajar" TEXT,
  "catatanUMKM" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
