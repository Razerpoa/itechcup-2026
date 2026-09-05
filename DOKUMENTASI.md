# Dokumentasi Proyek: Mitra Muda (Platform Talenta Pelajar Indonesia)

Dokumen ini merupakan rekam jejak teknis, arsitektur sistem, dan spesifikasi fitur dari proyek **Mitra Muda**. Dokumen ini dirancang sebagai referensi utama (Single Source of Truth) bagi tim pengembang untuk pemeliharaan dan pengembangan fitur.

---

## Tim Pengembang & Inisiator

- **Raffa Rizqi Ramdani** — Project Lead & Full Stack Developer (`raffaxzee@gmail.com` / WhatsApp: 0895622494773)
- **Faaiz Hamdy** — Frontend Developer & UI/UX Designer
- **Fathan Assidqi Dwipayana** — Backend Developer

---

## 1. Arsitektur & Tech Stack

Proyek ini dibangun menggunakan standar pengembangan web modern dengan performa tinggi:
- **Core Framework:** Next.js 16.3.1 (App Router, Turbopack).
- **UI & Styling:** Tailwind CSS v4, dikonfigurasi secara CSS-first pada `globals.css`. Menggunakan Design System "Collaborative Vitality" (Warna Utama: Pastel Orange `#FF9B71`, Gelap: `#964825`, Charcoal: `#2D2319`, Sand: `#F6F3EE`).
- **Bahasa Pemrograman:** TypeScript 5 (Strict Mode) & React 19.2.8.
- **Database ORM:** Prisma v7 (`@prisma/client`).
- **Database Engine:** PostgreSQL (berjalan dengan `@prisma/adapter-pg` driver adapter).
- **State Management & Real-Time Sync:** React Hooks, `useSyncExternalStore`, `BroadcastChannel('mitra_muda_chat_sync')`, dan bidirectional HTTP polling (`/api/transaksi` & `/api/deposit`).
- **AI Integration:** Google Gemini Flash API (`gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`) dengan sanitasi kredensial otomatis.
- **Email Service:** Resend API (`noreply@mitramuda.raffzdigital.biz.id`).

---

## 2. Struktur Database (Schema Prisma)

Sistem database dirancang secara relasional (RDBMS) untuk mendukung 3 entitas pengguna yang saling berinteraksi:

1. **Model `Pelajar` & `PelajarProfile`**
   - Menyimpan data siswa (NIS, Nama, Email, Password Hash bcryptjs).
   - Terkoneksi One-to-One ke `PelajarProfile` yang memuat biodata, Portofolio, Skill, Rating, Nomor WhatsApp (`kontakWa`), dan preferensi E-Wallet (GoPay, DANA, OVO, ShopeePay).
2. **Model `UMKM`**
   - Menyimpan entitas bisnis (Nama Usaha, Pemilik, Email, Nomor WA, Alamat, NIB/NPWP, Bukti Legalitas, Status Verifikasi).
   - UMKM mempublikasikan `Proyek` dan melakukan transaksi dengan Pelajar.
3. **Model `Sekolah`**
   - Menyimpan institusi (NPSN unik 8-digit, Nama Sekolah, Email Resmi, Alamat, Penanggung Jawab, Status Verifikasi Kemendikdasmen).
   - Sekolah memiliki relasi One-to-Many dengan Pelajar (satu sekolah menaungi banyak siswa).
4. **Model Pekerjaan: `Jasa` & `Proyek`**
   - `Jasa`: Layanan yang dijual oleh Pelajar (mendukung harga paket Basic, Standard, Premium).
   - `Proyek`: Lowongan yang dipublikasikan UMKM lengkap dengan Budget dan persentase DP.
5. **Model Transaksi: `Lamaran` & `Transaksi`**
   - `Lamaran`: Pengajuan proposal dari pelajar ke UMKM.
   - `Transaksi`: Sistem Akad digital yang mencatat status pekerjaan (`MENUNGGU_PEMBAYARAN`, `DP_DIBAYAR`, `DIKERJAKAN`, `MENUNGGU_REVIEW`, `SELESAI`) serta alur pembayaran Escrow.
6. **Model Komunikasi & Serah Terima: `ChatMessage` & `DeliverableWork`**
   - `ChatMessage`: Menyimpan seluruh riwayat obrolan ruang transaksi, lampiran file/gambar, dan identitas pengirim langsung di tabel PostgreSQL.
   - `DeliverableWork`: Menyimpan seluruh catatan dan berkas serah terima karya siswa secara permanen di database, terbebas dari batasan kuota localStorage browser.
7. **Model Gateway Pembayaran: `DepositTransaction`**
   - Menyimpan seluruh transaksi tagihan deposit UMKM via payment gateway Pakasir (orderId unik, nominal, status PENDING/APPROVED/REJECTED, URL QRIS, QRIS string, URL pembayaran Pakasir Pay, waktu verifikasi).

---

## 3. Fitur Utama yang Telah Selesai Dikerjakan

