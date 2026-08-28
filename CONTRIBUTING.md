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
│   ├── syarat-ketentuan/         # Halaman Syarat & Ketentuan Layanan (HAKI & 0% Komisi)
│   ├── kebijakan-privasi/        # Halaman Kepatuhan UU PDP No. 27/2022
│   ├── perlindungan-pelajar/     # Pedoman Perlindungan Jam Wajib Belajar & Anti-Eksploitasi
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
│   └── escrow-store.ts           # State & Sync Store Transaksi Escrow
└── types/
    └── index.ts                  # TypeScript Shared Type Definitions
```

---

## 🤖 Integrasi AI Assistant (Google Gemini Multi-Tier Waterfall)

Asisten virtual Mitra Muda ditenagai oleh model **Google Gemini Flash** dengan arsitektur berjenjang (*waterfall*) dari tier paling hemat token ke tier tertinggi via `GEMINI_API_KEY`:

1. **Hirarki Model (Dari Paling Bawah/Hemat Token):**
   - 🟢 `gemini-3.1-flash-lite`: Tier awal, paling ringan dan hemat kuota token.
   - 🟡 `gemini-3.5-flash`: Tier kedua, dipanggil otomatis jika model lite mencapai batas rate limit.
   - 🟠 `gemini-3.6-flash`: Tier ketiga, dipanggil jika model sebelumnya penuh/habis.
   - 🔴 `gemini-3.7-flash`: Tier teratas, benteng terakhir sebelum kuota habis.
   - ❌ **Penanganan Kuota Penuh:** Jika seluruh model mencapai batas penggunaan, sistem mengembalikan status HTTP 429 dengan notifikasi resmi dan tombol alihkan ke CS WhatsApp (bukan jawaban palsu/statis).
2. **Mesin Pemformat Markdown Chat (`FormattedMessage`):**
   - Jawaban AI dirender rapi dengan pill badge penomoran bernuansa `#FFF1EB`, bullet points `#FF9B71`, dan pemisah antar bagian yang bersih.
   - Menghilangkan simbol markdown mentah yang menumpuk (seperti `--- ### 💡`).
3. **Konteks Multi-Peran:**
   - Memahami peran aktif pengguna (Pelajar, UMKM, atau Sekolah) untuk memberikan saran yang relevan dan kontekstual.

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

## 🔒 Standar Keamanan Data & Server (Security SSS-Tier)

Seluruh kontributor **wajib** mematuhi benteng keamanan tingkat SSS berikut:

1. **Perlindungan Kunci API AI (Zero Credential Exposure):**
   - Kunci `GEMINI_API_KEY` disimpan murni di server environment (`process.env`), dilarang keras dipaparkan ke client-side JavaScript.
   - **Output Redactor Engine:** Respon AI disaring secara otomatis via regex untuk menyensor string menyerupai API key (`AIzaSy...`), JWT (`eyJ...`), atau secret keys menjadi `[KREDENSIAL DILINDUNGI]`.
2. **Anti-Jailbreak & Prompt Injection Shield:**
   - Endpoint AI memvalidasi dan memblokir upaya eksploitasi seperti *"system prompt"*, *"ignore instructions"*, *"dump variables"*, atau *"developer mode"*.
   - Pesan input dibatasi maksimal 500 karakter dengan pembersihan karakter kontrol liar.
3. **Pencegahan Kebocoran Password (Zero Password Exposure):**
   - Field `password` / password hash **tidak boleh** disertakan dalam response API manapun (`GET`, `POST`, `PUT`, `PATCH`).
   - Gunakan klausa `select` spesifik atau destrukturisasi hapus password (`const { password: _, ...data } = raw`) sebelum mereturn JSON ke client.
4. **Enkripsi Password:**
   - Semua pembuatan akun baru dan ganti password wajib di-hash menggunakan `bcryptjs` dengan *salt rounds* minimal 10.
5. **Integritas Dokumen Asli (Zero Random Mock Images):**
   - Kartu Pelajar (`fotoKartuPelajar`), Bukti Legalitas UMKM (`buktiLegalitas`), dan Bukti Transfer **hanya boleh** menampilkan data dokumen asli yang diunggah oleh pendaftar (Base64 / URL aman).
   - Dilarang keras menggunakan URL foto acak/stok internet (seperti Unsplash) sebagai fallback dokumen legalitas. Jika belum ada dokumen, tampilkan status kosong secara jujur.
