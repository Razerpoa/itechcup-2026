'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  BookOpen,
  Mail,
  MessageCircle,
  Send,
  Search,
  GraduationCap,
  Store,
  Building2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Wallet,
  FileCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Clock,
  Lock
} from 'lucide-react'
import { useAuthUser } from '@/lib/auth-client'

interface GuideStep {
  id: string
  stepNumber: number
  title: string
  subtitle: string
  tag: string
  tagColor: 'orange' | 'emerald' | 'blue' | 'purple'
  summary: string
  details: string[]
  proTip?: string
  actionUrl?: string
  actionLabel?: string
  icon: any
}

interface FaqItem {
  question: string
  answer: string
  category: 'pelajar' | 'umkm' | 'sekolah' | 'umum'
}

export default function PanduanPage() {
  const user = useAuthUser()
  const [activeRoleTab, setActiveRoleTab] = useState<'pelajar' | 'umkm' | 'sekolah' | 'faq'>('pelajar')
  const [searchTerm, setSearchTerm] = useState('')
  const [openStepId, setOpenStepId] = useState<string | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    if (user?.role === 'umkm') setActiveRoleTab('umkm')
    if (user?.role === 'sekolah') setActiveRoleTab('sekolah')
  }, [user?.role])

  const toggleStep = (id: string) => {
    setOpenStepId(openStepId === id ? null : id)
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const pelajarGuides: GuideStep[] = [
    {
      id: 'p1',
      stepNumber: 1,
      title: 'Pendaftaran Akun Pelajar & Unggah Identitas',
      subtitle: 'Tanpa Syarat KTP atau Rekening Bank',
      tag: 'Langkah 1',
      tagColor: 'orange',
      summary: 'Isi data diri lengkap, nama sekolah, NISN, dan sertakan foto kartu pelajar aktif.',
      details: [
        'Kunjungi halaman Pendaftaran Pelajar di /register/pelajar.',
        'Isi Nama Lengkap sesuai identitas sekolah, Email aktif, dan Nomor WhatsApp.',
        'Pilih jenis kelamin, tempat & tanggal lahir, serta nama ibu kandung.',
        'Pilih/ketik nama sekolah Anda dan masukkan NIS/NISN.',
        'Unggah foto Kartu Pelajar (KTS) atau Surat Keterangan Siswa Aktif.',
        'Klik Daftar untuk membuat akun baru.'
      ],
      proTip: 'Gunakan foto kartu pelajar yang jelas agar proses verifikasi sekolah berjalan lebih cepat.',
      actionUrl: '/register/pelajar',
      actionLabel: 'Daftar Pelajar',
      icon: GraduationCap
    },
    {
      id: 'p2',
      stepNumber: 2,
      title: 'Verifikasi Keaktifan oleh Sekolah / Admin System',
      subtitle: 'Jaminan Keaslian Talenta Pelajar',
      tag: 'Verifikasi',
      tagColor: 'blue',
      summary: 'Akun Anda akan diverifikasi oleh pihak Sekolah Anda atau Admin Mitra Muda.',
      details: [
        'Sekolah Anda yang terdaftar di Portal Sekolah Mitra Muda akan menerima notifikasi pendaftaran Anda.',
        'Admin Sekolah atau Admin Platform Mitra Muda mengecek data identitas Anda.',
        'Setelah disetujui, badge "Akun Terverifikasi" akan aktif di profil Anda.',
        'Jika sekolah belum terdaftar, Anda tetap bisa diverifikasi langsung oleh Admin Platform Mitra Muda.'
      ],
      proTip: 'Anda bisa mengingatkan pihak sekolah untuk menyetujui verifikasi melalui dashboard portal sekolah.',
      actionUrl: '/pelajar',
      actionLabel: 'Cek Status Verifikasi',
      icon: ShieldCheck
    },
    {
      id: 'p3',
      stepNumber: 3,
      title: 'Jelajahi Marketplace & Pilih Proyek UMKM',
      subtitle: 'Temukan Proyek Sesuai Minat & Keahlian',
      tag: 'Eksplorasi',
      tagColor: 'orange',
      summary: 'Gunakan filter kategori keahlian, anggaran budget, dan besaran DP proyek.',
      details: [
        'Buka halaman Marketplace Mitra Muda di /marketplace.',
        'Pilih tab "Proyek UMKM" untuk melihat lowongan proyek dari pelaku usaha.',
        'Gunakan filter keahlian seperti Web Dev, Desain Grafis, Video Editor, Copywriting, atau UI/UX.',
        'Perhatikan rincian budget proyek, besaran DP escrow (30-50%), dan estimasi waktu pengerjaan.'
      ],
      actionUrl: '/marketplace',
      actionLabel: 'Buka Marketplace',
      icon: Search
    },
    {
      id: 'p4',
      stepNumber: 4,
      title: 'Kirim Proposal & Penawaran Harga (Lamar Proyek)',
      subtitle: 'Tunjukkan Portofolio & Keunggulan Anda',
      tag: 'Pengajuan',
      tagColor: 'purple',
      summary: 'Klik tombol Lamar Proyek, tentukan harga tawaran, dan tulis pesan motivasi terbaik.',
      details: [
        'Klik pada proyek yang menarik minat Anda untuk melihat rincian ketentuan proyek.',
        'Klik tombol "Lamar Proyek Ini".',
        'Masukkan harga penawaran Anda (dapat disesuaikan dengan range budget UMKM).',
        'Tulis pesan motivasi yang menjelaskan mengapa Anda cocok mengerjakan proyek tersebut.',
        'Sertakan tautan portofolio atau contoh karya terbaik Anda.',
        'Kirim lamaran dan tunggu konfirmasi dari pihak UMKM.'
      ],
      proTip: 'Pesan motivasi yang ramah, jelas, dan menyertakan contoh karya memiliki peluang diterima 3x lebih tinggi.',
      icon: FileCheck
    },
    {
      id: 'p5',
      stepNumber: 5,
      title: 'Masuk Ruang Akad Transaksi & Komunikasi',
      subtitle: 'Rekening Bersama (Escrow) Aktif',
      tag: 'Akad Kerja',
      tagColor: 'emerald',
      summary: 'Saat UMKM menerima lamaran Anda, Ruang Akad Transaksi otomatis terbuka.',
      details: [
        'Anda akan menerima pemberitahuan bahwa lamaran Anda disetujui.',
        'Ruang Akad Transaksi khusus proyek tersebut dapat diakses melalui Dashboard Pelajar.',
        'Dana DP dari UMKM telah aman tersimpan di Rekening Bersama (Escrow) Mitra Muda.',
        'Gunakan fitur pesan di Ruang Akad untuk berdiskusi seputar spesifikasi teknis dan pengiriman berkas karya.'
      ],
      actionUrl: '/pelajar',
      actionLabel: 'Dashboard Pelajar',
      icon: Lock
    },
    {
      id: 'p6',
      stepNumber: 6,
      title: 'Pengerjaan & Submit Hasil Karya (Deliverable)',
      subtitle: 'Tepat Waktu & Sesuai Spesifikasi',
      tag: 'Pengerjaan',
      tagColor: 'orange',
      summary: 'Kerjakan proyek dengan profesional, lalu unggah tautan hasil pekerjaan.',
      details: [
        'Kerjakan proyek sesuai kesepakatan waktu di Ruang Akad.',
        'Unggah berkas hasil karya (misal: link Google Drive, Figma, GitHub, atau tautan demo).',
        'Klik tombol "Submit Hasil Pekerjaan" di Ruang Akad.',
        'Pihak UMKM akan memeriksa dan memberikan ulasan/umpan balik.'
      ],
      icon: Zap
    },
    {
      id: 'p7',
      stepNumber: 7,
      title: 'Pencairan Otomatis ke Dompet & Penarikan E-Wallet',
      subtitle: 'Tanpa Potongan Komisi Tersembunyi',
      tag: 'Pencairan',
      tagColor: 'emerald',
      summary: 'Setelah UMKM mengkonfirmasi selesai, seluruh dana proyek cair otomatis ke Dompet.',
      details: [
        'UMKM menekan tombol "Konfirmasi Selesai & Beri Ulasan".',
        'Dana pelunasan otomatis ditransfer dari Rekening Bersama ke Dompet Pelajar Anda.',
        'Buka halaman Dompet & Tarik Saldo di /pelajar/dompet.',
        'Pilih E-Wallet tujuan Anda (GoPay, OVO, atau DANA).',
        'Masukkan nominal penarikan dan klik "Tarik Saldo". Dana akan diproses dalam 1x24 jam.'
      ],
      proTip: 'E-Wallet tidak harus atas nama pribadi jika belum punya, bisa menggunakan e-wallet orang tua.',
      actionUrl: '/pelajar/dompet',
      actionLabel: 'Kelola Dompet',
      icon: Wallet
    }
  ]

  const umkmGuides: GuideStep[] = [
    {
      id: 'u1',
      stepNumber: 1,
      title: 'Pendaftaran Akun UMKM & Profil Usaha',
      subtitle: 'Dukungan Talenta Muda Untuk Kemajuan UMKM',
      tag: 'Langkah 1',
      tagColor: 'orange',
      summary: 'Daftarkan nama usaha Anda, sertakan kontak WhatsApp aktif untuk komunikasi cepat.',
      details: [
        'Buka halaman Registrasi UMKM di /register/umkm.',
        'Isi Nama Pemilik, Nama Usaha, Email, dan Nomor WhatsApp aktif.',
        'Lengkapi deskripsi bidang usaha Anda.',
        'Akun Anda akan melalui verifikasi cepat oleh admin untuk mengaktifkan fitur buat proyek.'
      ],
      actionUrl: '/register/umkm',
      actionLabel: 'Daftar UMKM',
      icon: Store
    },
    {
      id: 'u2',
      stepNumber: 2,
      title: 'Top Up Saldo Rekber / Deposit Proyek',
      subtitle: 'Transaksi Aman dengan Garansi Escrow',
      tag: 'Keuangan',
      tagColor: 'emerald',
      summary: 'Isi saldo rekening bersama sebelum mempublikasikan lowongan proyek.',
      details: [
        'Buka halaman Top Up Saldo Rekber di /umkm/deposit.',
        'Pilih nominal deposit sesuai anggaran proyek yang ingin dibuat.',
        'Transfer ke Rekening Bersama Resmi Mitra Muda (Bank BCA / Mandiri / BRI).',
        'Unggah bukti transfer. Admin akan memverifikasi mutasi dan saldo rekber Anda aktif seketika.'
      ],
      actionUrl: '/umkm/deposit',
      actionLabel: 'Top Up Saldo',
      icon: Wallet
    },
    {
      id: 'u3',
      stepNumber: 3,
      title: 'Buat Lowongan Proyek & Tentukan DP',
      subtitle: 'Format Transparan & Terjangkau',
      tag: 'Publikasi',
      tagColor: 'purple',
      summary: 'Isi spesifikasi proyek, anggaran (min - max), dan pilih skema DP (30% atau 50%).',
      details: [
        'Klik tombol "Buat Proyek" di Dashboard UMKM Anda.',
        'Tulis Judul Proyek yang jelas (misal: "Desain Logo & Kemasan Kopi 250g").',
        'Pilih Kategori Keahlian dan masukkan deskripsi detail kebutuhan Anda.',
        'Tentukan Anggaran Minimal dan Maksimal.',
        'Pilih Persentase DP Escrow (30% atau 50%) yang akan dikunci saat akad dimulai.',
        'Klik "Publikasikan Proyek" agar dapat dilamar oleh para pelajar.'
      ],
      actionUrl: '/umkm/proyek/buat',
      actionLabel: 'Buat Proyek Baru',
      icon: Zap
    },
    {
      id: 'u4',
      stepNumber: 4,
      title: 'Seleksi Proposal Pelamar & Terima Akad',
      subtitle: 'Lihat Portofolio Siswa & Diskusi Langsung',
      tag: 'Seleksi',
      tagColor: 'blue',
      summary: 'Tinjau penawaran harga, ulasan, dan portofolio dari setiap pelajar yang melamar.',
      details: [
        'Anda akan menerima pemberitahuan setiap ada pelajar yang melamar proyek Anda.',
        'Lihat profil pelajar, asal sekolah, portofolio karya, dan harga penawarannya.',
        'Gunakan fitur Chat UMKM untuk bertanya atau berdiskusi sebelum menerima.',
        'Klik "Terima Lamaran" pada pelajar terbaik. Ruang Akad Transaksi otomatis diaktifkan dan DP dikunci aman.'
      ],
      actionUrl: '/umkm',
      actionLabel: 'Dashboard UMKM',
      icon: ShieldCheck
    },
    {
      id: 'u5',
      stepNumber: 5,
      title: 'Monitor Progress & Review Hasil Karya',
      subtitle: 'Jaminan Kualitas Bergaransi',
      tag: 'Pengerjaan',
      tagColor: 'emerald',
      summary: 'Pantau pengiriman karya di Ruang Akad, berikan revisi atau masukan.',
      details: [
        'Buka Ruang Akad Transaksi di /umkm/transaksi/[id].',
        'Pantau pesan dan hasil deliverable yang diunggah oleh siswa.',
        'Berikan masukan atau revisi jika berkas belum sesuai spesifikasi.',
        'Jika pekerjaan telah sesuai, klik tombol "Konfirmasi Selesai & Beri Ulasan".',
        'Sisa pelunasan akan otomatis diteruskan dari escrow ke dompet siswa.'
      ],
      icon: CheckCircle2
    }
  ]

  const sekolahGuides: GuideStep[] = [
    {
      id: 's1',
      stepNumber: 1,
      title: 'Registrasi Portal Sekolah dengan NPSN Resmi',
      subtitle: 'Integrasi Otomatis Data Kemendikdasmen',
      tag: 'Pendaftaran',
      tagColor: 'orange',
      summary: 'Daftarkan sekolah Anda dengan NPSN 8-digit resmi.',
      details: [
        'Buka halaman Registrasi Sekolah di /register/sekolah.',
        'Masukkan Nomor Pokok Sekolah Nasional (NPSN) 8-digit.',
        'Sistem akan otomatis mengecek dan melengkapi data nama sekolah dari database Kemendikdasmen.',
        'Isi Email Resmi Sekolah, Nama Penanggung Jawab (Kepala Sekolah/Hubin/Guru), dan Password.',
        'Klik "Daftar Sekolah" untuk membuka akses Portal Sekolah.'
      ],
      actionUrl: '/register/sekolah',
      actionLabel: 'Portal Sekolah',
      icon: Building2
    },
    {
      id: 's2',
      stepNumber: 2,
      title: 'Validasi & Verifikasi Siswa Aktif',
      subtitle: 'Memastikan Status Keaktifan Pelajar',
      tag: 'Verifikasi',
      tagColor: 'blue',
      summary: 'Disetujui daftar siswa dari sekolah Anda yang mendaftar di Mitra Muda.',
      details: [
        'Login ke Portal Sekolah di /sekolah.',
        'Buka tabel "Verifikasi Siswa Terdaftar".',
        'Lihat data nama siswa, NISN, kelas, dan foto Kartu Pelajar yang diunggah.',
        'Klik tombol "Setujui" untuk memverifikasi bahwa siswa tersebut benar aktif di sekolah Anda.',
        'Siswa yang terverifikasi akan mendapatkan tanda centang terverifikasi di profil publik mereka.'
      ],
      actionUrl: '/sekolah',
      actionLabel: 'Dashboard Verifikasi',
      icon: ShieldCheck
    },
    {
      id: 's3',
      stepNumber: 3,
      title: 'Pantau Laporan Kinerja & Prestasi Karya Siswa',
      subtitle: 'Data Analitik & Rekapitulasi Portofolio Industri',
      tag: 'Analitik',
      tagColor: 'emerald',
      summary: 'Akses statistik total proyek industri, penghasilan siswa, dan pemeringkatan prestasi.',
      details: [
        'Buka halaman Laporan Kinerja di /sekolah/laporan.',
        'Lihat rekapitulasi total proyek industri yang berhasil diselesaikan siswa sekolah Anda.',
        'Pantau peringkat siswa terbaik berdasarkan rating kepuasan UMKM dan total pendapatan.',
        'Gunakan data laporan untuk keperluan akreditasi, laporan PKL/PBL, dan kemitraan industri.'
      ],
      actionUrl: '/sekolah/laporan',
      actionLabel: 'Laporan Analitik',
      icon: Sparkles
    }
  ]

  const faqs: FaqItem[] = [
    {
      category: 'pelajar',
      question: 'Apakah pelajar di bawah 17 tahun bisa mendaftar tanpa KTP?',
      answer: 'Bisa! Mitra Muda dirancang khusus untuk pelajar tanpa syarat KTP atau rekening bank pribadi. Verifikasi dilakukan melalui verifikasi kartu pelajar/status keaktifan siswa dari sekolah Anda atau tim Admin.'
    },
    {
      category: 'pelajar',
      question: 'Ke mana dana hasil pekerjaan proyek dicairkan?',
      answer: 'Dana hasil pekerjaan akan masuk ke saldo Dompet Mitra Muda Anda. Dari dompet, Anda dapat mencairkan saldo kapan saja ke akun E-Wallet populer seperti GoPay, OVO, atau DANA dalam 1x24 jam.'
    },
    {
      category: 'umkm',
      question: 'Bagaimana keamanan transaksi untuk pihak UMKM?',
      answer: 'Mitra Muda menggunakan sistem Rekening Bersama (Escrow). Dana DP proyek dikunci oleh sistem saat akad dimulai. Dana hanya akan diteruskan ke pelajar setelah Anda memeriksa dan mengkonfirmasi bahwa pekerjaan telah selesai sesuai spesifikasi.'
    },
    {
      category: 'umkm',
      question: 'Berapa besaran DP yang perlu disetor saat membuat proyek?',
      answer: 'UMKM dapat memilih besaran DP sebesar 30% atau 50% saat membuat lowongan proyek. DP ini memberikan kepastian kerja bagi pelajar sekaligus menjaga keamanan dana UMKM.'
    },
    {
      category: 'sekolah',
      question: 'Apa keuntungan Sekolah mendaftar di Portal Sekolah Mitra Muda?',
      answer: 'Sekolah dapat memantau karya nyata dan rekam jejak portofolio industri para siswanya secara real-time. Data ini sangat berguna untuk laporan kinerja Hubin/BKK, klaim pembelajaran berbasis proyek (PBL), dan laporan akreditasi sekolah.'
    },
    {
      category: 'umum',
      question: 'Berapa komisi atau potongan biaya platform di Mitra Muda?',
      answer: 'Mitra Muda berkomitmen memberdayakan pelajar tanpa potong komisi dari pendapatan hasil karya siswa (0% komisi pelajar). Biaya operasional platform dibebankan secara transparan dalam bentuk biaya layanan mikro yang sangat terjangkau.'
    },
    {
      category: 'umkm',
      question: 'Apakah UMKM bisa mendapatkan bukti kwitansi / invoice resmi untuk pembukuan?',
      answer: 'Bisa! Di setiap ruang transaksi akad, UMKM dapat mengklik tombol "Invoice" untuk mencetak atau menyimpan dokumen Invoice & Kwitansi Resmi berstandar akuntansi UMKM lengkap dengan nomor faktur unik dan status pelunasan.'
    },
    {
      category: 'pelajar',
      question: 'Apakah siswa bisa mendapatkan bukti sertifikat pengalaman kerja?',
      answer: 'Bisa! Di ruang transaksi akad yang selesai, siswa dapat mengunduh Surat Keterangan Pengalaman Kerja Industri resmi berlogo Mitra Muda yang mencantumkan nama proyek, nama UMKM mitra, serta rating kepuasan untuk portofolio magang/PKL atau melamar kerja.'
    },
    {
      category: 'umum',
      question: 'Bagaimana perlindungan privasi data pelajar di bawah umur?',
      answer: 'Mitra Muda patuh penuh pada UU Perlindungan Data Pribadi (UU PDP No. 27/2022). Seluruh data identitas siswa disimpan terenkripsi hanya untuk verifikasi keaktifan sekolah dan tidak pernah dibagikan atau diperjualbelikan ke pihak ketiga.'
    },
    {
      category: 'umum',
      question: 'Bagaimana jika terjadi sengketa pengerjaan antara UMKM dan Pelajar?',
      answer: 'Mitra Muda memiliki sistem mediasi resmi. Dana DP tetap aman terkunci di escrow hingga kesepakatan tercapai. Tim mediasi Mitra Muda dapat meninjau riwayat chat dan berkas karya untuk memberikan solusi yang adil bagi kedua pihak.'
    }
  ]

  const activeGuides = useMemo(() => {
    let list: GuideStep[] = []
    if (activeRoleTab === 'umkm') list = umkmGuides
    else if (activeRoleTab === 'sekolah') list = sekolahGuides
    else list = pelajarGuides

    if (!searchTerm.trim()) return list

    const q = searchTerm.toLowerCase()
    return list.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.details.some((d) => d.toLowerCase().includes(q))
    )
  }, [activeRoleTab, searchTerm])

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs
    const q = searchTerm.toLowerCase()
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    )
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] flex items-center justify-between px-4 sm:px-8 h-16 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault()
              if (window.history.length > 1) {
                window.history.back()
              } else {
                window.location.href = '/'
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[#FFD9CA]">
              <Image src="/logo.jpg" alt="Mitra Muda" width={32} height={32} className="w-full h-full object-cover" unoptimized />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-base leading-tight">Mitra Muda</h1>
              <span className="text-[10px] text-[#964825] font-bold">Pusat Panduan Platform</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={user.role === 'umkm' ? '/umkm' : user.role === 'sekolah' ? '/sekolah' : '/pelajar'}
              className="text-xs font-bold bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] px-4 py-2 rounded-full hover:bg-[#FFD9CA] transition-colors flex items-center gap-1.5"
            >
              <span>Dashboard Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold bg-[#FF9B71] text-white px-4 py-2 rounded-full hover:bg-[#F5865A] transition-colors shadow-2xs"
            >
              Masuk Akun
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        
        <div className="relative rounded-3xl bg-gradient-to-br from-[#FFF7F3] via-white to-[#FFF1EB] p-6 sm:p-10 border border-[#FFD9CA] shadow-sm overflow-hidden text-center sm:text-left">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#FF9B71]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-[#FFD9CA] px-3.5 py-1 rounded-full text-xs font-bold text-[#964825] shadow-2xs backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5 text-[#FF9B71]" />
              <span>Panduan Resmi & Dokumentasi Sistem</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Buku Panduan & Cara Kerja <span className="text-[#FF9B71]">Mitra Muda</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Panduan lengkap langkah demi langkah untuk Pelajar, UMKM, dan Sekolah. Pelajari sistem transaksi aman tanpa KTP/bank, alur escrow rekber, serta verifikasi identitas.
            </p>

            
            <div className="relative pt-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik panduan (misal: escrow, verifikasi, e-wallet, DP, lamaran...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-[#FFD9CA] rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9B71] shadow-xs transition-all"
              />
            </div>
          </div>
        </div>

        
        <div className="flex justify-center sm:justify-start gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-2xs overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveRoleTab('pelajar')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeRoleTab === 'pelajar'
                ? 'bg-[#FF9B71] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Panduan Pelajar</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('umkm')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeRoleTab === 'umkm'
                ? 'bg-[#FF9B71] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Panduan UMKM</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('sekolah')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeRoleTab === 'sekolah'
                ? 'bg-[#FF9B71] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Panduan Sekolah</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('faq')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeRoleTab === 'faq'
                ? 'bg-[#964825] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ & Tanya Jawab</span>
          </button>
        </div>

        
        {activeRoleTab !== 'faq' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-extrabold text-gray-900 capitalize flex items-center gap-2">
                <span>Alur Kerja untuk {activeRoleTab.toUpperCase()}</span>
                <span className="text-xs bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] px-2.5 py-0.5 rounded-full font-bold">
                  {activeGuides.length} Langkah
                </span>
              </h2>
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">Klik langkah untuk detail lengkap</span>
            </div>

            {activeGuides.length > 0 ? (
              activeGuides.map((guide) => {
                const isOpen = openStepId === guide.id
                const IconComponent = guide.icon

                return (
                  <div
                    key={guide.id}
                    className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                      isOpen ? 'border-[#FF9B71] ring-2 ring-[#FF9B71]/10' : 'border-[#EAEAEA] hover:border-[#FFD9CA]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleStep(guide.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FFF7F3]/40 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs mt-0.5">
                          {guide.stepNumber}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA]">
                              {guide.tag}
                            </span>
                            <h3 className="font-extrabold text-sm sm:text-base text-gray-900">{guide.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{guide.subtitle}</p>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">{guide.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF9B71]' : ''}`} />
                      </div>
                    </button>

                    
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-gray-100 bg-[#FAFAFA] space-y-4 animate-in fade-in duration-200">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Instruksi Rinci:</span>
                          </h4>
                          <ul className="space-y-2 pl-2">
                            {guide.details.map((detail, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B71] mt-1.5 shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {guide.proTip && (
                          <div className="p-3.5 bg-[#FFF1EB] rounded-2xl border border-[#FFD9CA] flex items-start gap-2.5 text-xs text-[#964825]">
                            <Sparkles className="w-4 h-4 text-[#FF9B71] shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold block">Tips Pro:</strong>
                              <span className="leading-relaxed">{guide.proTip}</span>
                            </div>
                          </div>
                        )}

                        {guide.actionUrl && (
                          <div className="pt-2">
                            <Link
                              href={guide.actionUrl}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full text-xs font-bold shadow-2xs transition-colors"
                            >
                              <IconComponent className="w-4 h-4" />
                              <span>{guide.actionLabel || 'Akses Halaman Terkait'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center space-y-3">
                <Search className="w-8 h-8 text-gray-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-gray-900">Topik Panduan Tidak Ditemukan</h3>
                <p className="text-xs text-gray-500">Coba ganti kata kunci pencarian Anda atau reset filter.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        ) : (
          
          <div className="space-y-4">
            <div className="px-1">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#964825]" />
                <span>Tanya Jawab Sering Ditanyakan (FAQ)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Jawaban pertanyaan umum seputar keamanan, escrow, e-wallet, dan verifikasi.</p>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                      isOpen ? 'border-[#964825] ring-2 ring-[#964825]/10' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[#964825] font-bold text-xs flex items-center justify-center shrink-0">
                          Q
                        </span>
                        <h3 className="font-bold text-sm text-gray-900">{faq.question}</h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#964825]' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-[#FAFAFA] text-xs text-gray-600 leading-relaxed pl-14 animate-in fade-in duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        
        <div className="bg-gradient-to-br from-white via-white to-[#FFF7F3] rounded-3xl p-6 sm:p-8 border border-[#FFD9CA] shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] font-extrabold text-[#964825] bg-[#FFF1EB] border border-[#FFD9CA] px-3 py-1 rounded-full uppercase tracking-wider">
              Pusat Layanan Bantuan
            </span>
            <h3 className="text-xl font-extrabold text-gray-900">Masih Punya Pertanyaan Lain?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tim support Mitra Muda siap mendampingi Anda dari proses registrasi hingga penyelesaian proyek. Jam operasional: Senin–Jumat 08.00–17.00 WIB.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>

            <a
              href="mailto:mitramuda.id@gmail.com"
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs transition-colors w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 text-red-500" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </main>

      
      <footer className="border-t border-gray-200 bg-white py-8 px-4 sm:px-8 text-xs text-gray-500 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Mitra Muda Indonesia. Hak Cipta Dilindungi.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace Jasa</Link>
            <Link href="/syarat-ketentuan" className="hover:text-gray-900 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-gray-900 transition-colors">Kebijakan Privasi</Link>
            <Link href="/perlindungan-pelajar" className="hover:text-[#964825] font-semibold transition-colors">Perlindungan Pelajar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
