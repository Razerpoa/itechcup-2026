# Mitra Muda

Platform pemberdayaan talenta pelajar Indonesia yang menghubungkan pelajar berpengalaman dengan UMKM melalui marketplace jasa yang aman dan transparan — tanpa syarat KTP atau rekening bank.

## Tentang Mitra Muda

Banyak pelajar Indonesia memiliki bakat luar biasa di bidang desain, coding, video editing, dan lainnya, namun terhalang karena belum memiliki KTP atau rekening bank untuk menerima pembayaran. Di sisi lain, UMKM membutuhkan talenta muda yang segar dan terjangkau untuk menjalankan proyek digital mereka.

**Mitra Muda hadir sebagai solusi:**
- Pelajar dapat memonetisasi skill mereka tanpa perlu KTP/rekening bank (cukup e-wallet)
- UMKM dapat merekrut talenta muda dengan sistem pembayaran DP yang aman (escrow)
- Sekolah dapat memantau portofolio dan kinerja siswanya secara real-time

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 16.3.1** | Full-stack framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling dengan design tokens |
| **Prisma ORM v7** | Database schema & queries |
| **PostgreSQL** | Database utama |
| **Supabase** | Storage (foto profil, kartu pelajar), Auth OAuth |
| **Docker** | Containerisasi database lokal |
| **bcryptjs** | Hashing password |

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/                  ← Halaman login & register
│   │   ├── login/
│   │   └── register/
│   │       ├── pelajar/
│   │       ├── umkm/
│   │       └── sekolah/
│   ├── (dashboard)/             ← Dashboard per role
│   │   ├── layout.tsx           ← Sidebar + Navbar
│   │   ├── pelajar/
│   │   ├── sekolah/
│   │   └── umkm/
│   ├── (marketing)/             ← Landing & Onboarding
│   │   └── page.tsx             ← Pilih peran (Onboarding)
│   ├── marketplace/             ← Feed proyek & jasa
│   ├── profil/[id]/             ← Profil publik pelajar
│   └── api/                     ← REST API endpoints
│       ├── sekolah/
│       ├── pelajar/
│       ├── umkm/
│       ├── proyek/
│       └── siswa/
├── components/
│   ├── ui/                      ← Atom components (Button, Input, Card, Badge)
│   ├── layout/                  ← Navbar, Sidebar
│   └── marketplace/             ← ProyekCard, JasaCard
├── lib/
│   ├── prisma.ts                ← Prisma client singleton
│   ├── supabase.ts              ← Supabase client
│   ├── utils.ts                 ← cn(), formatRupiah(), dll
│   ├── kemendikdasmen.ts        ← API lookup NPSN sekolah
│   ├── rate-limiter.ts          ← Proteksi spam API
│   └── validate-npsn.ts         ← Validasi format NPSN
├── hooks/                       ← Custom React hooks
├── types/
│   └── index.ts                 ← Semua TypeScript types
└── proxy.ts                     ← Middleware deteksi device
```

## Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/Razerpoa/itechcup-2026.git
cd itechcup-2026
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root direktori (copy dari `.env.example`):

```bash
cp .env.example .env
```

Isi nilai-nilai berikut di `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mitramuda"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Jalankan Database (Docker)

```bash
docker compose up -d
```

### 4. Sinkronisasi Schema Database

```bash
npm run db:push
```

### 5. Seed Data Awal (Opsional)

```bash
npm run db:seed
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Perintah Tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | Cek kode dengan ESLint |
| `npm run db:push` | Push schema ke database |
| `npm run db:seed` | Seed dummy data |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |

## Fitur Platform

### Untuk Pelajar
- Daftar dan buat profil/portfolio
- Pasang listing jasa (contoh: Jasa Desain Logo, Jasa Entry Data)
- Lamar proyek dari UMKM
- Terima pembayaran via e-wallet (GoPay, OVO, Dana)
- Dashboard statistik proyek & penghasilan

### Untuk UMKM
- Daftar dan verifikasi akun
- Posting proyek dengan budget & sistem DP
- Browse katalog jasa pelajar
- Kelola lamaran & transaksi
- Ruang akad & chat dengan pelajar

### Untuk Sekolah
- Pantau pelajar yang terdaftar
- Verifikasi siswa (Approve/Tolak)
- Dashboard laporan kinerja & prestasi siswa
- Analitik: jumlah proyek selesai, total pendapatan siswa

## Alur Verifikasi

### Pelajar
1. Daftar akun → isi data diri + foto kartu pelajar
2. Kirim nama, NIS, kelas ke dashboard sekolah
3. Admin sekolah Approve/Tolak verifikasi

### UMKM
1. Daftar akun basic
2. Upload bukti legalitas: NIB/NPWP (fast approval) atau foto usaha + link medsos (manual review)
3. Setelah terverifikasi → bisa posting proyek

### Sekolah
1. Daftar dengan NPSN (auto-verifikasi via API Kemendikdasmen)
2. Nama sekolah dicek otomatis terhadap database pemerintah

## Alur Transaksi (Escrow Mock)

1. UMKM buat proyek → Pelajar lamar
2. UMKM pilih pelajar → Kesepakatan di Ruang Akad
3. UMKM bayar DP (dana ditahan platform)
4. Pelajar kerjakan → Submit hasil
5. UMKM review → Approve/Tolak
6. Jika Approve → Dana diteruskan ke e-wallet pelajar

## UI Theme

**Nama:** Collaborative Vitality  
**Font:** Plus Jakarta Sans  
**Primary:** Pastel Orange `#FF9B71`  
**Background:** Clean White `#FAFAFA`  
**Style:** Modern · Bersih · Youthful · Friendly · Professional

## API Reference

Lihat [`API.md.deprecated`](./API.md.deprecated) untuk referensi lama (tidak berlaku untuk versi saat ini).

Endpoint aktif:
- `GET/POST /api/sekolah` — CRUD sekolah
- `GET/POST /api/pelajar` — CRUD pelajar  
- `GET/POST /api/umkm` — CRUD UMKM
- `GET/POST /api/proyek` — CRUD proyek
- `GET/POST /api/siswa` — CRUD siswa (verifikasi)

## Kontribusi

Lihat [`CONTRIBUTING.md`](./CONTRIBUTING.md) untuk panduan kontribusi.

## Lisensi

[MIT License](./LICENSE)
