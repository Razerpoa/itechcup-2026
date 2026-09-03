# Contributing to Mitra Muda (itechcup-2026)

Panduan kontribusi resmi untuk pengembangan dan pemeliharaan platform **Mitra Muda — Pemberdayaan Talenta Pelajar Indonesia**.

---

## Quick Start

```bash
# 1. Clone repositori & checkout branch pengerjaan
git clone https://github.com/Razerpoa/itechcup-2026.git
cd itechcup-2026
git checkout kpn

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
cp .env.example .env
# Sesuaikan DATABASE_URL, RESEND_API_KEY, GEMINI_API_KEY, dan Google OAuth di .env

# 4. Sinkronisasi Database Prisma (PostgreSQL)
npm run db:push

# 5. Jalankan Local Development Server
npm run dev # http://localhost:3000
```

---

## Struktur Direktori Terkini

```
src/
├── app/
│   ├── (auth)/                   # Alur Autentikasi
│   │   ├── login/page.tsx        # Login terpadu (Manual + Google OAuth + Modal Lupa Password)
│   │   └── register/
│   │       ├── pelajar/page.tsx  # Registrasi Pelajar + Layar Verifikasi Email
│   │       ├── umkm/page.tsx     # Registrasi UMKM & Verifikasi Bukti Legalitas
│   │       └── sekolah/page.tsx  # Registrasi Sekolah & Lookup NPSN Kemendikdasmen
│   ├── (dashboard)/              # Multi-Role Dashboard Shell
│   │   ├── pelajar/              # Dashboard Pelajar, Dompet Digital, Jasa, & Akad Transaksi
│   │   │   ├── dompet/page.tsx   # Dompet Digital, Tarik Saldo E-Wallet, & Riwayat Mutasi
│   │   │   ├── jasa/buat/page.tsx # Form Listing Jasa Siswa (Basic/Standard/Premium)
│   │   │   └── transaksi/[id]/page.tsx # Ruang Akad Proyek Siswa & Pengunggah Berkas Perangkat
│   │   ├── sekolah/              # Dashboard Sekolah, Verifikasi Siswa, & Laporan Kinerja
│   │   │   ├── page.tsx          # Verifikasi Siswa Cepat via ID Registrasi & Approval List
│   │   │   └── laporan/page.tsx  # Laporan Kinerja & Analitik Keterlibatan Industri Siswa
│   │   └── umkm/                 # Dashboard UMKM, Deposit Modal, & Buat Lowongan Proyek
│   │       ├── page.tsx          # Dashboard UMKM & Kontrol Status Proyek Berjalan
│   │       ├── deposit/page.tsx  # Deposit Saldo Rekber Escrow & Bukti Transfer
│   │       ├── proyek/buat/page.tsx # Form Pembuatan Lowongan Proyek UMKM
│   │       └── transaksi/[id]/page.tsx # Ruang Akad UMKM, Review Karya, & Approval Selesai
│   ├── (marketing)/
│   │   └── page.tsx              # Landing Page & Role Onboarding Selection
│   ├── auth/
│   │   └── callback/page.tsx     # Callback Handler (Verifikasi Email Signup & Reset Password Form)
│   ├── marketplace/              # Marketplace Feed Proyek UMKM & Katalog Jasa Pelajar
│   ├── profil/[id]/              # Halaman Portofolio Publik & Rating Siswa
│   ├── syarat-ketentuan/         # Halaman Syarat & Ketentuan Layanan (HAKI & 0% Komisi)
│   ├── kebijakan-privasi/        # Halaman Kepatuhan UU PDP No. 27/2022
│   ├── perlindungan-pelajar/     # Pedoman Perlindungan Jam Wajib Belajar & Anti-Eksploitasi
│   ├── tuan/                     # Portal Admin (Warm Editorial Design)
│   │   ├── login/page.tsx        # Login Admin Terproteksi Rate Limiter
│   │   └── page.tsx              # Dashboard Admin Verifikasi (Pelajar, UMKM, Sekolah, Deposit, Penarikan, Escrow)
│   ├── api/                      # RESTful Backend API Endpoints
│   │   ├── admin/
│   │   │   └── reset-db/route.ts # Endpoint Reset & Re-Seed Database Aman
│   │   ├── ai/
│   │   │   └── assistant/route.ts # Google Gemini AI Chat Assistant Endpoint (1.5-Flash & 2.0-Flash)
│   │   ├── auth/                 # login, admin-login, google-check, reset-password (POST & PUT)
│   │   ├── chat/                 # Real-time Chat Sync Endpoint
│   │   ├── pelajar/              # CRUD Pelajar & Sanitized Select
│   │   ├── umkm/                 # CRUD UMKM & Verifikasi Legalitas
│   │   ├── sekolah/              # CRUD Sekolah & Integrasi Kemendikdasmen
│   │   ├── siswa/                # Endpoints Verifikasi Siswa oleh Sekolah
│   │   ├── proyek/               # Posting & Pengelolaan Lowongan Proyek
│   │   ├── jasa/                 # Listing Jasa Keahlian Siswa
│   │   ├── deposit/              # Manajemen Deposit UMKM & Sinkronisasi Penarikan Siswa
│   │   │   └── [id]/route.ts     # Aksi Approval/Rejection Deposit & Penarikan
│   │   ├── lamaran/              # Pengajuan Proposal Siswa
│   │   └── transaksi/            # Akad Transaksi, Multi-Device Sync & Escrow Vault
│   ├── globals.css               # Tailwind CSS v4 Theme Tokens (CSS-First)
│   └── layout.tsx                # Root Layout (Plus Jakarta Sans)
├── components/
│   ├── ui/                       # Atom Components: button, input, card, badge, modal, strength meter
│   ├── layout/                   # Navbar, Sidebar, Footer
│   ├── marketplace/              # ProyekCard, JasaCard
│   ├── ai-assistant.tsx          # Widget Terpadu AI Chatbot (Google Gemini) & CS WhatsApp
│   ├── invoice-modal.tsx         # Generator Cetak Kwitansi Resmi & Surat Pengalaman Kerja
│   └── two-factor-modal.tsx      # Modal 2FA Security
├── lib/
│   ├── prisma.ts                 # Prisma ORM v7 Client Singleton
│   ├── mail.ts                   # Resend Email Dispatcher (Confirmation & Password Reset)
│   ├── supabase.ts               # Supabase Client Singleton
│   ├── auth-server.ts            # Cookie & JWT Session Helper
│   ├── auth-client.ts            # LocalStorage Session Synchronizer
│   ├── kemendikdasmen.ts         # Integrasi API NPSN Kementerian
│   ├── rate-limiter.ts           # In-Memory & IP Rate Limiter
│   ├── validate-npsn.ts          # Validator Format 8-Digit NPSN
│   ├── normalize-school-name.ts  # Normalisasi Nama & Singkatan Sekolah
│   ├── compare-school-names.ts   # Algoritma Pencocokan Nama Sekolah (EXACT / MINOR / CRITICAL)
│   ├── admin-verification-store.ts # State & Sync Store Verifikasi Admin (Pure Authentic Documents)
│   ├── akad-store.ts             # State & Sync Store Ruang Akad Transaksi Multi-Device
│   └── escrow-store.ts           # State & Sync Store Transaksi Escrow, Deposit & Penarikan
├── public/
│   ├── images/
│   │   └── wallets/              # Logo Resmi E-Wallet (GoPay, DANA, OVO, ShopeePay)
│   ├── favicon.ico
│   ├── logo.jpg
│   └── logo.png
└── types/
    └── index.ts                  # TypeScript Shared Type Definitions
```

