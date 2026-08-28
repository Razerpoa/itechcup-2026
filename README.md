# MITRA MUDA
**Platform Pemberdayaan Talenta Pelajar & Akselerasi Digital UMKM Indonesia Tanpa Syarat Rekening Bank**

Submission for **ITECHNO CUP 2026 - Web Development**

By **DragonTech**

---

## 📋 Daftar Isi
* [Tentang Proyek](#-tentang-proyek)
* [Fitur Unggulan](#-fitur-unggulan)
* [Demo & Screenshot](#-demo--screenshot)
* [Teknologi](#-teknologi)
* [Arsitektur Sistem](#-arsitektur-sistem)
* [Instalasi & Setup](#-instalasi--setup)
* [Penggunaan](#-penggunaan)
* [API Documentation](#-api-documentation)
* [Testing](#-testing)
* [Tim Developer](#-tim-developer)
* [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama | Peran | GitHub |
| :--- | :--- | :--- |
| **Raffa Rizqi Ramdani** | Project Lead & Full Stack Developer | [@RaffaRizqi](https://github.com/RaffaRizqi) |
| **Faaiz Hamdy** | Frontend Developer & UI/UX Designer | [@Faaizhamdhy](https://github.com/Faaizhamdhy) |
| **Fathan Assidqi Dwipayana** | Backend Developer | [@Razerpoa](https://github.com/Razerpoa) |

---

## 🎯 Tentang Proyek

### Latar Belakang
Indonesia memiliki lebih dari **64 juta unit Usaha Mikro, Kecil, dan Menengah (UMKM)** yang menjadi tulang punggung ekonomi nasional, namun lebih dari 70% di antaranya masih menghadapi keterbatasan dalam transformasi digital akibat mahalnya biaya jasa agensi profesional. Di saat yang sama, jutaan pelajar kejuruan (SMK) dan menengah atas (SMA) memiliki keterampilan digital mumpuni di bidang desain grafis, pengembangan web, penulisan konten, dan multimedia.

Namun, para pelajar ini terbentur oleh batasan regulasi usia konvensional: **tidak memiliki KTP/NPWP** dan **tidak memenuhi syarat pembukaan rekening bank komersial**, sehingga tereksklusi dari platform pekerja lepas global. Ketiadaan wadah legal yang aman dan terverifikasi pihak sekolah sering kali menghadapkan pelajar pada risiko penipuan pengerjaan serta keterlambatan atau ketiadaan pembayaran.

### Solusi yang Ditawarkan
**Mitra Muda** hadir sebagai platform marketplace kolaboratif yang menghubungkan pelajar bertalenta dengan pelaku UMKM melalui sistem verifikasi legal institusional sekolah dan rekening bersama (*escrow*). Solusi inovatif ini memungkinkan:
1. **Pemberdayaan Pelajar Tanpa Rekening Bank:** Menghubungkan dompet digital siswa langsung ke layanan e-wallet nasional (GoPay, OVO, DANA, ShopeePay) dengan verifikasi identitas yang sah melalui pihak sekolah.
2. **Jaminan Keamanan Escrow:** Menjaga dana proyek dari UMKM di dalam rekening penampung bersama hingga pekerjaan selesai diverifikasi secara memuaskan.
3. **Verifikasi Sekolah & ID Registrasi:** Menautkan status siswa ke database sekolah terdaftar dan data resmi Kemendikdasmen RI melalui alur persetujuan guru berbasis ID Registrasi (`MM-2026-XXXXX`).
4. **Pendamping AI Cerdas:** Membantu pembuatan profil, penulisan proposal, dan konsultasi interaktif melalui AI Virtual Assistant terintegrasi Google Gemini.

### Tujuan Proyek
* 🎯 **Tujuan Utama:** Membuka akses ekonomi mandiri yang aman bagi talenta pelajar Indonesia sembari mempercepat akselerasi digital UMKM dengan biaya yang transparan dan kompetitif.
* 📊 **Target Pengguna:**
  * **Pelajar SMK/SMA:** Berusia 15–18 tahun yang memiliki keahlian digital dan ingin membangun portofolio profesional sejak dini.
  * **Pelaku UMKM:** Pemilik usaha mikro dan kecil yang memerlukan jasa branding, pembuatan website, media sosial, dan digital marketing berkualitas dengan budget fleksibel.
  * **Institusi Sekolah & Guru:** Pembimbing kejuruan yang ingin memantau, memvalidasi, dan mengawasi kegiatan industri nyata para siswanya secara terpusat.
* 💡 **Value Proposition:**
  * *Zero Bank Barrier:* Transaksi dan pencairan saldo penuh via e-wallet lokal tanpa syarat kartu kredit atau buku tabungan bank.
  * *Institutional Trust:* Keabsahan status pelajar dijamin melalui relasi database sekolah dan integrasi data NPSN Kemendikdasmen RI.
  * *Escrow DP Protection:* Perlindungan dua arah: UMKM terlindungi dari wanprestasi dan pelajar terlindungi dari risiko gagal bayar.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |
| :--- | :--- | :--- |
| **Verifikasi Sekolah & ID Registrasi Siswa** | Alur pendaftaran pelajar yang terhubung langsung ke database sekolah terdaftar dengan kode unik `MM-2026-XXXXX`. | Mencegah kecurangan akun; guru dapat menyetujui siswa secara instan via fitur *Quick Approval* tanpa perlu mengunggah KTP/buku tabungan. |
| **Marketplace Proyek & Jasa Siswa** | Portal lowongan pekerjaan dua arah: UMKM mempublikasikan lowongan proyek, dan pelajar menawarkan katalog paket keahlian (Basic, Standard, Premium). | Memudahkan pencocokan kebutuhan UMKM dengan keahlian spesifik pelajar secara transparan dan terstruktur. |
| **Sistem Akad Escrow (Rekening Bersama)** | Penguncian uang muka (DP 30%–50%) di dompet penampung aman sistem sebelum pekerjaan dimulai hingga serah terima hasil. | Menghilangkan risiko gagal bayar bagi siswa dan melindungi dana UMKM jika pengerjaan tidak memenuhi standar akad. |
| **Asisten Virtual AI (Google Gemini Multi-Tier)** | Chatbot cerdas terpadu di pojok aplikasi untuk konsultasi platform, pembuatan ringkasan penawaran, dan bantuan teknis. | Menggunakan arsitektur *waterfall* cerdas (hemat token) dengan perlindungan keamanan anti-kebocoran kredensial tingkat tinggi. |

### Fitur Tambahan
* **Integrasi Lookup Kemendikdasmen RI:** Validasi otomatis NPSN 8-digit dan nama sekolah resmi secara *real-time* saat pendaftaran sekolah.
* **Dompet Digital Siswa:** Pencairan saldo aman langsung ke berbagai e-wallet (GoPay, OVO, DANA, ShopeePay) dengan verifikasi nama pemilik akun.
* **Panel Moderasi Admin Tuan:** Portal kontrol terpusat untuk verifikasi legalitas UMKM, peninjauan sengketa escrow, serta modal dialog penolakan dan pencabutan status in-app.
* **Multi-Factor Authentication (2FA Modal):** Pengamanan verifikasi transaksi dan penarikan saldo melalui kode autentikasi instan.

---

## 📸 Demo & Screenshot

### Live Demo
🔗 **Kunjungi Website Resmi:** [https://www.mitramuda.biz.id](https://www.mitramuda.biz.id)

### Screenshot Aplikasi

* **Homepage (`/`)** — Tampilan utama platform yang memperkenalkan ekosistem kolaborasi pelajar dan UMKM dengan estetika *Collaborative Vitality*.
* **Marketplace (`/marketplace`)** — Feed lowongan proyek UMKM serta katalog etalase jasa siswa lengkap dengan filter kategori dan pencarian cerdas.
* **Dashboard Pelajar (`/pelajar`)** — Panel kontrol siswa untuk memantau ID Registrasi, status verifikasi sekolah, transaksi aktif, dan dompet digital.
* **Dashboard UMKM (`/umkm`)** — Panel manajemen lowongan proyek, pemantauan proposal lamaran masuk, dan deposit rekening escrow.
* **Dashboard Sekolah (`/sekolah`)** — Portal verifikasi siswa dengan fitur *Quick Approval* berbasis ID Registrasi dan monitoring portofolio.
* **Portal Master Admin (`/tuan`)** — Panel moderasi verifikasi berkas legalitas UMKM, persetujuan penarikan saldo, dan mediasi transaksi aman.

### Video Demo
📹 **Link Video Demo:** *(Tersedia dalam berkas penyerahan juri ITECHNO CUP 2026)*

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend
* **Framework:** Next.js 16.3.1 (React 19.2.8, App Router)
* **Styling & Design System:** Tailwind CSS v4 (Arsitektur CSS-First `@import "tailwindcss"`)
* **Icons:** Lucide React
* **State Management:** React Stateful Hooks & `useSyncExternalStore` Broadcast Synchronization

#### Backend
* **Runtime:** Node.js (v20+)
* **Framework:** Next.js Route Handlers (Edge & Node.js Runtime)
* **Database:** PostgreSQL via Supabase / Prisma Driver
* **ORM:** Prisma ORM v7.9.1 (`@prisma/adapter-pg` driver adapter)
* **Authentication:** Supabase Auth, Cookie-based JWT Session, & bcryptjs

#### DevOps & Tools
* **Deployment:** Vercel Production Platform (Edge Network)
* **Email Engine:** Resend SMTP Service
* **AI Provider:** Google Gemini Generative AI API (`gemini-3.1-flash-lite`, `gemini-3.5-flash`)
* **Testing:** Native Node.js Test Runner (`node:test`)

### Alasan Pemilihan Teknologi

| Teknologi | Alasan Pemilihan |
| :--- | :--- |
| **Next.js 16 (App Router)** | Memadukan kapabilitas *Server-Side Rendering* (SSR) dan *Static Site Generation* (SSG) dengan Turbopack untuk performa kompilasi sub-detik serta keamanan *Server Actions*. |
| **Tailwind CSS v4** | Menghadirkan engine baru berbasis CSS-first murni tanpa overhead konfigurasi JavaScript lama, memastikan beban aset web minimal dan rendering instan. |
| **Prisma ORM v7** | Menjamin integritas data relasional dengan *type-safety* TypeScript penuh, migrasi skema deklaratif, dan performa tinggi melalui driver adapter PostgreSQL. |
| **Google Gemini AI (Multi-Tier)** | Menyediakan inferensi cerdas dengan latensi sangat rendah serta efisiensi kuota token berkat skema eskalasi model bertingkat (*waterfall*). |

### Dependencies Utama

```json
{
  "dependencies": {
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "@prisma/client": "^7.9.1",
    "@prisma/adapter-pg": "^7.9.1",
    "@supabase/supabase-js": "^2.112.3",
    "bcryptjs": "^3.0.3",
    "resend": "^6.22.0",
    "lucide-react": "^1.33.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "prisma": "^7.9.1",
    "typescript": "^5"
  }
}
```

---

## 🏗️ Arsitektur Sistem

### System Architecture

```mermaid
graph TD
    Client["Klien Web / Browser (Desktop & Mobile)"] --> CDN["Vercel Global Edge Network"]
    CDN --> NextApp["Next.js 16 App Router Server"]

    subgraph "Arsitektur Layanan Backend"
        NextApp --> AuthLayer["Auth Guard (JWT & Cookie Session)"]
        NextApp --> RouteHandlers["RESTful Route Handlers (/api/*)"]
        NextApp --> EscrowEngine["Sistem Rekening Bersama (Escrow Vault)"]
    end

    subgraph "Penyimpanan & Integrasi Eksternal"
        RouteHandlers --> Prisma["Prisma ORM v7 (@prisma/adapter-pg)"]
        Prisma --> Postgres[("Database PostgreSQL")]
        RouteHandlers --> SupabaseStorage["Supabase Storage (Bukti Dokumen & Berkas)"]
        RouteHandlers --> GeminiAI["Google Gemini Flash AI Engine"]
        RouteHandlers --> Kemendikdasmen["Kemendikdasmen API (Lookup NPSN Resmi)"]
        RouteHandlers --> ResendEmail["Resend SMTP Email Service"]
    end
```

### Database Schema

```mermaid
erDiagram
    SEKOLAH ||--o{ PELAJAR : "memverifikasi"
    PELAJAR ||--|| PELAJAR_PROFILE : "memiliki"
    PELAJAR ||--o{ JASA : "menawarkan"
    PELAJAR ||--o{ LAMARAN : "mengajukan"
    UMKM ||--o{ PROYEK : "mempublikasikan"
    PROYEK ||--o{ LAMARAN : "menerima"
    PROYEK ||--o{ TRANSAKSI : "menghasilkan"
    PELAJAR ||--o{ TRANSAKSI : "mengerjakan"

    SEKOLAH {
        string id PK
        string npsn UK
        string namaSekolah
        string statusVerifikasi
    }
    PELAJAR {
        string id PK
        string email UK
        string nis
        string sekolahId FK
        string verificationStatus
    }
    UMKM {
        string id PK
        string namaUsaha
        string nomorWa
        boolean isVerified
    }
    PROYEK {
        string id PK
        string judul
        float budget
        float danaDP
        string status
    }
    TRANSAKSI {
        string id PK
        string proyekId FK
        float nominalEscrow
        string statusPembayaran
    }
```

### Folder Structure

```
itechcup-2026/
├── prisma/
│   ├── schema.prisma             # Skema Entitas Relasional PostgreSQL
│   ├── seed.ts                   # Seeder Data Uji Coba Multi-Role
│   └── migrations/               # Riwayat Migrasi Database
├── public/                       # Aset Statis, Favicon, Logo Platform
├── src/
│   ├── app/
│   │   ├── (auth)/               # Halaman Login & Registrasi Multi-Role
│   │   ├── (dashboard)/          # Dashboard Pelajar, UMKM, dan Sekolah
│   │   ├── (marketing)/          # Landing Page & Pengenalan Ekosistem
│   │   ├── api/                  # RESTful API Endpoints
│   │   ├── marketplace/          # Feed Proyek & Katalog Jasa
│   │   ├── profil/[id]/          # Halaman Portofolio Publik Siswa
│   │   ├── tuan/                 # Panel Master Admin
│   │   └── globals.css           # Token Desain Tailwind CSS v4
│   ├── components/
│   │   ├── ui/                   # Komponen Atomik (Button, Badge, Modal, Input)
│   │   ├── layout/               # Navbar & Sidebar Navigasi
│   │   ├── marketplace/          # Kartu Proyek & Kartu Jasa
│   │   └── ai-assistant.tsx      # Widget AI Chatbot Terpadu
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Singleton Client
│   │   ├── auth-client.ts        # Sinkronisasi Sesi Autentikasi Klien
│   │   ├── auth-server.ts        # Helper Verifikasi JWT & Cookie Server
│   │   ├── kemendikdasmen.ts     # Integrasi Lookup Data Sekolah Resmi
│   │   └── escrow-store.ts       # Manajemen Status Rekening Bersama
│   └── types/
│       └── index.ts              # Definisi Tipe Data TypeScript Bersama
├── test/                         # Kumpulan Berkas Pengujian Unit
└── README.md                     # Dokumentasi Utama Proyek
```

---

## ⚙️ Instalasi & Setup

### Prerequisites
Pastikan lingkungan pengembangan lokal telah terpasang:
* **Node.js:** Versi 20.x atau lebih baru
* **npm:** Versi 10.x atau sepadan (pnpm / yarn)
* **PostgreSQL:** Server basis data lokal atau instans cloud (Supabase / Neon)
* **Git:** Kontrol versi

### Langkah Instalasi

1️⃣ **Clone Repository**
```bash
git clone https://github.com/Razerpoa/itechcup-2026.git
cd itechcup-2026
git checkout kpn
```

2️⃣ **Install Dependencies**
```bash
# Menggunakan npm
npm install
```

3️⃣ **Setup Environment Variables**
Buat berkas `.env` pada direktori *root* proyek (gunakan template aman berikut):
```env
# Basis Data PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/mitramuda?schema=public"

# Supabase Auth & Cloud Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-placeholder"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key-placeholder"

# Mesin Email Transaksional (Resend)
RESEND_API_KEY="your-resend-api-key-placeholder"

# Google Gemini AI Multi-Tier
GEMINI_API_KEY="your-gemini-api-key-placeholder"

# Konfigurasi Keamanan Sesi
JWT_SECRET="your-secure-jwt-secret-key-32-chars-min"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
PORT=3000
```

4️⃣ **Setup Database**
```bash
# Terapkan skema ke basis data PostgreSQL
npm run db:push

# Isi data awal (opsional)
npm run db:seed
```

5️⃣ **Run Development Server**
```bash
npm run dev
```
Aplikasi akan berjalan dan dapat diakses melalui peramban di `http://localhost:3000`.

---

## 🚀 Penggunaan

### Menjalankan Aplikasi
```bash
# Mode pengembangan lokal
npm run dev

# Kompilasi paket produksi
npm run build

# Menjalankan server hasil produksi
npm run start

# Menjalankan seluruh pengujian unit
node --import ./tsx-hooks.mjs --test (Get-ChildItem test -Recurse -Filter *.test.ts).FullName

# Pemeriksaan kualitas sintaksis
npm run lint
```

### User Guide

#### Untuk Pengguna Umum & Pelajar
1. **Registrasi Pelajar:** Masuk ke `/register/pelajar`, pilih sekolah yang telah terdaftar dari dropdown cerdas, isi data diri, dan dapatkan **ID Registrasi Siswa** unik (`MM-2026-XXXXX`).
2. **Kirim ID ke Guru:** Klik tombol *Salin ID* atau *Kirim via WhatsApp* untuk meminta persetujuan pihak sekolah.
3. **Mulai Berkarya:** Setelah terverifikasi, buat penawaran jasa di `/pelajar/jasa/buat`, telusuri lowongan proyek di `/marketplace`, dan pantau penghasilan di `/pelajar/dompet`.

#### Untuk Pelaku UMKM
1. **Registrasi UMKM:** Buka `/register/umkm`, masukkan nama usaha, alamat, nomor WhatsApp, serta lampirkan bukti legalitas usaha (NIB, foto tempat usaha, atau link media sosial resmi).
2. **Pasang Lowongan Proyek:** Akses `/umkm/proyek/buat`, tentukan judul pekerjaan, tenggat waktu, serta anggaran total dan uang muka (DP).
3. **Pilih Pelamar & Setor DP:** Tinjau proposal pelajar yang masuk, setujui pelamar terbaik, lalu lakukan transfer DP ke rekening penampung escrow untuk mengunci akad kerja.

#### Untuk Pihak Sekolah & Guru
1. **Registrasi Sekolah:** Akses `/register/sekolah`, masukkan nomor NPSN 8-digit. Sistem secara otomatis memvalidasi keabsahan data sekolah via integrasi Kemendikdasmen RI.
2. **Verifikasi Cepat Siswa:** Buka `/sekolah`, masukkan kode ID Registrasi yang diberikan siswa ke dalam kotak *Verifikasi Cepat*, lalu klik *Setujui Siswa Ini* untuk konfirmasi instan.

#### Untuk Admin (Tuan)
1. **Akses Admin Panel:** Masuk ke `/tuan/login` dengan kredensial administrator resmi.
2. **Moderasi Legalitas:** Tinjau dokumen UMKM dan sekolah yang menunggu verifikasi, setujui pendaftaran yang valid, atau gunakan modal dialog penolakan dengan catatan resmi.
3. **Mediasi Escrow:** Pantau alur perputaran dana jaminan proyek dan setujui pencairan saldo siswa ke e-wallet.

---

## 📚 API Documentation

### Base URL
* **Development:** `http://localhost:3000/api`
* **Production:** `https://www.mitramuda.biz.id/api`

### Endpoints

#### Autentikasi & Pengguna
* `POST /api/auth/login` — Autentikasi masuk pengguna terdaftar (mendukung role pelajar, umkm, dan sekolah).
* `POST /api/auth/admin-login` — Autentikasi khusus akses administrator portal `/tuan`.
* `POST /api/auth/reset-password` — Pengiriman email reset password via Resend SMTP.
* `PUT  /api/auth/reset-password` — Pembaruan kata sandi baru menggunakan token verifikasi.

#### Data Pelajar & Siswa
* `GET  /api/pelajar` — Mengambil daftar pelajar terdaftar (tersanitasi tanpa password).
* `POST /api/pelajar` — Mendaftarkan akun pelajar baru dan menghubungkan ke `sekolahId`.
* `GET  /api/siswa?sekolahId={id}` — Mengambil daftar siswa yang terhubung ke sekolah tertentu.
* `PUT  /api/siswa/{id}` — Mengubah status verifikasi siswa (`VERIFIED` / `REJECTED`).

#### Data Sekolah & Kemendikdasmen
* `GET  /api/sekolah` — Mengambil daftar sekolah terdaftar untuk dropdown registrasi.
* `POST /api/sekolah` — Registrasi sekolah baru dengan validasi otomatis NPSN 8-digit.

#### Data UMKM & Lowongan Proyek
* `GET  /api/umkm` — Mengambil direktori profil UMKM.
* `POST /api/umkm` — Registrasi data profil UMKM beserta dokumen izin usaha.
* `GET  /api/proyek` — Menampilkan feed lowongan proyek dengan filter kategori dan budget.
* `POST /api/proyek` — Menerbitkan lowongan proyek baru dari pihak UMKM.

#### AI Virtual Assistant
* `POST /api/ai/assistant` — Konsultasi chatbot terproteksi rate-limiter dengan eskalasi model Google Gemini.

### Example Request

```typescript
// Contoh Pengajuan Proposal Lamaran Proyek
const response = await fetch('/api/lamaran', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    proyekId: 'cm6ab12340001xyz',
    pelajarId: 'cm6cd56780002abc',
    pesanProposal: 'Halo! Saya memiliki pengalaman 2 tahun dalam desain identitas visual UMKM...',
    tawaranHarga: 450000,
    estimasiHari: 5
  })
});

const result = await response.json();
console.log(result);
```

---

## 🧪 Testing

### Running Tests
Mitra Muda mengimplementasikan pengujian unit komprehensif menggunakan modul bawaan performa tinggi `node:test` dan `tsx-hooks.mjs`:

```bash
# Menjalankan seluruh rangkaian tes otomatis
node --import ./tsx-hooks.mjs --test (Get-ChildItem test -Recurse -Filter *.test.ts).FullName
```

### Test Coverage
Seluruh berkas modul krusial teruji secara menyeluruh dengan status **100% PASS**:

| Modul Uji | Deskripsi Skenario Pengujian | Status |
| :--- | :--- | :---: |
| `pipeline.test.ts` | Alur registrasi sekolah, normalisasi nama, dan lookup NPSN | ✅ PASS (6/6) |
| `compare-school-names.test.ts` | Algoritma perbandingan kemiripan nama sekolah (EXACT / MINOR / CRITICAL) | ✅ PASS (6/6) |
| `kemendikdasmen.test.ts` | Mocking respon API Kemendikdasmen, penanganan error, dan timeout | ✅ PASS (4/4) |
| `normalize-school-name.test.ts` | Normalisasi akronim kelembagaan (`SMKN` → `SMK NEGERI`, pembersihan tanda baca) | ✅ PASS (16/16) |
| `rate-limiter.test.ts` | Pembatasan frekuensi permintaan IP, masa reset, dan penolakan overload | ✅ PASS (5/5) |
| `validate-npsn.test.ts` | Validasi ketat format 8-digit numerik NPSN sekolah | ✅ PASS (7/7) |
| **Total Hasil Uji** | **44 Pengujian Unit Terverifikasi** | **100% Lulus (44/44)** |

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah **MIT License** — lihat berkas `LICENSE` untuk informasi selengkapnya.

---

Made with ❤️ by **DragonTech** for **ITECHNO CUP 2026**
