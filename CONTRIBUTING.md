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
# Sesuaikan DATABASE_URL, RESEND_API_KEY, dan Google OAuth di .env

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
│   │   ├── login/page.tsx        # Login terpadu (Manual + Google OAuth + Modal Lupa Password)
│   │   └── register/
│   │       ├── pelajar/page.tsx  # Registrasi Pelajar + Layar Verifikasi Email
│   │       ├── umkm/page.tsx     # Registrasi UMKM & Verifikasi Bukti Legalitas
│   │       └── sekolah/page.tsx  # Registrasi Sekolah & Lookup NPSN Kemendikdasmen
│   ├── (dashboard)/              # Multi-Role Dashboard Shell
│   │   ├── pelajar/              # Dashboard Pelajar, Dompet Digital, Jasa, & Akad Transaksi
│   │   ├── sekolah/              # Dashboard Sekolah, Verifikasi Siswa, & Laporan Kinerja
│   │   └── umkm/                 # Dashboard UMKM, Deposit Modal, & Buat Lowongan Proyek
│   ├── (marketing)/
│   │   └── page.tsx              # Landing Page & Role Onboarding Selection
│   ├── auth/
│   │   └── callback/page.tsx     # Callback Handler (Verifikasi Email Signup & Reset Password Form)
│   ├── marketplace/              # Marketplace Feed Proyek UMKM & Katalog Jasa Pelajar
│   ├── profil/[id]/              # Halaman Portofolio Publik & Rating Siswa
│   ├── tuan/                     # Portal Admin (Warm Editorial Design)
│   │   ├── login/page.tsx        # Login Admin Terproteksi Rate Limiter
│   │   └── page.tsx              # Dashboard Admin Verifikasi (Pelajar, UMKM, Sekolah, Escrow)
│   ├── api/                      # RESTful Backend API Endpoints
│   │   ├── ai/
│   │   │   └── assistant/route.ts # Google Gemini AI Chat Assistant Endpoint (1.5-Flash & 2.0-Flash)
│   │   ├── auth/                 # login, admin-login, google-check, reset-password (POST & PUT)
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
│   ├── ui/                       # Atom Components: button, input, card, badge, modal, strength meter
│   ├── layout/                   # Navbar, Sidebar, Footer
│   ├── marketplace/              # ProyekCard, JasaCard
│   ├── ai-assistant.tsx          # Widget Terpadu AI Chatbot (Google Gemini) & CS WhatsApp
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
│   └── escrow-store.ts           # State & Sync Store Transaksi Escrow
└── types/
    └── index.ts                  # TypeScript Shared Type Definitions
```

---

## 🤖 Integrasi AI Assistant (Google Gemini API)

Asisten virtual Mitra Muda ditenagai oleh model **Google Gemini Flash** (`gemini-1.5-flash` / `gemini-2.0-flash`) via `GEMINI_API_KEY`:

- **Endpoint API:** `POST /api/ai/assistant`
- **Knowledge Base:** Terkonfigurasi dengan panduan resmi Mitra Muda (sistem escrow, penarikan saldo e-wallet tanpa KTP/bank, verifikasi NPSN Kemendikdasmen, alur pendaftaran, dan kontak CS).
- **Multi-Role Context:** Memahami peran pengguna aktif (Pelajar, UMKM, atau Sekolah) untuk memberikan jawaban yang tepat sasaran.
- **Smart Fallback:** Dilengkapi penanganan luring otomatis jika koneksi atau kuota API terganggu.

---

## 📧 Sistem Notifikasi & Verifikasi Email (Resend + Supabase)

Platform menggunakan integrasi domain resmi **`mitramuda.raffzdigital.biz.id`** untuk seluruh alur pengiriman email:

1. **Konfigurasi Pengirim (Sender Identity):**
   - **Sender:** `Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>`
   - **Host SMTP:** `smtp.resend.com` (Port 465 SSL)
2. **Alur Pendaftaran (Email Verification):**
   - Registrasi Pelajar, UMKM, dan Sekolah tidak langsung dialihkan ke dashboard.
   - Sistem mengirimkan email konfirmasi berdesain resmi dan menampilkan layar notifikasi *"Cek Email Anda"*.
   - Saat tautan di Gmail diklik (`/auth/callback?type=signup`), sistem memvalidasi token dan otomatis mengarahkan ke dashboard masing-masing.
3. **Alur Pemulihan Kata Sandi (Reset Password):**
   - Pengguna meminta reset di `/login`. Sistem memvalidasi email di database PostgreSQL dan mengirimkan tautan pemulihan.
   - Saat tautan diklik (`/auth/callback?type=recovery`), pengguna diarahkan ke formulir *"Atur Kata Sandi Baru"* dengan indikator keamanan kata sandi.
   - Setelah disimpan (`PUT /api/auth/reset-password`), password baru di-hash dengan `bcryptjs` dan pengguna langsung masuk ke dashboard tanpa perlu login ulang.

---

## 🔒 Standar Keamanan Data (Security Guidelines)

Seluruh kontributor **wajib** mematuhi standar keamanan data berikut:

1. **Pencegahan Kebocoran Password (Zero Password Exposure):**
   - Field `password` / password hash **tidak boleh** disertakan dalam response API manapun (`GET`, `POST`, `PUT`, `PATCH`).
   - Gunakan klausa `select` spesifik atau destrukturisasi hapus password (`const { password: _, ...data } = raw`) sebelum mereturn JSON ke client.
2. **Enkripsi Password:**
   - Semua pembuatan akun baru dan ganti password wajib di-hash menggunakan `bcryptjs` dengan *salt rounds* minimal 10.
3. **Integritas Dokumen Asli (Zero Random Mock Images):**
   - Kartu Pelajar (`fotoKartuPelajar`), Bukti Legalitas UMKM (`buktiLegalitas`), dan Bukti Transfer **hanya boleh** menampilkan data dokumen asli yang diunggah oleh pendaftar (Base64 / URL aman).
   - Dilarang keras menggunakan URL foto acak/stok internet (seperti Unsplash) sebagai fallback dokumen legalitas. Jika belum ada dokumen, tampilkan status kosong secara jujur.
4. **Rate Limiting & Anti Brute-Force:**
   - Endpoint login sensitif (terutama Admin `/api/auth/admin-login`) dilindungi rate limiter 5 percobaan / 10 menit berbasis IP.
5. **Validasi Input Sanitasi:**
   - Validasi ketat format email, nomor WhatsApp, NIS numerik, dan 8-digit NPSN di level API sebelum masuk ke query database.
6. **Kebijakan Data Produksi:**
   - Database produksi hanya memuat data registrasi riil oleh pengguna. Data *seed / mock / dummy* tidak boleh dibiarkan bercampur di lingkungan produksi.

---

## 🎨 Design System: Collaborative Vitality

Desain antarmuka Mitra Muda mengutamakan estetika humanis, hangat, dan profesional (*clean editorial product design*):

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
node --import ./tsx-hooks.mjs --test (Get-ChildItem test -Recurse -Filter *.test.ts).FullName

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
   node --import ./tsx-hooks.mjs --test (Get-ChildItem test -Recurse -Filter *.test.ts).FullName
   ```
   *Wajib 100% PASS (44/44).*
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