---

## Modul & Fitur yang Telah Dikerjakan

### 1. Sistem Pengunggahan Berkas Karya Siswa Langsung dari Perangkat (Direct Device File Picker)
- **Lokasi:** `src/app/(dashboard)/pelajar/transaksi/[id]/page.tsx`
- **Fitur:**
  - Siswa dapat mengunggah berkas penyerahan karya langsung dari perangkat dengan 2 mode tombol pilihan:
    1. **Foto dari Galeri / Kamera** (`accept="image/*"`): Untuk karya berbasis gambar atau desain grafis.
    2. **Berkas dari Folder (ZIP/PDF)** (`accept="*/*"`): Untuk karya dokumen, arsip proyek, source code, atau berkas zip tanpa batasan format.
  - Kartu pratinjau instan dengan ikon format, nama file, estimasi ukuran asli (KB/MB), dan indikator kesiapan unggah.
  - Opsi tautan eksternal (Google Drive / Figma / GitHub) tetap tersedia bagi proyek skala besar.
  - Saat berkas dikirim, status akad otomatis beralih ke tahap 3 (*Karya Diserahkan & Sedang Ditinjau UMKM*) dan notifikasi obrolan langsung terkirim ke pihak UMKM.

### 2. Kontrol Status Proyek Mandiri & Terpadu (UMKM & Admin Panel)
- **Lokasi:**
  - UMKM Dashboard: `src/app/(dashboard)/umkm/page.tsx`
  - UMKM Ruang Transaksi: `src/app/(dashboard)/umkm/transaksi/[id]/page.tsx`
  - Master Admin: `src/app/tuan/page.tsx`
