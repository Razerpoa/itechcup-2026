'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, Lock, EyeOff, FileText, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react'

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-900">
      
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] flex items-center justify-between px-4 sm:px-8 h-16 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[#FFD9CA]">
              <Image src="/logo.jpg" alt="Mitra Muda" width={32} height={32} className="w-full h-full object-cover" unoptimized />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-base leading-tight">Mitra Muda</h1>
              <span className="text-[10px] text-[#964825] font-bold">Pelindungan Data Pribadi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/syarat-ketentuan"
            className="text-xs font-bold bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] px-4 py-2 rounded-full hover:bg-[#FFD9CA] transition-colors"
          >
            Syarat & Ketentuan
          </Link>
        </div>
      </header>

      
      <div className="bg-gradient-to-b from-[#FFF7F3] to-[#FAFAFA] border-b border-[#FFD9CA]/60 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#964825] border border-[#FFD9CA] shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Kepatuhan UU No. 27 Tahun 2022 tentang PDP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Kebijakan Privasi & Perlindungan Data
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Mitra Muda berkomitmen menjaga kerahasiaan dan keamanan data pribadi Pelajar, Klien UMKM, dan Institusi Sekolah sesuai regulasi perlindungan data pribadi yang berlaku di Republik Indonesia.
          </p>
        </div>
      </div>

      
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 text-sm leading-relaxed text-gray-700">
        
        <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-emerald-950">
              Jaminan Tidak Ada Penjualan Data ke Pihak Ketiga
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
              Data pelajar (seperti NISN, foto kartu pelajar, nama orang tua, dan nomor telepon) <strong>TIDAK PERNAH</strong> dijual, disewakan, atau dibagikan kepada pengiklan pihak ketiga. Seluruh data disimpan terenkripsi dan hanya dipakai untuk verifikasi keaktifan sekolah serta proses transaksi akad.
            </p>
          </div>
        </div>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">1</span>
            <span>Data Pribadi yang Kami Kumpulkan</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600">
            <p><strong>A. Data Pelajar / Talenta:</strong></p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-gray-500">
              <li>Nama lengkap, alamat email aktif, dan nomor WhatsApp.</li>
              <li>Asal sekolah, Nomor Induk Siswa (NIS/NISN), dan tingkatan kelas.</li>
              <li>Foto Kartu Tanda Siswa (KTS) atau surat keterangan sekolah untuk keperluan verifikasi.</li>
              <li>Informasi akun e-wallet (nomor GoPay, OVO, DANA, ShopeePay) untuk pencairan hasil pengerjaan proyek.</li>
            </ul>

            <p className="pt-2"><strong>B. Data Klien UMKM:</strong></p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-gray-500">
              <li>Nama pemilik usaha, nama brand/usaha, dan alamat usaha.</li>
              <li>Nomor kontak resmi WhatsApp dan email korespondensi.</li>
              <li>Bukti legalitas (NIB/NPWP) atau tautan media sosial usaha resmi (opsional).</li>
            </ul>

            <p className="pt-2"><strong>C. Data Institusi Sekolah:</strong></p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-gray-500">
              <li>Nomor Pokok Sekolah Nasional (NPSN) dan nama resmi sekolah terdaftar Kemendikdasmen.</li>
              <li>Nama pejabat penanggung jawab (Kepala Sekolah, Wakasek Hubin, Guru Koordinator).</li>
              <li>Email domain resmi sekolah dan nomor telepon kantor.</li>
            </ul>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">2</span>
            <span>Tujuan Pemrosesan Data Pribadi</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p>Data pribadi yang dikumpulkan digunakan secara ketat hanya untuk kepentingan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">Verifikasi status keaslian pelajar bersama pihak sekolah dan Kemendikdasmen.</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">Penyaluran saldo dompet proyek ke akun e-wallet pelajar tanpa rekening bank.</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">Pemberitahuan notifikasi proyek, permintaan revisi, dan status akad transaksi.</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">Penerbitan rekap portofolio dan surat keterangan pengalaman kerja resmi siswa.</span>
              </div>
            </div>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">3</span>
            <span>Hak Pengguna atas Data Pribadinya</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p>Berdasarkan UU Pelindungan Data Pribadi No. 27/2022, setiap pengguna memiliki hak untuk:</p>
            <ul className="list-disc list-inside pl-2 space-y-1.5 text-gray-500">
              <li><strong>Hak Akses & Perbaikan:</strong> Memperbarui atau memperbaiki data profil, keahlian, nomor telepon, dan portofolio kapan saja melalui menu Pengaturan Profil.</li>
              <li><strong>Hak Penghapusan Akun:</strong> Mengajukan permohonan penutupan akun dan penghapusan data pribadi (Right to be Forgotten) setelah tidak ada akad transaksi aktif yang berjalan.</li>
              <li><strong>Privasi Publik:</strong> Siswa dapat memilih untuk menyembunyikan nomor WhatsApp dari profil publik dan hanya menampilkannya kepada UMKM yang akad kerjanya telah disetujui.</li>
            </ul>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">4</span>
            <span>Keamanan Penyimpanan & Enkripsi</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Seluruh lalu lintas komunikasi dilindungi dengan protokol enkripsi TLS/HTTPS 256-bit. Kata sandi (password) disimpan menggunakan hashing satu arah (bcrypt/Argon2) yang aman dan tidak dapat dibaca oleh staf internal sekalipun. Akses administratif ke sistem dilindungi dengan autentikasi dua faktor (2FA).
          </p>
        </section>
      </main>

      
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-gray-500">
        <p>© 2026 Mitra Muda Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>
    </div>
  )
}