6. **Enterprise HTTP Security Headers (`next.config.ts`):**
   - `X-Frame-Options: SAMEORIGIN`: Menangkal serangan Clickjacking.
   - `X-Content-Type-Options: nosniff`: Mencegah MIME sniffing exploit.
   - `Strict-Transport-Security`: Memaksa HTTPS mutlak 2 tahun (`max-age=63072000; includeSubDomains; preload`).
   - `Referrer-Policy: strict-origin-when-cross-origin`: Menjaga privasi referrer token.
   - `Permissions-Policy`: Menonaktifkan akses kamera, mikrofon, dan sensor tanpa izin.
   - `Cache-Control: no-store, max-age=0` pada seluruh endpoint `/api/*`.
   - `poweredByHeader: false`: Menghilangkan header informasi framework.
7. **Rate Limiting Berlapis:**
   - Endpoint login sensitif: 5 percobaan / 10 menit.
   - Endpoint asisten AI (`aiRateLimiter`): 12 query / menit per IP.
8. **Standar Kode Bersih (Clean Code):**
   - File fungsional produksi harus bebas dari komentar kode baris yang tidak esensial demi kerapian dan efisiensi bundle.

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

## 🎓 Alur Verifikasi Siswa & ID Registrasi Baru

Untuk mempermudah sekolah dan siswa serta menjaga privasi data:

1. **Pemilihan Sekolah Otomatis dari Database:**
   - Siswa memilih sekolah yang sudah terdaftar di database Mitra Muda (`/api/sekolah`).
   - Sistem secara otomatis mengaitkan `sekolahId` di tabel `Pelajar` database PostgreSQL, sehingga siswa langsung terdaftar di antrean portal sekolah terkait.
2. **Generasi ID Registrasi Siswa:**
   - Setiap pendaftaran siswa menghasilkan ID unik format `MM-2026-XXXXX`.
   - Field yang tidak relevan seperti `namaIbu` telah dihilangkan dan `nisn` bersifat opsional.
3. **Persetujuan Cepat Guru (Quick Approve):**
   - Siswa dapat menyalin ID Registrasi dan mengirimkannya ke guru via WhatsApp.
   - Pihak sekolah di dashboard `/sekolah` memiliki kotak input *Verifikasi Cepat* untuk langsung menyetujui akun siswa berdasarkan ID Registrasi tersebut.
4. **Bebas Hambatan Email:**
   - Setelah pendaftaran, akun langsung aktif dengan sesi terotentikasi dan tombol langsung masuk ke dashboard, sehingga siswa/UMKM/sekolah tidak terhambat jika pengiriman email konfirmasi mengalami antrean/delay.
5. **Modal Penolakan & Pencabutan Status di Admin (`/tuan`):**
   - Menggantikan browser `prompt()` lama dengan Modal In-App modern untuk aksi Tolak dan Cabut Verifikasi, lengkap dengan pilihan kategori alasan (dokumen buram, data tidak sesuai, permintaan pencabutan, dll).
6. **Mutation Lock Mechanism & Pemulihan Akun (Anti Double-Click Bug):**
   - Menyelesaikan masalah race-condition polling background: `recordRecentMutation(id, status)` di `admin-verification-store.ts` mengunci status mutasi selama 10 detik. Background polling tidak akan menimpa (revert) status optimistik UI sebelum mutasi selesai di database PostgreSQL.
   - Database Prisma otomatis membersihkan `catatanPenolakan: null` saat akun yang sebelumnya ditolak dipulihkan kembali ke status `VERIFIED`.
   - Tombol aksi moderasi admin dilengkapi status loading `<Loader2 className="animate-spin" />` dan atribut `disabled` saat request sedang diproses.

---

## 🧾 Dokumen Resmi Digital & Surat Pengalaman Kerja

Untuk menjamin nilai nyata bagi dunia usaha dan masa depan pelajar:

1. **Komponen Modal Dokumen (`src/components/invoice-modal.tsx`):**
   - Mendukung dua mode tampilan cetak: `type="invoice"` dan `type="certificate"`.
   - Menggunakan utility `@media print` murni: saat tombol *Cetak / Simpan PDF* diklik, browser membuka print preview bersih format A4 tanpa navbar, sidebar, atau tombol dialog modal.
