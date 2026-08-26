# Mitra Muda — Platform Pemberdayaan Talenta Pelajar Indonesia

<p align="center">
  <img src="./public/icon.png" alt="Mitra Muda Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>Menghubungkan Talenta Pelajar Berbakat dengan UMKM Indonesia</b><br>
  Solusi marketplace jasa karya siswa, akad proyek dengan Rekening Bersama (Escrow), dan pencairan saldo e-wallet tanpa syarat KTP atau rekening bank.
</p>

<p align="center">
  <a href="https://www.mitramuda.biz.id">
    <img src="https://img.shields.io/badge/Production-mitramuda.biz.id-FF9B71?style=for-the-badge&logo=vercel" alt="Production Website" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma-v7.9.1-2D3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Tests-44%20Passing-success?style=for-the-badge" alt="44 Tests Passing" />
  <img src="https://img.shields.io/badge/Security-SSS--Tier-964825?style=for-the-badge" alt="SSS-Tier Security" />
</p>

---

## 📋 Daftar Isi

1. [Tentang Platform](#-tentang-platform)
2. [Fitur Unggulan Utama](#-fitur-unggulan-utama)
3. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
4. [Struktur Direktori Lengkap](#-struktur-direktori-lengkap)
5. [Alur & Peran Pengguna (Multi-Role Ecosystem)](#-alur--peran-pengguna-multi-role-ecosystem)
6. [Sistem Transaksi Escrow (Rekening Bersama)](#-sistem-transaksi-escrow-rekening-bersama)
7. [Asisten Virtual AI (Google Gemini Multi-Tier)](#-asisten-virtual-ai-google-gemini-multi-tier)
8. [Benteng Keamanan Tingkat SSS](#-benteng-keamanan-tingkat-sss)
9. [Sistem Notifikasi Email (Resend SMTP)](#-sistem-notifikasi-email-resend-smtp)
10. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
11. [Daftar Endpoint API](#-daftar-endpoint-api)
12. [Pengujian Unit (Unit Testing)](#-pengujian-unit-unit-testing)
13. [Desain Antarmuka (Collaborative Vitality)](#-desain-antarmuka-collaborative-vitality)
14. [Tim & Kontak Layanan](#-tim--kontak-layanan)

---

## 🌟 Tentang Platform

Banyak pelajar tingkat SMK/SMA di Indonesia memiliki keahlian digital luar biasa—mulai dari desain grafis, pembuatan situs web, video editing, hingga penulisan konten. Namun, mayoritas terbentur kendala finansial dan legalitas: **belum memiliki KTP** dan **tidak memiliki rekening bank formal** untuk menerima pembayaran hasil kerja.

Di sisi lain, jutaan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) sangat membutuhkan transformasi digital hemat biaya dengan tenaga muda yang adaptif dan terjangkau.

**Mitra Muda** hadir memutus hambatan ini:
- 🎓 **Pelajar:** Membangun portofolio profesional sejak bangku sekolah, mengerjakan proyek berbayar, dan menarik honor langsung ke **e-wallet (GoPay, OVO, DANA)** tanpa perlu KTP atau bank.
- 🏪 **UMKM:** Merekrut talenta pelajar terverifikasi dengan jaminan transaksi aman berkat sistem **DP Escrow (Rekening Bersama)**.
- 🏫 **Sekolah:** Mendaftarkan institusi dengan **NPSN resmi**, memverifikasi status siswa, serta memantau analitik capaian kinerja dan pendapatan siswa secara berkala.
- 👑 **Admin (Tuan):** Portal super-admin untuk memverifikasi dokumen legalitas usaha, sekolah, dan menjaga kelancaran arbitrase transaksi escrow.

---

## 🚀 Fitur Unggulan Utama

| Modul | Fitur Kunci |
|---|---|
| **Marketplace Terpadu** | Feed lowongan proyek UMKM dan etalase penawaran jasa pelajar (paket *Basic*, *Standard*, *Premium*). |
| **Ruang Akad & Escrow** | Kesepakatan kontrak digital, penyetoran DP aman, penyerahan berkas hasil proyek, hingga rilis pembayaran otomatis. |
| **Verifikasi Sekolah Otomatis** | Validasi NPSN 8-digit terhubung langsung ke basis data resmi **Kemendikdasmen RI** dengan algoritma normalisasi nama sekolah (`EXACT`, `MINOR`, `CRITICAL`). |
| **Pencairan Saldo Fleksibel** | Penarikan dana dompet pelajar langsung ke berbagai platform e-wallet terpopuler di Indonesia. |
| **Asisten AI Pintar** | Chatbot asisten interaktif ditenagai **Google Gemini Flash Multi-Tier** yang responsif dan siap membantu pengguna 24/7. |
| **Sistem Email Transaksional** | Verifikasi email pendaftaran dan pemulihan kata sandi instan menggunakan domain resmi `@mitramuda.raffzdigital.biz.id`. |
| **Portal Super Admin (Tuan)** | Dashboard eksklusif untuk audit kartu pelajar asli, izin usaha UMKM, dan moderasi sengketa transaksi. |

---

## 🛠️ Arsitektur & Tech Stack

```mermaid
graph TD
    Client[Pengguna Browser / Mobile] --> CloudflareDNS[Domain DNS / CDN]
    CloudflareDNS --> VercelServer[Next.js 16 App Router on Vercel]
    VercelServer --> PostgreSQL[(PostgreSQL Database via Prisma v7)]
    VercelServer --> SupabaseAuth[Supabase Auth & Storage S3]
    VercelServer --> ResendSMTP[Resend SMTP Email Engine]
    VercelServer --> GeminiAPI[Google Gemini Flash AI API]
    VercelServer --> KemendikdasmenAPI[Kemendikdasmen NPSN Lookup]
```

### Rincian Teknologi:
- **Framework Utama:** [Next.js 16.3.1](https://nextjs.org/) (App Router, Turbopack, Server Actions, Route Handlers)
- **Library UI:** [React 19.2.8](https://react.dev/)
- **Bahasa Pemrograman:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling & Token Desain:** [Tailwind CSS v4](https://tailwindcss.com/) dengan arsitektur CSS-first `@import "tailwindcss"`
- **ORM & Basis Data:** [Prisma ORM v7.9.1](https://www.prisma.io/) dengan `@prisma/adapter-pg` driver adapter di atas **PostgreSQL**
- **Storage & Auth OAuth:** [Supabase](https://supabase.com/) (Google OAuth 2.0 & Cloud Storage dokumen)
- **Mesin Email Transaksional:** [Resend](https://resend.com/) via `smtp.resend.com` (Port 465 SSL)
- **Mesin AI:** Google Gemini Generative Language API (`gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`)
- **Keamanan Kredensial:** `bcryptjs` untuk hashing kata sandi tingkat tinggi (salt round 10)
- **Mesin Pengujian:** Modul bawaan performa tinggi `node:test`

---

## 📂 Struktur Direktori Lengkap

```
d:/itechcup-2026/
├── prisma/
│   ├── schema.prisma             # Skema Prisma ORM v7 (8 Entitas Relasional)
│   ├── seed.ts                   # Seeder data pengembangan
│   └── migrations/               # Riwayat migrasi database PostgreSQL
├── public/                       # Aset statis, ikon platform, logo, gambar
├── src/
│   ├── app/
│   │   ├── (auth)/               # Layout autentikasi terisolasi
│   │   │   ├── login/page.tsx    # Halaman Login (Kredensial + Google OAuth)
│   │   │   └── register/         # Halaman Registrasi Multi-Role
│   │   │       ├── pelajar/      # Registrasi Pelajar (+ Kartu Pelajar & NIS)
│   │   │       ├── umkm/         # Registrasi UMKM (+ Izin Usaha/NIB)
│   │   │       └── sekolah/      # Registrasi Sekolah (+ Validasi NPSN)
│   │   ├── (dashboard)/          # Shell Dashboard (Sidebar & Navbar)
│   │   │   ├── pelajar/          # Dashboard Pelajar
│   │   │   │   ├── dompet/       # Dompet Digital & Penarikan Saldo
│   │   │   │   ├── jasa/buat/    # Form Pembuatan Katalog Jasa
│   │   │   │   └── transaksi/[id]# Ruang Akad & Progres Pengerjaan
│   │   │   ├── umkm/             # Dashboard UMKM
│   │   │   │   ├── proyek/buat/  # Form Publikasi Proyek Baru
│   │   │   │   ├── deposit/      # Simulasi & Top-up Escrow
│   │   │   │   └── transaksi/[id]# Ruang Review Hasil & Rating
│   │   │   └── sekolah/          # Dashboard Sekolah
│   │   │       ├── page.tsx      # Verifikasi Siswa (Approve / Reject)
│   │   │       └── laporan/      # Laporan Kinerja & Portofolio Siswa
│   │   ├── tuan/                 # Portal Super-Admin Mitra Muda
│   │   │   ├── login/page.tsx    # Login Keamanan Khusus Admin
│   │   │   └── page.tsx          # Panel Moderasi Legalitas & Escrow
│   │   ├── marketplace/          # Katalog Terbuka Proyek & Jasa Siswa
│   │   │   ├── page.tsx          # Feed Pencarian & Filter Kategori
│   │   │   └── [id]/page.tsx     # Detail Lowongan & Pengajuan Lamaran
│   │   ├── profil/[id]/page.tsx  # Halaman Profil Publik & Portofolio Siswa
│   │   ├── panduan/page.tsx      # Pusat Dokumentasi & FAQ Pengguna
│   │   ├── auth/callback/        # Handler Konfirmasi Email & Reset Password
│   │   ├── api/                  # API Backend Route Handlers
│   │   │   ├── ai/assistant/     # Endpoint Gemini AI Waterfall + Rate Limiter
│   │   │   ├── auth/             # Login, Google OAuth Check, Reset Password
│   │   │   ├── sekolah/          # Verifikasi NPSN & Integrasi Kemendikdasmen
│   │   │   ├── pelajar/          # CRUD Profil Pelajar
│   │   │   ├── umkm/             # CRUD UMKM & Pengajuan Legalitas
│   │   │   ├── proyek/           # Publikasi & Pencarian Lowongan Proyek
│   │   │   ├── jasa/             # Katalog Jasa Pelajar
│   │   │   ├── lamaran/          # Proposal Pengajuan Pelajar ke Proyek UMKM
│   │   │   ├── transaksi/        # Akad Proyek, Escrow, dan Status Pembayaran
│   │   │   └── siswa/            # Sinkronisasi Verifikasi Siswa oleh Sekolah
│   │   ├── globals.css           # Token Tailwind CSS v4 & Utilitas Global
│   │   ├── layout.tsx            # Root Layout (Plus Jakarta Sans Font)
│   │   └── not-found.tsx         # Halaman 404 Kustom
│   ├── components/
│   │   ├── ui/                   # Komponen Atom (Button, Input, Card, Badge)
│   │   ├── layout/               # Navbar, Sidebar Dashboard, Footer
│   │   ├── marketplace/          # ProyekCard, JasaCard
│   │   └── ai-assistant.tsx      # Floating Widget AI Assistant & Support CS
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Client Singleton
│   │   ├── supabase.ts           # Supabase Storage & Auth Helper
│   │   ├── auth-server.ts        # Server Session (HTTP-Only Cookie) Helper
│   │   ├── auth-client.ts        # Client Session (LocalStorage) Synchronizer
│   │   ├── utils.ts              # cn(), formatRupiah(), formatTanggal()
│   │   ├── rate-limiter.ts       # Rate Limiter In-Memory (IP, NPSN, AI)
│   │   ├── kemendikdasmen.ts     # Integrasi API Lookup NPSN Kementerian
│   │   ├── validate-npsn.ts      # Validator Format 8-Digit NPSN
│   │   ├── normalize-school-name.ts # Normalisasi Nama & Akronim Sekolah
│   │   ├── compare-school-names.ts  # Algoritma Kecocokan Nama Sekolah
│   │   └── admin-verification-store.ts # Sinkronisasi Dokumen Asli Admin
│   ├── types/
│   │   └── index.ts              # Definisi TypeScript Komprehensif
│   └── proxy.ts                  # Middleware Deteksi Perangkat
├── test/                         # Suite Unit Test Otomatis (44 Tests)
├── next.config.ts                # Konfigurasi Next.js & HTTP Security Headers
├── CONTRIBUTING.md               # Panduan Berkontribusi & Standar Kode
└── README.md                     # Dokumentasi Utama Repositori
```

---

## 👥 Alur & Peran Pengguna (Multi-Role Ecosystem)

```mermaid
sequenceDiagram
    autonumber
    actor Pelajar
    actor UMKM
    actor Sekolah
    actor Tuan as Admin (Tuan)
    participant Platform as Mitra Muda Platform

    Sekolah->>Platform: Daftar dengan NPSN 8-digit
    Platform-->>Sekolah: Verifikasi otomatis via API Kemendikdasmen

    Pelajar->>Platform: Registrasi (Pilih Sekolah, NIS, Upload Kartu Pelajar)
    Sekolah->>Platform: Verifikasi & Setujui Siswa
    Platform-->>Pelajar: Akun Berstatus Terverifikasi

    UMKM->>Platform: Registrasi & Upload Legalitas (NIB / Foto Usaha)
    Tuan->>Platform: Verifikasi Dokumen UMKM
    Platform-->>UMKM: Akun Berstatus Terverifikasi

    UMKM->>Platform: Publikasi Lowongan Proyek + Set Budget DP
    Pelajar->>Platform: Lamar Proyek / Tawarkan Portofolio Jasa
    UMKM->>Platform: Pilih Pelajar & Buat Kesepakatan (Akad Transaksi)
    UMKM->>Platform: Setor Dana DP ke Rekening Escrow
    Pelajar->>Platform: Kerjakan & Submit Hasil Proyek
    UMKM->>Platform: Review Hasil & Berikan Rating Bintang
    Platform->>Pelajar: Rilis Dana ke Dompet Digital Siswa (Bisa Tarik ke E-Wallet)
```

---

## 💰 Sistem Transaksi Escrow (Rekening Bersama)

Untuk menjamin rasa aman bagi kedua belah pihak:
1. **Penyetoran DP Aman:** Sebelum pengerjaan dimulai, UMKM menyetorkan uang muka (DP) ke Rekening Bersama Mitra Muda. Dana tidak langsung diterima pelajar, melainkan ditahan oleh sistem.
2. **Jaminan Pengerjaan:** Pelajar memulai tugas dengan kepastian bahwa dana proyek telah siap dan terjamin.
3. **Penyelesaian & Arbitrase:** Setelah pelajar mengunggah hasil kerja dan disetujui UMKM, dana otomatis diteruskan ke saldo dompet pelajar.
4. **Perlindungan Sengketa:** Jika terjadi ketidaksesuaian atau pembatalan sepihak, tim Admin (Tuan) melakukan mediasi dan pengembalian dana (*refund*) sesuai ketentuan akad.

---

## 🤖 Asisten Virtual AI (Google Gemini Multi-Tier)

Platform dilengkapi widget asisten pintar di pojok kanan bawah yang ditenagai **Google Gemini Generative AI** dengan arsitektur eskalasi bertingkat (*waterfall*):

- 🟢 **Tier 1: `gemini-3.1-flash-lite`** — Model tercepat dan paling hemat kuota token sebagai pintu gerbang utama.
- 🟡 **Tier 2: `gemini-3.5-flash`** — Otomatis dipanggil jika model pertama mencapai batas *rate-limit*.
- 🟠 **Tier 3: `gemini-3.6-flash`** — Tier lanjutan jika beban permintaan meningkat.
- 🔴 **Tier 4: `gemini-3.7-flash`** — Model tertinggi sebagai benteng pertahanan terakhir.
- 💬 **Formatter Chat Dinamis:** Menghasilkan output teks terstruktur dengan nomor badge pill (`#FFF1EB` / `#964825`), bullet point oranye (`#FF9B71`), dan pemisah baris yang bersih.
- 🛡️ **Penyaring Anti-Halusinasi:** Jika seluruh token model habis, sistem mengembalikan status HTTP 429 jujur dan menampilkan tautan cepat menghubungi **Customer Support WhatsApp** resmi.

---

## 🛡️ Benteng Keamanan Tingkat SSS

Keamanan platform dirancang mengikuti standar industri (*hardened security posture*):

### 1. Keamanan API & Model AI
- **Zero API Key Leak:** Kunci `GEMINI_API_KEY` tersimpan murni di *server environment* (`process.env`) dan dilarang muncul di sisi klien.
- **Output Redactor Engine:** Pemindaian ekspresi reguler (regex) secara *real-time* untuk menyensor string menyerupai API key (`AIzaSy...`), JWT (`eyJ...`), atau kredensial rahasia menjadi `[KREDENSIAL DILINDUNGI]`.
- **Anti-Jailbreak & Prompt Injection Shield:** Menangkal upaya manipulasi sistem (*system prompt theft*, *DAN mode*, *developer mode*, *variable dumping*).
- **Rate Limiting Ketat (`aiRateLimiter`):** Maksimal 12 permintaan per menit per alamat IP untuk mencegah serangan *flooding* atau *DDoS token harvesting*.

### 2. HTTP Security Headers ([`next.config.ts`](file:///d:/itechcup-2026/next.config.ts))
- `X-Frame-Options: SAMEORIGIN`: Proteksi mutlak dari serangan *Clickjacking*.
- `X-Content-Type-Options: nosniff`: Mencegah manipulasi tipe berkas *MIME sniffing*.
- `Strict-Transport-Security (HSTS)`: Wajib enkripsi HTTPS selama 2 tahun (`max-age=63072000; includeSubDomains; preload`).
- `Referrer-Policy: strict-origin-when-cross-origin`: Menjaga kerahasiaan URL dan token sesi saat navigasi eksternal.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Memblokir akses perangkat keras tanpa persetujuan.
- `Cache-Control: no-store, max-age=0` pada rute `/api/*`: Menghindari penyimpanan cache data privat di jaringan perantara.
- `poweredByHeader: false`: Menghilangkan jejak versi server dari pemindaian bot peretas.

### 3. Integritas Data Riil (Zero Mock Images)
- Menolak keras penggunaan gambar dummy atau stok internet acak (seperti Unsplash) untuk kartu identitas pelajar dan legalitas usaha. Hanya dokumen asli pendaftar yang ditampilkan di sistem.

---

## 📧 Sistem Notifikasi Email (Resend SMTP)

Pengiriman email transaksional berjalan di bawah domain resmi **`mitramuda.raffzdigital.biz.id`**:
- **Sender:** `Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>`
- **SMTP Gateway:** `smtp.resend.com` (Port 465 SSL)
- **Aktivasi Akun:** Email konfirmasi akun baru dengan token verifikasi otomatis.
- **Pemulihan Sandi:** Tautan reset kata sandi aman yang terintegrasi dengan validasi kekuatan sandi dan auto-login setelah penggantian berhasil.

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js:** Versi 20.x atau lebih baru
- **npm:** Versi 10.x atau lebih baru
- **Docker & Docker Compose** (Opsional untuk database lokal) atau akun **PostgreSQL Cloud** (Supabase/Neon/Railway)

### 2. Kloning Repositori
```bash
git clone https://github.com/Razerpoa/itechcup-2026.git
cd itechcup-2026
npm install
```

### 3. Konfigurasi Variabel Lingkungan (.env)
Salin contoh template dan sesuaikan isinya:
```bash
cp .env.example .env
```

Contoh konfigurasi utama:
```env
# Database PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/mitramuda"

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# AI Google Gemini
GEMINI_API_KEY="your-gemini-api-key-here"

# Layanan Email (Resend)
RESEND_API_KEY="your-resend-api-key-here"
EMAIL_FROM="Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>"

# Domain Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Skema Database
```bash
# Sinkronkan skema Prisma ke PostgreSQL
npm run db:push

# (Opsional) Isi data awal untuk uji coba
npm run db:seed
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Akses platform di peramban Anda melalui [http://localhost:3000](http://localhost:3000).

---

## ⚡ Perintah Tersedia (NPM Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server (Turbopack). |
| `npm run build` | Melakukan kompilasi Prisma Client dan build produksi Next.js. |
| `npm run start` | Menjalankan server produksi lokal setelah di-build. |
| `npm run lint` | Menjalankan pemeriksaan kualitas kode dengan ESLint. |
| `npm run db:push` | Mendorong perubahan skema Prisma ke database tanpa file migrasi. |
| `npm run db:seed` | Menjalankan script data seeder untuk database lokal. |
| `npm run db:studio` | Membuka antarmuka grafis Prisma Studio di browser. |

---

## 🌐 Daftar Endpoint API

### Autentikasi & Akun
- `POST /api/auth/login`: Login akun manual dengan enkripsi `bcryptjs`.
- `POST /api/auth/google-check`: Pemeriksaan status akun dan sinkronisasi Google OAuth.
- `POST /api/auth/reset-password`: Permintaan pengiriman email reset sandi.
- `PUT /api/auth/reset-password`: Eksekusi penetapan kata sandi baru.
- `POST /api/auth/admin-login`: Autentikasi portal Super Admin (Tuan) dengan rate-limiter khusus.

### Asisten AI & Bantuan
- `POST /api/ai/assistant`: Chatbot Gemini AI berjenjang dengan perlindungan SSS-tier.

### Sekolah & Siswa
- `GET/POST /api/sekolah`: Pendaftaran dan pemanggilan data profil sekolah.
- `GET /api/sekolah/[id]`: Detail sekolah beserta daftar siswa bimbingan.
- `GET/POST /api/siswa`: Pengajuan verifikasi siswa oleh sekolah.
- `PUT /api/siswa/[id]`: Penetapan status verifikasi (`APPROVED` / `REJECTED`).

### Pelajar & Portofolio
- `GET/POST /api/pelajar`: Pengambilan dan pembaruan profil pelajar.
- `GET /api/pelajar/[id]`: Detail profil publik pelajar dan review portofolio.
- `GET/POST /api/jasa`: Katalog penawaran keahlian siswa (Basic/Standard/Premium).

### UMKM & Proyek
- `GET/POST /api/umkm`: Profil usaha dan pengunggahan izin legalitas bisnis.
- `GET/POST /api/proyek`: Publikasi lowongan proyek baru dan pencarian proyek aktif.
- `GET/POST /api/lamaran`: Pengajuan proposal proyek oleh siswa kepada UMKM.

### Keuangan & Escrow
- `GET/POST /api/deposit`: Top-up dan pengelolaan deposit rekening bersama UMKM.
- `GET/POST /api/transaksi`: Pembuatan akad proyek, pencairan dana, dan submit penilaian.

---

## 🧪 Pengujian Unit (Unit Testing)

Repositori ini menerapkan pengujian otomatis menyeluruh mencakup modul logika penting:

```bash
node --import ./tsx-hooks.mjs --test (Get-ChildItem test -Recurse -Filter *.test.ts).FullName
```

### Hasil Uji Coba:
```
✔ Registration pipeline integration (6 tests)
✔ compareSchoolNames (6 tests)
✔ lookupSchool Kemendikdasmen (4 tests)
✔ normalizeSchoolName (16 tests)
✔ RateLimiter (5 tests)
✔ validateNpsn (7 tests)

ℹ tests 44
ℹ suites 6
ℹ pass 44
ℹ fail 0
```

---

## 🎨 Desain Antarmuka: Collaborative Vitality

Sistem desain **Collaborative Vitality** dirancang untuk memancarkan nuansa muda, energik, namun tetap profesional dan terpercaya:

- **Primary Color:** `#FF9B71` (Pastel Warm Orange)
- **Primary Dark:** `#964825` (Terracotta)
- **Text Headings:** `#2D2319` (Deep Charcoal)
- **Background Utama:** `#FAFAFA` (Clean Warm Off-White)
- **Surface Card:** `#FFFFFF` (Pure White)
- **Tipografi:** Plus Jakarta Sans
- **Radius Tombol/Badge:** `rounded-full` (Pill-shaped)
- **Radius Kontainer/Card:** `rounded-2xl` & `rounded-3xl`

---

## 📞 Tim & Kontak Layanan

Jika Anda memiliki pertanyaan, memerlukan dukungan teknis, atau ingin menjalin kemitraan:

- **Website Resmi:** [https://www.mitramuda.biz.id](https://www.mitramuda.biz.id)
- **WhatsApp Customer Care:** [+62 895-6224-94773](https://wa.me/62895622494773) (Raffa)
- **Email Resmi:** [raffaxzee@gmail.com](mailto:raffaxzee@gmail.com) / [noreply@mitramuda.raffzdigital.biz.id](mailto:noreply@mitramuda.raffzdigital.biz.id)
- **Jam Layanan:** Setiap Hari (08.00 – 21.00 WIB)

---

<p align="center">
  Dibuat dengan dedikasi untuk memajukan pendidikan vokasi dan talenta muda Indonesia. 🇮🇩<br>
  <b>Mitra Muda &copy; 2026. Hak Cipta Dilindungi.</b>
</p>
