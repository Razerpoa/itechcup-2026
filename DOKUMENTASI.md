# Dokumentasi Proyek: Mitra Muda (Platform Talenta Pelajar Indonesia)

Dokumen ini merupakan rekam jejak teknis, arsitektur sistem, dan spesifikasi fitur dari proyek **Mitra Muda**. Dokumen ini dirancang sebagai referensi utama (Single Source of Truth) bagi tim *developer* yang akan melanjutkan, memelihara, atau menambahkan fitur baru di masa mendatang.

---

## 👨‍💻 Inisiator & Pengembang Utama (Tahap 1)
**Nama:** Raffa (Raffa)  
**Email:** raffaxzee@gmail.com  
**WhatsApp:** 0895622494773  
**Periode Pengerjaan:** Agustus 2026  

*Tahap 1 mencakup perancangan sistem dari nol (scratch), pembuatan seluruh alur basis data, integrasi frontend & backend, sistem keamanan, hingga kesiapan deployment ke server produksi.*

---

## 🏗️ 1. Arsitektur & Tech Stack
Proyek ini dibangun menggunakan standar pengembangan web modern dengan performa tinggi:
*   **Core Framework:** Next.js 16.3.1 (App Router, Turbopack).
*   **UI & Styling:** Tailwind CSS v4, dikonfigurasi secara *CSS-first* pada `globals.css`. Menggunakan Design System "Collaborative Vitality" (Warna Utama: Pastel Orange `#FF9B71`, Gelap: `#964825`).
*   **Bahasa Pemrograman:** TypeScript 5 (Strict Mode) & React 19.2.8.
*   **Database ORM:** Prisma v7 (`@prisma/client`).
*   **Database Engine:** PostgreSQL (berjalan dengan `@prisma/adapter-pg`).
*   **State Management:** React Hooks, API Data Fetching, dan kombinasi LocalStorage (sebagai *in-memory cache* untuk verifikasi).

---

## 🗄️ 2. Struktur Database (Schema Prisma)
Sistem database dirancang secara relasional (RDBMS) untuk mendukung 3 entitas pengguna yang saling berinteraksi:

1.  **Model `Pelajar` & `PelajarProfile`**
    *   Menyimpan data siswa (NIS/NISN, Nama, Email).
    *   Terkoneksi *One-to-One* ke `PelajarProfile` yang memuat biodata, Portofolio, Skill, Rating, Nomor WhatsApp (`kontakWa`), dan rincian E-Wallet (Bank/Gopay/Dana).
2.  **Model `UMKM`**
    *   Menyimpan entitas bisnis (Nama Usaha, Pemilik, Email, Nomor WA, Alamat).
    *   UMKM mempublikasikan `Proyek` dan melakukan transaksi dengan Pelajar.
3.  **Model `Sekolah`**
    *   Menyimpan institusi (NPSN unik, Nama Sekolah, Alamat).
    *   Sekolah memiliki relasi *One-to-Many* dengan Pelajar (satu sekolah menaungi banyak siswa).
4.  **Model Pekerjaan: `Jasa` & `Proyek`**
    *   `Jasa`: Layanan yang dijual oleh Pelajar (mendukung harga paket Basic, Standard, Premium).
    *   `Proyek`: Lowongan yang dipublikasikan UMKM lengkap dengan Budget dan persentase DP.
5.  **Model Transaksi: `Lamaran` & `Transaksi`**
    *   `Lamaran`: Pengajuan proposal dari pelajar ke UMKM.
    *   `Transaksi`: Sistem "Akad" digital yang mencatat status pekerjaan (`PENDING`, `PROSES`, `SELESAI`) serta alur pembayaran *Escrow*.

---

## 🔐 3. Sistem Autentikasi & Pendaftaran (Authentication Logic)
Sistem login dirancang sangat fleksibel namun ketat di sisi server:

*   **Google OAuth & Registrasi Manual:** Mendukung login instan via Google (tanpa password) atau registrasi formulir manual.
*   **Penanganan Error Database Otomatis (NIS Auto-Generate):** Pada PostgreSQL, field `nis` bersifat unik. Jika pelajar mendaftar manual *tanpa* mengisi NIS/NISN, sistem backend (`POST /api/pelajar`) secara cerdas akan me-nolak pengiriman string kosong `""` yang memicu error `P2002 Unique Constraint`, dan menggantinya dengan ID terenkripsi (misal: `NIS-48932498`).
*   **Integrasi Kemendikdasmen & Fallback System:** Pendaftaran Sekolah terhubung ke API NPSN Kementerian. Jika server kementerian *down* atau NPSN tidak ditemukan, backend tidak memblokir pendaftar, melainkan menyimpan sekolah tersebut dengan status `PENDING_REVIEW` agar bisa ditinjau manual oleh admin.
*   **Penyimpanan Registri Lokal:** Seluruh form registrasi tersinkronisasi ke `localStorage` (`mitra_muda_all_registered_users_v1`), memastikan dasbor admin dapat langsung mendeteksi pendaftar sedetik setelah mereka menekan tombol "Daftar".