### A. Pengunggahan Berkas Karya Siswa Langsung dari Perangkat (Direct Device File Picker)
- **Lokasi:** `src/app/(dashboard)/pelajar/transaksi/[id]/page.tsx`
- **Spesifikasi:**
  - Tombol **Foto dari Galeri / Kamera** (`accept="image/*"`) untuk penyerahan karya berbasis visual atau desain.
  - Tombol **Berkas dari Folder (ZIP/PDF)** (`accept="*/*"`) untuk penyerahan file dokumen, source code, dan arsip zip tanpa batasan format.
  - Pratinjau kartu berkas otomatis dengan nama file, ukuran asli dalam KB/MB, dan status siap serahkan.
  - Dukungan link cloud eksternal (Google Drive / Figma) sebagai opsi alternatif.
  - Saat berkas dikirim, status akad otomatis beralih ke tahap 3 (*Karya Diserahkan & Sedang Ditinjau UMKM*).

### B. Kontrol Status Proyek Mandiri & Moderasi Admin
- **Lokasi:**
  - UMKM: `src/app/(dashboard)/umkm/page.tsx` & `src/app/(dashboard)/umkm/transaksi/[id]/page.tsx`
  - Admin: `src/app/tuan/page.tsx`
- **Spesifikasi:**
  - **UMKM:** Kontrol langsung status proyek (*Pengerjaan*, *Review UMKM*, *Selesai*) pada dashboard dan ruang transaksi dengan modal rating & ulasan bintang.
  - **Admin Panel (`/tuan`):** Tabel kontrol transaksi proyek pada tab *Escrow Vault* dilengkapi dua tombol aksi langsung:
    1. **Minta Revisi**: Mengembalikan status proyek ke tahap 2 (*Dalam Pengerjaan / Revisi*) dan mengirim notifikasi revisi ke siswa.
    2. **Done & Cairkan**: Menyelesaikan transaksi ke tahap 4 (*Selesai & Lunas*), mencairkan dana escrow secara otomatis ke dompet siswa, dan menandai `fullPaid: true`.

### C. Dompet Siswa & Kalkulasi Saldo Idempotent
- **Lokasi:** `src/lib/escrow-store.ts`, `src/app/(dashboard)/pelajar/dompet/page.tsx`, `src/app/(dashboard)/pelajar/page.tsx`
- **Spesifikasi:**
  - Pelepasan dana escrow diproteksi *idempotent* sehingga tidak dapat dieksekusi lebih dari 1 kali per nomor proyek.
  - Saldo dihitung akurat dari formula:
    `Saldo Siap Cair = Total Nilai Riil Proyek Selesai - Total Penarikan yang Telah Diproses`
  - Tampilan saldo konsisten antara dashboard siswa dan dompet pencairan.

### D. Integrasi Logo Resmi Kanal Pembayaran E-Wallet
- **Lokasi:** `src/app/(dashboard)/pelajar/dompet/page.tsx`, `public/images/wallets/`
- **Spesifikasi:**
  - Pemasangan logo resmi untuk 4 penyedia e-wallet:
    1. **GoPay**
    2. **DANA**
    3. **OVO**
    4. **ShopeePay**
  - Kartu pemilih e-wallet modern dengan preset nominal penarikan cepat (Rp 100rb, Rp 250rb, Rp 500rb, Rp 1jt).

### E. Sinkronisasi Dua Arah Real-Time Penarikan Dana Siswa (Bidirectional Sync)
- **Lokasi:** `src/app/api/deposit/route.ts`, `src/lib/escrow-store.ts`, `src/app/tuan/page.tsx`
- **Spesifikasi:**
  - Pengajuan penarikan dana siswa dikirim ke backend melalui endpoint `POST /api/deposit` dengan tipe `WITHDRAWAL` dan `SYNC`.
  - Admin Panel (`/tuan`) melakukan sinkronisasi otomatis setiap 2 detik. Semua pengajuan penarikan langsung muncul di tab *Penarikan Siswa* dengan status *Menunggu* (Pending).
  - Admin dapat menyetujui (*Setujui*) atau menolak (*Tolak*) penarikan, yang langsung disebarkan ke perangkat siswa secara real-time.

### F. Responsivitas Mobile & Dynamic Viewport Height
- **Lokasi:** `src/app/(dashboard)/*`
- **Spesifikasi:**
  - Penggunaan CSS Dynamic Viewport: `h-[calc(100dvh-5rem)] min-h-[580px] max-h-[900px]`.
  - Memastikan seluruh kontrol bawah ruang transaksi dan dashboard tidak terpotong di layar smartphone.

### G. Chatbot Asisten AI Google Gemini Multi-Tier Waterfall
- **Lokasi:** `src/app/api/ai/assistant/route.ts`, `src/components/ai-assistant.tsx`
- **Spesifikasi:**
  - Waterfall tier: `gemini-3.1-flash-lite` -> `gemini-3.5-flash` -> `gemini-3.6-flash` -> `gemini-3.7-flash`.
  - Output redactor untuk menyaring API key atau JWT token.
  - Fallback HTTP 429 ke tombol Customer Service WhatsApp saat kuota model habis.

