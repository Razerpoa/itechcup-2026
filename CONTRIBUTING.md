# Contributing to Mitra Muda (itechcup-2026)

Panduan kontribusi resmi untuk pengembangan dan pemeliharaan platform **Mitra Muda — Pemberdayaan Talenta Pelajar Indonesia**.

---

## 🚀 Quick Start

```bash
# 1. Clone repositori & checkout branch pengerjaan
git clone https://github.com/Razerpoa/itechcup-2026.git
cd itechcup-2026
git checkout kpn

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
cp .env.example .env
# Sesuaikan DATABASE_URL dan API Keys di .env

# 4. Sinkronisasi Database Prisma (PostgreSQL)
npm run db:push

# 5. Jalankan Local Development Server
npm run dev # http://localhost:3000
```

---

## 📁 Struktur Direktori Terkini

```
src/
├── app/
│   ├── (auth)/                   # Alur Autentikasi
│   │   ├── login/page.tsx        # Login terpadu (Manual + Google OAuth)
│   │   └── register/
│   │       ├── pelajar/page.tsx  # Registrasi Pelajar + Upload Bukti Kartu Pelajar (Base64)
│   │       ├── umkm/page.tsx     # Registrasi UMKM & Verifikasi Usaha
│   │       └── sekolah/page.tsx  # Registrasi Sekolah & Lookup NPSN Kemendikdasmen
│   ├── (dashboard)/              # Multi-Role Dashboard Shell
│   │   ├── pelajar/              # Dashboard Pelajar, Dompet Digital, Jasa, & Akad Transaksi
│   │   ├── sekolah/              # Dashboard Sekolah, Verifikasi Siswa, & Laporan Kinerja
│   │   └── umkm/                 # Dashboard UMKM, Deposit Modal, & Buat Lowongan Proyek
│   ├── (marketing)/
│   │   └── page.tsx              # Landing Page & Role Onboarding Selection
│   ├── marketplace/              # Marketplace Feed Proyek UMKM & Katalog Jasa Pelajar
│   ├── profil/[id]/              # Halaman Portofolio Publik & Rating Siswa
│   ├── tuan/                     # Portal Admin (Warm Editorial Design)
│   │   ├── login/page.tsx        # Login Admin Terproteksi Rate Limiter
│   │   └── page.tsx              # Dashboard Admin Verifikasi (Pelajar, UMKM, Sekolah, Escrow)
│   ├── api/                      # RESTful Backend API Endpoints
│   │   ├── auth/                 # login, admin-login, google-check, reset-password
│   │   ├── pelajar/              # CRUD Pelajar & Sanitized Select
│   │   ├── umkm/                 # CRUD UMKM & Verifikasi Legalitas
│   │   ├── sekolah/              # CRUD Sekolah & Integrasi Kemendikdasmen
│   │   ├── siswa/                # Endpoints Verifikasi Siswa oleh Sekolah
│   │   ├── proyek/               # Posting & Pengelolaan Lowongan Proyek
│   │   ├── jasa/                 # Listing Jasa Keahlian Siswa
│   │   ├── deposit/              # Manajemen Deposit UMKM & Bukti Transfer
│   │   ├── lamaran/              # Pengajuan Proposal Siswa
│   │   └── transaksi/            # Akad Transaksi & Escrow Vault
│   ├── globals.css               # Tailwind CSS v4 Theme Tokens (CSS-First)
│   └── layout.tsx                # Root Layout (Plus Jakarta Sans)
├── components/
│   ├── ui/                       # Atom Components: button, input, card, badge, modal
│   ├── layout/                   # Navbar, Sidebar, Footer
│   ├── marketplace/              # ProyekCard, JasaCard
│   └── two-factor-modal.tsx      # Modal 2FA Security
├── lib/
│   ├── prisma.ts                 # Prisma ORM v7 Client Singleton
│   ├── auth-server.ts            # Cookie & JWT Session Helper
│   ├── kemendikdasmen.ts         # Integrasi API NPSN Kementerian
│   ├── rate-limiter.ts           # In-Memory & IP Rate Limiter
│   ├── validate-npsn.ts          # Validator Format 8-Digit NPSN
│   ├── normalize-school-name.ts  # Normalisasi Nama & Singkatan Sekolah
│   ├── compare-school-names.ts   # Algoritma Pencocokan Nama Sekolah (EXACT / MINOR / CRITICAL)
│   ├── admin-verification-store.ts # State & Sync Store Verifikasi Admin
│   └── escrow-store.ts           # State & Sync Store Transaksi Escrow
└── types/
    └── index.ts                  # TypeScript Shared Type Definitions
```

