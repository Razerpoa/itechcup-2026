'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, GraduationCap, HeartHandshake, ShieldCheck, Clock, Award, PhoneCall, AlertTriangle } from 'lucide-react'

export default function PerlindunganPelajarPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-900">
      {/* Navbar */}
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
              <span className="text-[10px] text-[#964825] font-bold">Perlindungan Talenta Vokasi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/panduan"
            className="text-xs font-bold bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] px-4 py-2 rounded-full hover:bg-[#FFD9CA] transition-colors"
          >
            Panduan Sistem
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#FFF7F3] to-[#FAFAFA] border-b border-[#FFD9CA]/60 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#964825] border border-[#FFD9CA] shadow-2xs">
            <HeartHandshake className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Etika & Pedoman Perlindungan Remaja</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Pedoman Perlindungan Talenta Pelajar
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Mitra Muda memastikan setiap proyek industri yang dikerjakan oleh pelajar berlangsung dalam koridor pendidikan, aman dari eksploitasi, dan menjunjung tinggi martabat serta hak anak di bawah umur.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 text-sm leading-relaxed text-gray-700">
        {/* 4 Pilar Perlindungan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-[#FFD9CA] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold mb-3">
              <Clock className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Pendidikan Tetap Nomor Satu</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pelajar tidak diperkenankan menerima proyek dengan beban waktu yang mengganggu jam sekolah, tugas belajar harian, atau waktu istirahat malam.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#FFD9CA] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Bebas dari Eksploitasi & Kerja Paksa</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Seluruh proyek berbasis sukarela (pilihan mandiri siswa) dengan kompensasi yang adil dan transparan. Tidak ada ikatan kontrak kerja yang merugikan masa depan siswa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#FFD9CA] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold mb-3">
              <Award className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Pengakuan Portofolio Resmi</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Setiap proyek yang diselesaikan dapat dikonversi menjadi Surat Keterangan Pengalaman Kerja digital yang diakui sekolah untuk portofolio magang/PKL.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#FFD9CA] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold mb-3">
              <GraduationCap className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Pengawasan Institusi Sekolah</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pihak sekolah (Guru Hubin/BKK) dapat memantau aktivitas dan interaksi proyek siswa secara berkala melalui Portal Sekolah Mitra Muda.
            </p>
          </div>
        </div>

        {/* Aturan Komunikasi */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Etika Interaksi UMKM & Pelajar</h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600">
            <p>
              1. <strong>Komunikasi Profesional & Santun:</strong> Seluruh interaksi antara pemilik usaha dan pelajar wajib menjunjung norma kesopanan dan saling menghargai. Dilarang menggunakan kata-kata kasar, merendahkan, atau mengintimidasi.
            </p>
            <p>
              2. <strong>Larangan Pertemuan Fisik Tanpa Izin Sekolah/Orang Tua:</strong> Pelajar dilarang mengadakan pertemuan luring (offline) berdua saja dengan klien tanpa sepengetahuan dan pendampingan guru sekolah atau orang tua/wali.
            </p>
            <p>
              3. <strong>Ruang Transaksi Transparan:</strong> Kami menyarankan seluruh koordinasi revisi dan penyerahan karya dilakukan melalui fitur Ruang Akad Mitra Muda agar riwayat tercatat resmi apabila dibutuhkan mediasi.
            </p>
          </div>
        </section>

        {/* Hotline Pengaduan */}
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-bold text-rose-950 text-base flex items-center justify-center sm:justify-start gap-2">
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <span>Kanal Pengaduan & Perlindungan Cepat</span>
            </h3>
            <p className="text-xs text-rose-900/80 max-w-lg leading-relaxed">
              Jika ada pelajar yang mengalami perlakuan tidak pantas, penipuan, atau pemaksaan kerja oleh klien di platform Mitra Muda, segera laporkan ke Tim Mediasi Darurat kami.
            </p>
          </div>
          <a
            href="mailto:lapor@mitramuda.biz.id?subject=Pengaduan%20Perlindungan%20Pelajar%20Mitra%20Muda"
            className="px-6 py-3 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer shrink-0"
          >
            Hubungi Tim Perlindungan
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-gray-500">
        <p>© 2026 Mitra Muda Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>
    </div>
  )
}