---

## 🎓 4. Alur Kerja (Workflow) Dashboard Pelajar
*Lokasi: `src/app/(dashboard)/pelajar`*
*   **Real-time Verifikasi:** Saat siswa diverifikasi oleh Admin/Sekolah, badge mereka di dashboard secara *live* berubah menjadi hijau ("Terverifikasi") berkat interval sinkronisasi data API.
*   **Dompet Digital (E-Wallet):** Sistem pelacakan finansial siswa. Siswa dapat melihat riwayat penghasilan, jumlah saldo yang ditahan di sistem Escrow, dan mengajukan "Tarik Saldo".
*   **Manajemen Jasa:** UI untuk menambah, mengedit, dan menghapus layanan (*Jasa*) yang ditawarkan ke UMKM.
*   **Ruang Akad (Transaksi):** Halaman khusus per proyek tempat Pelajar dan UMKM berdiskusi, menyepakati nilai akhir, dan menyelesaikan pekerjaan.

---

## 🏪 5. Alur Kerja (Workflow) Dashboard UMKM
*Lokasi: `src/app/(dashboard)/umkm`*
*   **Manajemen Proyek:** UMKM dapat memposting pekerjaan, mengatur anggaran, dan meninjau pelamar (Pelajar) yang mengirimkan proposal.
*   **Sistem Escrow / Deposit:** Untuk keamanan siswa, UMKM yang menyetujui pekerja wajib membayarkan DP/Biaya penuh yang akan ditahan (Escrow) oleh sistem Mitra Muda. Dana baru diteruskan ke siswa saat UMKM menekan tombol "Proyek Selesai".

---

## 🏫 6. Alur Kerja Dashboard Sekolah & Master Admin (Tuan)
*Lokasi Sekolah: `src/app/(dashboard)/sekolah` | Lokasi Admin: `src/app/tuan`*
*   **Kontrol Verifikasi:** Sekolah dapat melihat daftar siswanya, sementara Tuan (Master Admin) dapat mengontrol *semua* Pelajar, UMKM, dan Sekolah.
*   **Direct WhatsApp Connect:** Tuan (Admin) dapat langsung menghubungi pendaftar (terutama yang bermasalah/pending) melalui tautan API WhatsApp otomatis yang membaca kolom `nomorWa` / `kontakWa` aktual dari database PostgreSQL pengguna.
*   **Analitik Dashboard:** Ringkasan statistik performa (Total Pengguna, Transaksi Aktif, Volume Keuangan).

---

## 🚀 7. Pembersihan & Kesiapan Produksi (Production Ready)
Sebelum proyek ini diserahkan untuk Tahap 2, Raffa telah memastikan sistem bersih dan siap dipublikasikan:
*   **Zero Dummy Data:** Seluruh data demo statis (`isDemoPelajar`, mock projects, mock services) telah **dimusnahkan** dari source code. Seluruh aplikasi membaca 100% data riil dari database.
*   **Full Build Passed:** Kode dikompilasi menggunakan `npm run build` dan **LULUS 100%** (Seluruh 34 halaman dan rute API). Tidak ada error TypeScript, rute yang bocor, maupun komponen yang gagal di-*render*.

---
---

## 🛠️ [Area Pengembangan Tim - Tahap 2]
*(Bagi anggota tim developer yang bergabung setelah Agustus 2026, silakan dokumentasikan perubahan, penambahan fitur, atau perbaikan bug yang Anda kerjakan di bawah baris ini. Format wajib mencantumkan Nama, Kontak, Tanggal, dan Deskripsi Perubahan).*

### [Contoh: Pembuatan Fitur Chat Real-Time]
**Nama:** [Nama Anggota Tim]
**Kontak:** [Email/WA]
**Tanggal:** [Tanggal Penyelesaian]
**Deskripsi Perubahan:**
*   Menambahkan WebSocket (Socket.io) untuk live chat di ruang Akad.
*   Membuat tabel `Messages` di database Prisma.
*   *Detail lainnya...*

*(Tambahkan pembaruan tim di bawah ini...)*

---

## 🔄 CHANGELOG — Sesi Pengembangan Agustus 2026

> **Developer:** Raffa Rizqi Ramdani (@Razerpoa)  
> **Tanggal:** 22–25 Agustus 2026  
> **Domain Live:** https://www.mitramuda.biz.id

---

### [v1.1.0] — 25 Agustus 2026 · Keamanan & Bug Fix

#### 🔒 Keamanan

**Admin Login — Server-Side Rate Limiting**
- **File baru:** `src/app/api/auth/admin-login/route.ts`
- **Masalah sebelumnya:** Rate limiter hanya berbasis `useRef` di browser → bisa di-bypass dengan refresh halaman atau ganti IP
- **Solusi:** Endpoint server baru menggunakan `RateLimiter` berbasis IP (`x-forwarded-for`)
  - Lockout 10 menit setelah 5x gagal
  - Tidak bisa di-bypass dengan refresh/tab baru
  - Login berhasil → menerbitkan `HttpOnly cookie` admin session (TTL 8 jam)