---

## 🔒 Standar Keamanan Data (Security Guidelines)

Seluruh kontributor **wajib** mematuhi standar keamanan data berikut:

1. **Pencegahan Kebocoran Password (Zero Password Exposure):**
   - Field `password` / password hash **tidak boleh** disertakan dalam response API manapun (`GET`, `POST`, `PUT`, `PATCH`).
   - Gunakan klausa `select` spesifik atau destrukturisasi hapus password (`const { password: _, ...data } = raw`) sebelum mereturn JSON ke client.
2. **Enkripsi Password:**
   - Semua pembuatan akun baru wajib di-hash menggunakan `bcryptjs` dengan *salt rounds* minimal 10.
3. **Rate Limiting & Anti Brute-Force:**
   - Endpoint login sensitif (terutama Admin `/api/auth/admin-login`) dilindungi rate limiter 5 percobaan / 10 menit berbasis IP.
4. **Validasi Input Sanitasi:**
   - Validasi ketat format email, nomor WhatsApp, NIS numerik, dan 8-digit NPSN di level API sebelum masuk ke query database.
5. **Kebijakan Data Produksi:**
   - Database produksi hanya memuat data registrasi riil oleh pengguna. Data *seed / mock / dummy* tidak boleh dibiarkan bercampur di lingkungan produksi.

---

## 🎨 Design System: Collaborative Vitality

Desain antarmuka Mitra Muda mengutamakan estetika humanis, hangat, dan profesional (*tidak kaku/tidak menggunakan template AI cyberpunk generic*):

- **Warna Utama:** Pastel Orange (`#FF9B71`)
- **Aksen Gelap & Kontras:** Terracotta (`#964825`), Charcoal (`#2D2319`)
- **Latar Belakang:** Warm Off-White (`#FAFAFA`) & Warm Sand (`#F6F3EE`)
- **Tipografi:** Plus Jakarta Sans
- **Pill & Badge Radius:** `rounded-full` / `rounded-xl`
- **Card & Container Radius:** `rounded-2xl` / `rounded-3xl`

---

## 🧪 Pengujian & Testing

Pengujian menggunakan modul bawaan `node:test` berkecepatan tinggi:

```bash
# Jalankan seluruh unit test suite (44 tests)
node --import ./tsx-hooks.mjs --test

# Jalankan pengujian file spesifik
node --import ./tsx-hooks.mjs --test src/lib/validate-npsn.test.ts
node --import ./tsx-hooks.mjs --test src/lib/compare-school-names.test.ts
```

### Cakupan Pengujian:
- ✅ `pipeline.test.ts`: Integrasi pipeline pendaftaran & Kemendikdasmen.
- ✅ `compare-school-names.test.ts`: Pencocokan akurasi nama sekolah.
- ✅ `kemendikdasmen.test.ts`: Endpoint lookup NPSN & fallback review.
- ✅ `normalize-school-name.test.ts`: Normalisasi akronim (`SMKN` → `SMK NEGERI`).
- ✅ `rate-limiter.test.ts`: Rate limit memory tracking & sliding window.
- ✅ `validate-npsn.test.ts`: Validasi format string NPSN.

---

## 📋 Checklist Sebelum Push / Pull Request

Sebelum melakukan `git commit` dan `git push`:

1. **Jalankan Unit Test:**
   ```bash
   node --import ./tsx-hooks.mjs --test
   ```
   *Wajib 100% PASS.*
2. **Jalankan Production Build:**
   ```bash
   npm run build
   ```
   *Memastikan 0 error TypeScript dan 0 error kompilasi Next.js.*
3. **Konvensi Commit:**
   - `feat:` Fitur baru
   - `fix:` Perbaikan bug
   - `style:` Pembaruan UI/CSS & design system
   - `security:` Peningkatan keamanan & sanitasi data
   - `docs:` Dokumentasi & referensi
4. **Push ke Branch:**
   ```bash
   git push origin kpn
   ```

---

## 👥 Kontak Tim Pengembang

- **Inisiator & Lead Developer:** Raffa (`raffaxzee@gmail.com`)
- **WhatsApp:** 0895622494773
- **Dokumentasi Lengkap:** Lihat [`DOKUMENTASI.md`](./DOKUMENTASI.md)
