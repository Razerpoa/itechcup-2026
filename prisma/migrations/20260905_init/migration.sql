-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProyekStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LamaranStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TransaksiStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'DP_DIBAYAR', 'DIKERJAKAN', 'MENUNGGU_REVIEW', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "UkuranBisnis" AS ENUM ('MIKRO', 'KECIL', 'MENENGAH');

-- CreateTable
CREATE TABLE "Sekolah" (
    "id" TEXT NOT NULL,
    "namaSekolah" TEXT NOT NULL,
    "npsn" TEXT NOT NULL,
    "emailResmi" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelajar" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin",
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "namaIbu" TEXT,
    "fotoKartuPelajar" TEXT,
    "nis" TEXT,
    "kelas" TEXT,
    "sekolahId" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "catatanPenolakan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelajar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelajarProfile" (
    "id" TEXT NOT NULL,
    "pelajarId" TEXT NOT NULL,
    "displayName" TEXT,
    "fotoProfil" TEXT,
    "fotoBanner" TEXT,
    "bio" TEXT,
    "alamat" TEXT,
    "bidangKeahlian" TEXT[],
    "skills" TEXT[],
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PelajarProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKM" (
    "id" TEXT NOT NULL,
    "namaPemilik" TEXT NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nomorWa" TEXT NOT NULL,
    "isWaVerified" BOOLEAN NOT NULL DEFAULT false,
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
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifikasiType" TEXT,
    "buktiLegalitas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyek" (
    "id" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "keteranganSingkat" TEXT NOT NULL,
    "keteranganPanjang" TEXT NOT NULL,
    "tema" TEXT,
    "fotoProfil" TEXT,
    "fotoBanner" TEXT,
    "ketentuan" TEXT,
    "tags" TEXT[],
    "budgetMin" INTEGER NOT NULL,
    "budgetMax" INTEGER NOT NULL,
    "dpPersen" INTEGER NOT NULL DEFAULT 30,
    "status" "ProyekStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jasa" (
    "id" TEXT NOT NULL,
    "pelajarId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "keteranganSingkat" TEXT NOT NULL,
    "keteranganPanjang" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tags" TEXT[],
    "foto" TEXT,
    "hargaBasic" INTEGER NOT NULL,
    "deskripsiBasic" TEXT,
    "hargaStandard" INTEGER,
    "deskripsiStandard" TEXT,
    "hargaPremium" INTEGER,
    "deskripsiPremium" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jasa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lamaran" (
    "id" TEXT NOT NULL,
    "proyekId" TEXT NOT NULL,
    "pelajarId" TEXT NOT NULL,
    "pesanMotivasi" TEXT,
    "portofolioUrl" TEXT,
    "hargaTawar" INTEGER,
    "status" "LamaranStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lamaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "proyekId" TEXT NOT NULL,
    "lamaranId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "dpAmount" INTEGER NOT NULL,
    "dpPaid" BOOLEAN NOT NULL DEFAULT false,
    "fullPaid" BOOLEAN NOT NULL DEFAULT false,
    "status" "TransaksiStatus" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "submitUrl" TEXT,
    "catatanPelajar" TEXT,
    "catatanUMKM" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "proyekId" TEXT NOT NULL,
    "judulProyek" TEXT,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientName" TEXT,
    "namaUsaha" TEXT,
    "text" TEXT NOT NULL,
    "attachment" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverableWork" (
    "id" TEXT NOT NULL,
    "proyekId" TEXT NOT NULL,
    "transaksiId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "fileUrl" TEXT,
    "filePreview" TEXT,
    "fileType" TEXT,
    "catatan" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliverableWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "namaPemilik" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'qris',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrisUrl" TEXT,
    "qrisString" TEXT,
    "pakasirPaymentUrl" TEXT,
    "bankTujuan" TEXT,
    "nomorPengirim" TEXT,
    "buktiTransferUrl" TEXT,
    "catatanAdmin" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalTransaction" (
    "id" TEXT NOT NULL,
    "pelajarId" TEXT NOT NULL,
    "namaPelajar" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "eWalletType" TEXT NOT NULL,
    "eWalletNomor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sekolah_npsn_key" ON "Sekolah"("npsn");
CREATE UNIQUE INDEX "Sekolah_emailResmi_key" ON "Sekolah"("emailResmi");
CREATE UNIQUE INDEX "Pelajar_email_key" ON "Pelajar"("email");
CREATE UNIQUE INDEX "Pelajar_nis_key" ON "Pelajar"("nis");
CREATE UNIQUE INDEX "PelajarProfile_pelajarId_key" ON "PelajarProfile"("pelajarId");
CREATE UNIQUE INDEX "UMKM_email_key" ON "UMKM"("email");
CREATE UNIQUE INDEX "UMKM_nomorWa_key" ON "UMKM"("nomorWa");
CREATE UNIQUE INDEX "Lamaran_proyekId_pelajarId_key" ON "Lamaran"("proyekId", "pelajarId");
CREATE UNIQUE INDEX "Transaksi_proyekId_key" ON "Transaksi"("proyekId");
CREATE UNIQUE INDEX "Transaksi_lamaranId_key" ON "Transaksi"("lamaranId");
CREATE INDEX "ChatMessage_proyekId_idx" ON "ChatMessage"("proyekId");
CREATE INDEX "DeliverableWork_proyekId_idx" ON "DeliverableWork"("proyekId");
CREATE UNIQUE INDEX "DepositTransaction_orderId_key" ON "DepositTransaction"("orderId");
CREATE INDEX "DepositTransaction_umkmId_idx" ON "DepositTransaction"("umkmId");
CREATE INDEX "DepositTransaction_orderId_idx" ON "DepositTransaction"("orderId");
CREATE INDEX "WithdrawalTransaction_pelajarId_idx" ON "WithdrawalTransaction"("pelajarId");

-- AddForeignKey
ALTER TABLE "Pelajar" ADD CONSTRAINT "Pelajar_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PelajarProfile" ADD CONSTRAINT "PelajarProfile_pelajarId_fkey" FOREIGN KEY ("pelajarId") REFERENCES "Pelajar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proyek" ADD CONSTRAINT "Proyek_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Jasa" ADD CONSTRAINT "Jasa_pelajarId_fkey" FOREIGN KEY ("pelajarId") REFERENCES "Pelajar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_proyekId_fkey" FOREIGN KEY ("proyekId") REFERENCES "Proyek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_pelajarId_fkey" FOREIGN KEY ("pelajarId") REFERENCES "Pelajar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_proyekId_fkey" FOREIGN KEY ("proyekId") REFERENCES "Proyek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_lamaranId_fkey" FOREIGN KEY ("lamaranId") REFERENCES "Lamaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