2. **Kwitansi / Faktur Kas Resmi UMKM:**
   - Diterbitkan dengan format nomor faktur unik: `INV-MM-[ID]-[TAHUN]`.
   - Mencantumkan identitas Klien UMKM, identitas Pelajar, rincian biaya proyek, status pelunasan, pencatatan DP rekening bersama, dan jaminan biaya platform 0% komisi bagi siswa.
   - Dilengkapi QR Code verifikasi digital keabsahan dokumen.
3. **Surat Keterangan Pengalaman Kerja Industri Pelajar:**
   - Diterbitkan dengan nomor registrasi sertifikasi: `CERT-MM-[ID]-VOKASI`.
   - Menerangkan bahwa siswa dari sekolah kejuruan/menengah terkait telah berhasil menyelesaikan proyek industri riil dari UMKM dengan mutu memuaskan dan rating kepuasan bintang.
   - Diakui sebagai portofolio kerja nyata untuk lampiran lamaran PKL/magang atau kerja setelah lulus sekolah.

---

## 🛡️ Kepatuhan Regulasi, Keamanan Data & Etika Publik

Sebagai platform publik nasional, Mitra Muda mematuhi regulasi ketat:

1. **Kepatuhan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP):**
   - Halaman resmi `/kebijakan-privasi` menjamin data pribadi pelajar di bawah umur (seperti foto kartu pelajar, NISN, dan kontak) tidak pernah diperjualbelikan kepada pihak ketiga.
   - Mendukung hak subjek data (*Right to Access & Right to be Forgotten*).
2. **Pedoman Perlindungan Talenta Pelajar (`/perlindungan-pelajar`):**
   - Perlindungan waktu wajib belajar: pengerjaan proyek dilarang mengganggu jam sekolah, tugas kurikulum, dan waktu istirahat malam siswa.
   - Larangan kerja paksa atau eksploitatif dan kewajiban kompensasi yang adil dan transparan.
   - Larangan pertemuan fisik luring (offline) berdua saja antara klien dan pelajar tanpa pendampingan pihak sekolah atau orang tua/wali.
   - Hotline darurat aduan perlindungan anak & mediasi: `lapor@mitramuda.biz.id`.
3. **Syarat & Ketentuan Layanan (`/syarat-ketentuan`):**
   - Penegasan hak kekayaan intelektual (HAKI): hak cipta otomatis beralih sah ke klien UMKM setelah pembayaran lunas 100%, sementara pelajar memegang hak moral portofolio non-komersial.
   - Komisi 0% bagi pelajar demi pemenuhan hak ekonomi siswa seutuhnya.

---

## 💬 Fitur Interaksi: Template Penawaran & WhatsApp Coordinator

1. **Template Penawaran Sopan Siswa (`/marketplace/[id]`):**
   - Tombol *"✨ Template Sopan"* di modal proposal otomatis menyusun pengantar penawaran yang santun, menyebutkan nama sekolah dan kesiapan bekerja secara disiplin, membantu siswa vokasi yang baru pertama kali berinteraksi dengan dunia usaha.
2. **WhatsApp Direct Coordinator (`/umkm/transaksi/[id]` & `/pelajar/transaksi/[id]`):**
   - Tombol *"WA Siswa"* dan *"WA UMKM"* memformat tautan `https://wa.me/?text=...` dengan parameter judul proyek dan URL ruang akad transaksi untuk komunikasi cepat tanpa ribet menyalin nomor secara manual.

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

## 👥 Tim Developer & Kontak

| Nama | Peran | GitHub |
| :--- | :--- | :--- |
| **Raffa Rizqi Ramdani** | Project Lead & Full Stack Developer | [@RaffaRizqi](https://github.com/RaffaRizqi) |
| **Faaiz Hamdy** | Frontend Developer & UI/UX Designer | [@Faaizhamdhy](https://github.com/Faaizhamdhy) |
| **Fathan Assidqi Dwipayana** | Backend Developer | [@Razerpoa](https://github.com/Razerpoa) |

- **Inisiator & Lead Developer:** Raffa (`raffaxzee@gmail.com`)
- **WhatsApp:** 0895622494773
- **Dokumentasi Lengkap:** Lihat [`DOKUMENTASI.md`](./DOKUMENTASI.md)