- **Fitur:**
  - **UMKM Dashboard:** Tombol pill status interaktif (*Pengerjaan*, *Review UMKM*, *Selesai*) langsung pada kartu transaksi aktif untuk memudahkan penyesuaian status pengerjaan.
  - **UMKM Ruang Transaksi:** Tombol *Minta Revisi Karya* dan *Proyek Telah Selesai* dengan modal ulasan rating bintang yang langsung menyinkronkan status ke backend.
  - **Master Admin (`/tuan`):** Tabel kontrol transaksi proyek pada tab *Escrow Vault* dilengkapi dua tombol moderasi langsung:
    1. **Minta Revisi**: Mengembalikan status ke tahap 2 (*Dalam Pengerjaan / Revisi*) dan mencatat instruksi admin.
    2. **Done & Cairkan**: Menyelesaikan transaksi ke tahap 4 (*Selesai & Lunas*), mencairkan dana escrow penuh secara otomatis ke dompet siswa, dan menandai `fullPaid: true`.

### 3. Perhitungan Saldo Dompet Siswa yang Presisi & Idempotent
- **Lokasi:** `src/lib/escrow-store.ts`, `src/lib/akad-store.ts`, `src/app/(dashboard)/pelajar/dompet/page.tsx`, `src/app/(dashboard)/pelajar/page.tsx`
- **Fitur:**
  - **Pencairan Idempotent:** Fungsi `releaseProjectCompletionToPelajar` dijamin hanya dieksekusi 1 kali per nomor proyek, mencegah penggandaan saldo saat background polling berjalan berulang kali.
  - **Kalkulasi Saldo Akurat:** Saldo siap cair dihitung presisi berdasarkan formula:
    `Saldo Siap Cair = Total Nilai Riil Proyek Selesai - Total Penarikan yang Diproses`
  - Tampilan saldo di dashboard siswa dan halaman dompet selalu sinkron dan sesuai dengan nilai kontrak proyek yang telah diselesaikan.

### 4. Integrasi Logo Resmi Kanal Pembayaran E-Wallet
- **Lokasi:** `src/app/(dashboard)/pelajar/dompet/page.tsx`, `public/images/wallets/`
- **Fitur:**
  - Pemasangan logo resmi untuk 4 kanal pembayaran e-wallet:
    1. **GoPay** (`/images/wallets/gopay.png`)
    2. **DANA** (`/images/wallets/dana.png`)
    3. **OVO** (`/images/wallets/ovo.png`)
    4. **ShopeePay** (`/images/wallets/shopeepay.png`)
  - Kartu pemilih e-wallet modern dengan wadah logo putih bersih, label institusi, dan preset nominal penarikan cepat (Rp 100.000, Rp 250.000, Rp 500.000, Rp 1.000.000).

### 5. Sinkronisasi Dua Arah Real-Time Penarikan Dana Siswa (Bidirectional Sync)
- **Lokasi:** `src/app/api/deposit/route.ts`, `src/lib/escrow-store.ts`, `src/app/tuan/page.tsx`
- **Fitur:**
  - Setiap pengajuan penarikan dana baru oleh siswa dikirim ke backend melalui endpoint `POST /api/deposit` dengan tipe `WITHDRAWAL` dan `SYNC`.
  - Backend menggabungkan data penarikan dari seluruh client ke global store dengan perlindungan duplikasi ID.
  - Panel Admin (`/tuan`) melakukan sinkronisasi otomatis setiap 2 detik. Semua pengajuan penarikan baru langsung muncul di tab *Penarikan Siswa* dengan status *Menunggu* (Pending).
  - Saat Admin menekan tombol *Setujui* atau *Tolak*, perubahan status langsung disebarkan ke database dan perangkat siswa secara real-time.

