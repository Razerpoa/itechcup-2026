'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldCheck, Scale, FileText, Lock, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function SyaratKetentuanPage() {
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
              <span className="text-[10px] text-[#964825] font-bold">Ketentuan Hukum Resmi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/panduan"
            className="text-xs font-bold bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] px-4 py-2 rounded-full hover:bg-[#FFD9CA] transition-colors"
          >
            Buku Panduan
          </Link>
        </div>
      </header>

      
      <div className="bg-gradient-to-b from-[#FFF7F3] to-[#FAFAFA] border-b border-[#FFD9CA]/60 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#964825] border border-[#FFD9CA] shadow-2xs">
            <Scale className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Dokumen Resmi & Ketentuan Layanan</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Terakhir Diperbarui: 15 Januari 2026. Ketentuan ini mengatur hak, kewajiban, dan tanggung jawab hukum antara Pelajar, Klien UMKM, dan Institusi Sekolah dalam platform Mitra Muda.
          </p>
        </div>
      </div>

      
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 text-sm leading-relaxed text-gray-700">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9CA] shadow-xs space-y-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Prinsip Utama Mitra Muda</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Mitra Muda adalah platform pemberdayaan talenta vokasi dan pelajar Indonesia yang menjembatani kolaborasi karya nyata bersama pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) melalui sistem akad kerja aman (Escrow) dan verifikasi identitas resmi institusi sekolah.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-900 block mb-1">0% Potongan Siswa</span>
              <p className="text-[11px] text-gray-500">Pendapatan hasil keringat karya siswa disalurkan 100% tanpa potongan komisi sepihak.</p>
            </div>
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-900 block mb-1">Dana Aman (Escrow)</span>
              <p className="text-[11px] text-gray-500">Uang muka (DP) UMKM dikunci aman di rekber resmi dan baru dilepaskan setelah hasil karya disetujui.</p>
            </div>
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-900 block mb-1">Legalitas Sekolah</span>
              <p className="text-[11px] text-gray-500">Status siswa diverifikasi melalui data keaktifan sekolah atau database resmi Kemendikdasmen.</p>
            </div>
          </div>
        </div>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">1</span>
            <span>Ketentuan Kelayakan Akun Pengguna</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p><strong>1.1. Pelajar / Talenta Muda:</strong> Wajib merupakan siswa aktif jenjang SMP, SMA, SMK, atau Madrasah Aliyah sederajat di Indonesia. Pelajar tidak diwajibkan memiliki KTP atau rekening bank, namun wajib mengunggah bukti keaktifan (Kartu Tanda Siswa/KTS atau surat keterangan sekolah) dan mengisi NISN/NIS yang valid.</p>
            <p><strong>1.2. Klien / UMKM:</strong> Merupakan perorangan, pemilik usaha mikro, kecil, atau menengah berbadan hukum maupun perseorangan yang membutuhkan bantuan jasa digital profesional. Wajib mencantumkan nomor WhatsApp aktif dan data identitas usaha yang sebenarnya.</p>
            <p><strong>1.3. Pihak Sekolah:</strong> Diwakili oleh Kepala Sekolah, Wakil Kepala Sekolah Bidang Hubungan Industri (Hubin/BKK), Guru Pembimbing, atau staf administrasi resmi yang terdaftar dengan Nomor Pokok Sekolah Nasional (NPSN) valid.</p>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">2</span>
            <span>Sistem Akad, Uang Muka (DP), dan Escrow</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p><strong>2.1. Permulaan Akad:</strong> Akad transaksi resmi dimulai setelah Klien UMKM menyetujui proposal lamaran pelajar dan menyetorkan Down Payment (DP) sebesar 30% atau 50% dari total nilai proyek yang disepakati ke sistem penampung aman (Escrow) Mitra Muda.</p>
            <p><strong>2.2. Kepastian Kerja:</strong> Pelajar hanya diperkenankan mulai mengerjakan proyek setelah status DP dinyatakan aktif dan tersimpan di sistem escrow.</p>
            <p><strong>2.3. Pelunasan & Pelepasan Dana:</strong> Setelah pelajar menyerahkan berkas deliverable final, UMKM berhak memeriksa hasil karya. Apabila telah sesuai, UMKM wajib menekan tombol penyelesaian akad, dan sistem akan melepaskan sisa dana ke Dompet Digital Pelajar.</p>
            <p><strong>2.4. Penarikan Saldo:</strong> Pelajar dapat mencairkan saldo dompet ke akun e-wallet (GoPay, OVO, DANA, ShopeePay) yang terdaftar. Penarikan diproses maksimal 1x24 jam pada hari kerja.</p>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">3</span>
            <span>Ketentuan Revisi & Hak Kekayaan Intelektual</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p><strong>3.1. Batas Revisi Wajar:</strong> UMKM berhak mengajukan permintaan revisi karya maksimal 2 (dua) kali revisi minor yang relevan dengan brief pengerjaan awal. Permintaan revisi yang mengubah konsep secara total dapat dikenakan biaya tambahan atas kesepakatan kedua belah pihak.</p>
            <p><strong>3.2. Hak Cipta & Kepemilikan:</strong> Hak penggunaan komersial atas karya final berpindah sepenuhnya kepada Klien UMKM setelah seluruh pembayaran lunas. Pelajar tetap berhak menggunakan karya tersebut sebagai portofolio karya pribadi tanpa batasan.</p>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Larangan & Perlindungan Siswa di Bawah Umur</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-rose-950/80">
            <p><strong>Dilarang Keras:</strong> Membuat atau menerima proyek yang mengandung unsur pornografi, judi daring, penipuan, pelanggaran hak cipta ilegal, atau tugas yang bertentangan dengan norma hukum Republik Indonesia.</p>
            <p><strong>Jam Wajib Belajar:</strong> Klien UMKM tidak boleh memaksa siswa bekerja pada jam aktif kegiatan belajar mengajar sekolah (07.00 - 15.00 WIB) atau membebani tenggat waktu yang mengorbankan kesehatan dan pendidikan siswa.</p>
          </div>
        </section>

        
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] text-xs flex items-center justify-center font-black">4</span>
            <span>Penyelesaian Sengketa (Dispute & Mediasi)</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
            <p>Apabila terjadi ketidaksesuaian antara UMKM dan Pelajar (misal: keterlambatan deliverable atau UMKM tidak merespons review selama lebih dari 7 hari kalender), Tim Mediasi Mitra Muda berhak menengahi sengketa secara adil dengan memeriksa bukti riwayat pesan di ruang akad transaksi.</p>
            <p>Keputusan Tim Mediasi Mitra Muda mengenai pelepasan atau pengembalian saldo escrow bersifat mengikat demi keadilan kedua belah pihak.</p>
          </div>
        </section>

        
        <div className="p-6 rounded-3xl bg-[#FFF1EB] border border-[#FFD9CA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Ada Pertanyaan Mengenai Ketentuan Ini?</h3>
            <p className="text-xs text-gray-600 mt-0.5">Tim Layanan Mitra Muda siap membantu Anda setiap hari kerja.</p>
          </div>
          <Link
            href="/panduan"
            className="px-5 py-2.5 rounded-full bg-[#FF9B71] text-white font-bold text-xs hover:bg-[#F5865A] transition-colors whitespace-nowrap shadow-2xs"
          >
            Pusat Bantuan & FAQ
          </Link>
        </div>
      </main>

      
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-gray-500">
        <p>© 2026 Mitra Muda Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>
    </div>
  )
}
