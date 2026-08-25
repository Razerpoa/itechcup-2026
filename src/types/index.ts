export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export type UserRole = 'PELAJAR' | 'UMKM' | 'SEKOLAH'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type SchoolVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'AUTO_CORRECTED'
  | 'REJECTED'
  | 'NAME_MISMATCH'

export type ProyekStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type LamaranStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export type TransaksiStatus =
  | 'MENUNGGU_PEMBAYARAN'
  | 'DP_DIBAYAR'
  | 'DIKERJAKAN'
  | 'MENUNGGU_REVIEW'
  | 'SELESAI'
  | 'DIBATALKAN'

export type PaketHarga = 'BASIC' | 'STANDARD' | 'PREMIUM'

export interface KemendikdasmenSchool {
  provinsi: string
  akreditasi: string
  alamat_jalan: string
  kabupaten: string
  nama_dusun: string
  kode_pos: string
  npsn: string
  nama: string
  bentuk_pendidikan: string
  sekolah_id: string
  rt: number
  rw: number
  kecamatan: string
  status_sekolah: string
  path_file: string
}

export interface KemendikdasmenResponse {
  status_code: number
  message: string
  total: number
  data: KemendikdasmenSchool[]
}

export interface NormalizedNameResult {
  normalized: string
  error?: string
  errorCode?: string
}

export interface NameComparisonResult {
  match: 'EXACT' | 'MINOR' | 'CRITICAL'
}

export interface ProyekCard {
  id: string
  judul: string
  keteranganSingkat: string
  budget: number
  dpAmount: number
  tags: string[]
  namaUsaha: string
  fotoUsaha?: string
  createdAt: string
  jumlahPelamar: number
}

export interface JasaCard {
  id: string
  judul: string
  keteranganSingkat: string
  namaPelajar: string
  fotoProfil?: string
  ratingRata: number
  jumlahUlasan: number
  hargaBasic: number
  tags: string[]
  jumlahProyekSelesai: number
}

export interface PelajarProfile {
  id: string
  namaLengkap: string
  displayName?: string
  fotoProfil?: string
  fotoBanner?: string
  bio?: string
  namaSekolah?: string
  bidangKeahlian: string[]
  skills: string[]
  ratingRata: number
  jumlahProyekSelesai: number
  githubUrl?: string
  websiteUrl?: string
  kontakWa?: string
  kontakTelegram?: string
}

export interface UMKMProfile {
  id: string
  namaUsaha: string
  fotoUsaha?: string
  bannerUsaha?: string
  bioUsaha?: string
  kategori: string
  subkategori?: string
  alamat?: string
  websiteUrl?: string
  tahunBerdiri?: number
  ukuranBisnis?: string
}