### 6. Responsivitas Mobile & Dynamic Viewport Height
- **Lokasi:** Seluruh halaman dashboard dan ruang transaksi di `src/app/(dashboard)/*`
- **Fitur:**
  - Menggantikan tinggi statis dengan CSS Dynamic Viewport: `h-[calc(100dvh-5rem)] min-h-[580px] max-h-[900px]`.
  - Memastikan seluruh tombol aksi di bagian bawah ruang transaksi (seperti tombol chat, kirim berkas, minta revisi, dan selesai) tidak terpotong atau tertutup keyboard virtual pada perangkat smartphone.

### 7. Integrasi AI Assistant (Google Gemini Multi-Tier Waterfall)
- **Lokasi:** `src/app/api/ai/assistant/route.ts`, `src/components/ai-assistant.tsx`
- **Hirarki Model:**
  1. `gemini-3.1-flash-lite`: Tier awal, paling ringan dan hemat kuota token.
  2. `gemini-3.5-flash`: Tier kedua, dipanggil otomatis jika model lite mencapai batas rate limit.
  3. `gemini-3.6-flash`: Tier ketiga, dipanggil jika model sebelumnya penuh/habis.
  4. `gemini-3.7-flash`: Tier teratas, benteng terakhir sebelum kuota habis.
- **Penanganan Kuota Penuh:** Mengembalikan status HTTP 429 dengan notifikasi resmi dan tombol fallback langsung ke Customer Service WhatsApp.
- **Output Redactor Engine:** Respon AI disaring secara otomatis via regex untuk menyensor string krendensial seperti API key (`AIzaSy...`) atau JWT (`eyJ...`) menjadi `[KREDENSIAL DILINDUNGI]`.
- **Anti-Jailbreak Shield:** Memblokir upaya injeksi prompt seperti *system prompt*, *ignore instructions*, atau *developer mode*.

### 8. Sistem Notifikasi & Verifikasi Email (Resend)
- **Lokasi:** `src/lib/mail.ts`, `src/app/api/auth/*`
- **Sender Identity:** `Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>`
- **Alur Pendaftaran:** Mengirimkan email konfirmasi berdesain resmi dengan layar panduan di browser.
- **Alur Pemulihan Password:** Token reset password divalidasi di server PostgreSQL dengan enkripsi `bcryptjs` 10 salt rounds.

### 9. Dokumen Digital Resmi & Surat Pengalaman Kerja
- **Lokasi:** `src/components/invoice-modal.tsx`
- **Kwitansi / Faktur Kas UMKM:** Format `INV-MM-[ID]-[TAHUN]` dengan rincian biaya proyek, status DP, pelunasan, 0% komisi siswa, dan QR Code keabsahan.
- **Surat Keterangan Pengalaman Kerja Industri:** Format `CERT-MM-[ID]-VOKASI` sebagai bukti portofolio kerja nyata untuk lampiran magang/kerja siswa kejuruan.
- **Dukungan Cetak A4:** Utility `@media print` murni untuk pratinjau cetak bersih tanpa navbar atau tombol modal.

### 10. Kepatuhan Regulasi & Perlindungan Pelajar
- **Kepatuhan UU PDP No. 27/2022 (`/kebijakan-privasi`):** Perlindungan data pribadi pelajar di bawah umur.
- **Pedoman Perlindungan Jam Belajar (`/perlindungan-pelajar`):** Menjamin pengerjaan proyek tidak mengganggu jam wajib sekolah, larangan kerja paksa, dan hotline pengaduan: `lapor@mitramuda.biz.id`.
- **Syarat & Ketentuan Layanan (`/syarat-ketentuan`):** Penegasan pengalihan HAKI sah setelah pelunasan dan 0% biaya platform bagi pelajar.