- `src/app/tuan/login/page.tsx` — form sekarang POST ke `/api/auth/admin-login`

**Google OAuth — Perbaikan Bypass Dashboard**
- **File:** `src/app/api/auth/google-check/route.ts`
- **Masalah:** User baru yang belum daftar bisa langsung masuk dashboard via Google Login (auto-create akun tanpa pilih role)
- **Perbaikan:** Route sekarang hanya mengecek DB, **tidak pernah auto-create**. Jika email tidak ditemukan → return `{ exists: false }` → redirect ke halaman pilih role (`/?google_new=1`) → user wajib mendaftar terlebih dahulu
- **File:** `src/app/(auth)/login/page.tsx` — handle `exists: false` → simpan email ke `sessionStorage` → redirect ke halaman onboarding

#### 🐛 Bug Fix

**Registrasi Akun Gagal di Production (IPv6 vs IPv4)**
- **Masalah:** Vercel serverless (AWS) tidak bisa connect ke Supabase via IPv6 (direct host, port 5432)
- **Solusi:** `DATABASE_URL` di `.env` diganti ke **IPv4 Connection Pooler** Supabase:
  ```
  aws-0-ap-northeast-2.pooler.supabase.com:6543
  ```
- Registrasi Pelajar, UMKM, dan Sekolah kini berhasil di production

**Saldo Mobile Menembus Card**
- **File:** `src/app/(dashboard)/pelajar/dompet/page.tsx`
- Tambah `overflow-hidden` pada wrapper card saldo
- Font size diubah dari `text-3xl sm:text-4xl` → `text-2xl sm:text-3xl`
- Tambah `break-all min-w-0 leading-tight` pada elemen nominal
- Tambah `flex-wrap gap-2` + `shrink-0` pada header badge

#### ✨ Fitur

**JWT Session Cookie pada Registrasi**
- **File:** `src/app/api/pelajar/route.ts`, `src/app/api/umkm/route.ts`
- Setelah registrasi berhasil, server langsung menerbitkan `HttpOnly JWT session cookie`
- User tidak perlu login ulang setelah mendaftar

**Verifikasi UMKM di Panel Admin**
- Tab "Verifikasi UMKM" di `/tuan` sudah terhubung ke database PostgreSQL
- Tombol "Setujui" → `PATCH /api/umkm/[id]` → update `isVerified: true`
- Tombol "Cabut" → update `isVerified: false`
- **File terkait:** `src/lib/admin-verification-store.ts`, `src/app/api/umkm/[id]/route.ts`

---

### [v1.1.0-ui] — 25 Agustus 2026 · Redesign UI Admin

#### 🎨 Admin Login Page (`/tuan/login`)
Total redesign dari tampilan sederhana ke **dark cyberpunk premium**:
- Background `#050A14` dengan CSS grid cyber lines
- Terminal-style header bar dengan "traffic lights" (●●●) dan `MITRA-MUDA://ADMIN — RESTRICTED`
- Card glassmorphism dark `#0D1117` dengan box shadow glow orange
- Icon Lock dengan **pulse ring animation** (ping 3 detik)
- Button submit dengan **shimmer effect** saat hover
- Loading state: spinner + teks monospace `AUTHENTICATING...`
- State terkunci: ikon Lock + pesan lockout berwarna orange

#### 🎨 Admin Dashboard (`/tuan`)
Upgrade visual sidebar + header ke **dark premium**:

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Background | `#F8FAFC` | `#0A0F1A` |
| Sidebar | `bg-white` | `bg-[#0D1117]` |
| Nav item aktif | orange muda | `bg-[#FF9B71]/10` + border glow |
| Badge pending | abu-abu | `bg-red-500/20 text-red-400` |
| Header bar | putih | `bg-[#0D1117]/95 backdrop-blur` |
| Live indicator | static | `animate-pulse` (berkedip) |
| Subtitle | plain text | `font-mono mitra-muda://admin` |

---

### [v1.0.x] — 22 Agustus 2026 · Domain & Git

- **Domain:** Ganti dari `mitramuda.my.id` → `mitramuda.biz.id` (alias Vercel)
- **Git History Rewrite:** Seluruh commit di-rewrite via `git filter-branch` → author diseragamkan ke `Raffa Rizqi Ramdani <raffarizki2010@gmail.com>` (@Razerpoa)

---

### 📌 Known Issues & TODO (Per 25 Agustus 2026)

- [ ] **Admin credentials hardcoded** di `src/app/api/auth/admin-login/route.ts` — pindah ke Vercel Env Vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- [ ] **Rate limiter admin in-memory** — reset saat Vercel cold start. Upgrade ke Upstash Redis untuk production-grade
- [ ] **Halaman `/` belum tampilkan notif** saat redirect dari Google OAuth baru (`?google_new=1`) — tambahkan UI toast/banner
- [ ] **2FA admin** masih berbasis `localStorage` (client-side) — pertimbangkan TOTP server-side