### H. Dokumen Resmi Digital & Surat Pengalaman Kerja
- **Lokasi:** `src/components/invoice-modal.tsx`
- **Spesifikasi:**
  - Kwitansi Faktur Kas Resmi UMKM (`INV-MM-[ID]-[TAHUN]`) dengan QR Code keabsahan dan 0% komisi siswa.
  - Surat Keterangan Pengalaman Kerja Industri Pelajar Vokasi (`CERT-MM-[ID]-VOKASI`) siap cetak format A4 (@media print).

### I. Kepatuhan Regulasi & Perlindungan Pelajar
- **Lokasi:** `/kebijakan-privasi`, `/perlindungan-pelajar`, `/syarat-ketentuan`
- **Spesifikasi:**
  - Kepatuhan UU PDP No. 27/2022 untuk perlindungan data anak di bawah umur.
  - Pedoman jam wajib belajar dan anti-eksploitasi siswa.
### J. Integrasi Gateway Pembayaran Pakasir (QRIS Dinamis & Otomatisasi Rekber)
- **Lokasi:** `src/app/(dashboard)/umkm/deposit/page.tsx`, `src/components/pakasir-payment-modal.tsx`, `src/app/api/payment/pakasir/*`
- **Spesifikasi:**
  - **Dukungan QRIS Nasional:** Menghasilkan kode QRIS dinamis otomatis berbasis order ID unik (`MM-DEP-[TIMESTAMP]-[RANDOM]`), dapat dipindai oleh seluruh aplikasi m-banking (BCA, Mandiri, BRI, BNI) dan e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja).
  - **Webhook & Polling Terpadu:** Webhook endpoint (`/api/payment/pakasir/webhook`) menerima callback otomatis saat pembayaran selesai (`completed`), langsung memperbarui status menjadi `APPROVED` dan menambahkan saldo escrow UMKM. Didukung polling live (`/api/payment/pakasir/status`) setiap 2.5 detik.
  - **Mode Simulasi Sandbox Terintegrasi:** Tombol simulasi bayar instan (`/api/payment/pakasir/simulate`) untuk pengujian langsung tanpa perlu menunggu proses verifikasi KYC merchant selesai.
  - **Persistensi PostgreSQL:** Setiap transaksi tagihan tersimpan di tabel `DepositTransaction` dan disinkronkan secara kontinu ke global store rekber.
  - **Opsi Multi-Metode:** Memberikan kebebasan kepada UMKM untuk memilih antara QRIS Pakasir (Otomatis & Real-Time) atau Transfer Manual ke rekening penampungan resmi admin.

---

## 4. Standar Keamanan Data & Server (Security SSS-Tier)

1. **Zero Credential Exposure:** Kunci API disimpan di server environment (`process.env`) dan disaring pada seluruh output.
2. **Zero Password Exposure:** Field password tidak pernah disertakan dalam payload response API.
3. **Enterprise HTTP Security Headers (`next.config.ts`):**
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` (blokir akses kamera/mikrofon tanpa izin)
   - `Cache-Control: no-store, max-age=0` pada seluruh endpoint `/api/*`
4. **Rate Limiting Berlapis:**
   - Login admin: 5 percobaan / 10 menit dengan lockout otomatis.
   - Asisten AI: 12 request / menit per IP address.

---

## 5. Changelog Pengembangan

### Sesi September 2026:
- **feat:** Integrasi gateway pembayaran otomatis Pakasir (QRIS Dinamis) pada halaman deposit UMKM, verifikasi webhook instan, penyimpanan persisten PostgreSQL (DepositTransaction), serta mode simulasi sandbox.
- **feat:** Migrasi penuh sistem obrolan dan berkas karya langsung ke PostgreSQL (`ChatMessage` & `DeliverableWork`), menghapus ketergantungan pada `localStorage` sehingga data obrolan dan serah terima karya tidak akan hilang (*mental*) atau terhapus kuota peramban.
- **fix:** Penambahan kompresi otomatis gambar di sisi klien (`compressImageFile`) dan sinkronisasi real-time dua arah (`POST /api/chat` dengan tipe `SYNC`).
- **feat:** Sinkronisasi dua arah real-time untuk penarikan dana pelajar ke dashboard admin (`/api/deposit` & `escrow-store.ts`).
- **feat:** Pemasangan logo resmi kanal pembayaran e-wallet (GoPay, DANA, OVO, ShopeePay) pada formulir penarikan dompet siswa.
- **fix:** Perbaikan kalkulasi saldo dompet siswa menjadi idempotent dan akurat sesuai nominal riil proyek selesai.
- **feat:** Penambahan kontrol moderasi Minta Revisi dan Done & Cairkan oleh admin di panel `/tuan`.
- **feat:** Penambahan pemilih berkas langsung dari galeri/kamera dan folder (ZIP/PDF) pada ruang transaksi siswa.
- **feat:** Kontrol status proyek langsung pada dashboard UMKM dan perbaikan responsivitas mobile dynamic viewport height.