### 10. Arsitektur Komunikasi & Serah Terima Langsung ke Database PostgreSQL (Zero LocalStorage Dependency)
- **Lokasi:** `src/lib/akad-store.ts`, `src/app/api/chat/route.ts`, `src/app/api/transaksi/route.ts`, `prisma/schema.prisma`
- **Fitur:**
  - Seluruh riwayat obrolan ruang transaksi disimpan langsung ke tabel PostgreSQL `ChatMessage` melalui Prisma ORM v7.
  - Berkas serah terima karya siswa (*deliverables*) disimpan langsung ke tabel PostgreSQL `DeliverableWork`.
  - Mengeliminasi ketergantungan pada `localStorage` peramban untuk membaca atau menyimpan obrolan dan transaksi, menjamin data tidak akan pernah hilang atau terhapus (*mental*).
  - Dilengkapi kompresi gambar otomatis sisi klien (`compressImageFile`) untuk performa tinggi dan bandwidth hemat.

---

## Standar Keamanan Data & Server (Security SSS-Tier)

1. **Zero Credential Exposure:** Kunci API disimpan di server environment (`process.env`) dan disaring pada seluruh output.
2. **Zero Password Exposure:** Field password tidak pernah disertakan dalam payload response API.
3. **Enterprise HTTP Security Headers (`next.config.ts`):**
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` (blokir kamera/mikrofon tanpa izin)
   - `Cache-Control: no-store, max-age=0` pada seluruh `/api/*`
4. **Rate Limiting Berlapis:**
   - Login admin: 5 percobaan / 10 menit dengan lockout otomatis.
   - Asisten AI: 12 request / menit per IP address.

---

## Design System: Collaborative Vitality

- **Warna Utama:** Pastel Orange (`#FF9B71`)
- **Aksen Gelap & Kontras:** Terracotta (`#964825`), Charcoal (`#2D2319`)
- **Latar Belakang:** Warm Off-White (`#FAFAFA`) & Warm Sand (`#F6F3EE`)
- **Tipografi:** Plus Jakarta Sans
- **Pill & Badge Radius:** `rounded-full` / `rounded-xl`
- **Card & Container Radius:** `rounded-2xl` / `rounded-3xl`

---

## Pengujian & Testing

```bash
# Jalankan seluruh unit test suite
npm run dev

# Jalankan pengujian spesifik
npx tsx --test src/lib/kemendikdasmen.test.ts
npx tsx --test src/lib/validate-npsn.test.ts
npx tsx --test src/lib/compare-school-names.test.ts
```

### Cakupan Pengujian:
- Integrasi pipeline pendaftaran & Kemendikdasmen.
- Pencocokan akurasi nama sekolah (EXACT / MINOR / CRITICAL).
- Endpoint lookup NPSN & fallback review manual.
- Normalisasi akronim (`SMKN` -> `SMK NEGERI`).
- Rate limit memory tracking & sliding window.
- Validasi format 8-digit NPSN.

---

## Checklist Sebelum Push / Deployment

1. **Verifikasi Build:**
   ```bash
   npm run build
   ```
   *Wajib 0 error TypeScript dan 0 error kompilasi.*
2. **Konvensi Commit:**
   - `feat:` Fitur baru
   - `fix:` Perbaikan bug
   - `style:` Pembaruan UI/CSS & design system
   - `security:` Peningkatan keamanan & sanitasi data
   - `docs:` Dokumentasi & referensi
3. **Sinkronisasi Branch:**
   ```bash
   git push origin main
   git push origin kpn
   ```

---

## Tim Pengembang & Kontak

| Nama | Peran | GitHub |
| :--- | :--- | :--- |
| **Raffa Rizqi Ramdani** | Project Lead & Full Stack Developer | [@RaffaRizqi](https://github.com/RaffaRizqi) / [@Razerpoa](https://github.com/Razerpoa) |
| **Faaiz Hamdy** | Frontend Developer & UI/UX Designer | [@Faaizhamdhy](https://github.com/Faaizhamdhy) |
| **Fathan Assidqi Dwipayana** | Backend Developer | [@Razerpoa](https://github.com/Razerpoa) |

- **Inisiator & Lead Developer:** Raffa (`raffaxzee@gmail.com`)
- **WhatsApp:** 0895622494773
- **Dokumentasi Lengkap:** Lihat `DOKUMENTASI.md`
