'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Download,
  Edit,
  ShieldCheck,
  Sparkles,
  Send,
  Wallet,
  Briefcase,
  Printer,
  MessageCircle,
  Star
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useEscrowStore } from '@/lib/escrow-store'
import { useAkadStore, sendAkadChat, completeAkadAndPayout, syncAkadWithDB } from '@/lib/akad-store'
import InvoiceModal from '@/components/invoice-modal'

export default function UMKMTransaksiRoomPage() {
  const params = useParams()
  const rawId = (params?.id as string) || '1'
  const user = useAuthUser()
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()

  useEffect(() => {
    syncAkadWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const umkmId = user?.id || 'umkm-default'
  const saldoAktif = escrowState.umkmBalances[umkmId] || 0

  let activeAkad =
    akadState.akadList.find(
      (a) => a.id === rawId || a.proyekId === rawId || a.id === 'akad-' + rawId || (user?.id && a.umkmId === user.id) || (user?.namaUsaha && a.namaUsaha.toLowerCase() === user.namaUsaha.toLowerCase())
    ) || akadState.akadList[0]

  if (!activeAkad) {
    const matchingLamaran =
      akadState.lamaranList.find(
        (l) => l.id === rawId || l.proyekId === rawId || l.status === 'ACCEPTED' || (user?.namaUsaha && l.namaUsaha.toLowerCase() === user.namaUsaha.toLowerCase())
      ) || akadState.lamaranList[0]

    if (matchingLamaran) {
      const nominalTotal = matchingLamaran.hargaTawar || 500000
      const nominalDP = Math.round(nominalTotal * 0.3)
      activeAkad = {
        id: 'akad-' + matchingLamaran.id,
        proyekId: matchingLamaran.proyekId,
        judulProyek: matchingLamaran.judulProyek,
        umkmId: matchingLamaran.umkmId,
        namaUsaha: matchingLamaran.namaUsaha,
        pelajarId: matchingLamaran.pelajarId,
        namaPelajar: matchingLamaran.namaPelajar,
        sekolahNama: matchingLamaran.sekolahNama,
        nominalTotal,
        nominalDP,
        step: 2,
        deliverables: [],
        createdAt: matchingLamaran.createdAt
      }
    }
  }

  const [inputMsg, setInputMsg] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)
  const [isCompletedModal, setIsCompletedModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('Pekerjaan diselesaikan dengan sangat baik, komunikasi responsif, dan hasil deliverable memuaskan!')

  if (!activeAkad) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 sm:p-14 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 font-bold">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
            Belum Ada Ruang Akad Aktif
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            Ruang akad transaksi akan otomatis dibuat ketika Anda menyetujui proposal lamaran yang diajukan oleh siswa di dashboard Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/umkm"
              className="w-full sm:w-auto px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
            >
              Lihat Pelamar di Dashboard
            </Link>
            <Link
              href="/umkm/proyek/buat"
              className="w-full sm:w-auto px-6 py-3 bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] rounded-full font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
            >
              Buat Lowongan Proyek Baru
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const step = activeAkad.step
  const projectChats = akadState.chatMessages.filter(
    (m) =>
      m.proyekId === activeAkad.proyekId ||
      m.proyekId === rawId ||
      m.proyekId === activeAkad.id ||
      (activeAkad.id && m.proyekId === activeAkad.id.replace('akad-', ''))
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || !user) return

    sendAkadChat({
      proyekId: activeAkad.proyekId,
      senderId: user.id,
      senderName: user.namaUsaha || user.nama || 'Pemilik Usaha',
      senderRole: 'umkm',
      recipientId: activeAkad.pelajarId,
      text: inputMsg.trim()
    })
    setInputMsg('')
  }

  return (
    <div className="max-w-4xl mx-auto h-[820px] flex flex-col bg-white rounded-3xl shadow-xs border border-[#EAEAEA] overflow-hidden">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-gray-50/50 flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/umkm" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-gray-900">{activeAkad.judulProyek}</h1>
                <span className="bg-[#FFF1EB] text-[#964825] px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#FFD9CA]">
                  Rekber Terlindungi
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Pelaksana: <strong className="text-gray-900">{activeAkad.namaPelajar}</strong> ({activeAkad.sekolahNama || 'Siswa Terverifikasi'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvoice(true)}
              className="text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Lihat & Cetak Invoice Resmi"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Invoice</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Halo ${activeAkad.namaPelajar}, saya dari ${activeAkad.namaUsaha} terkait proyek "${activeAkad.judulProyek}" di Mitra Muda: https://www.mitramuda.biz.id/umkm/transaksi/${rawId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WA Siswa</span>
            </a>
            <div className="bg-[#FFF1EB] text-[#964825] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-extrabold text-xs sm:text-sm border border-[#FFD9CA]">
              {formatRupiah(activeAkad.nominalTotal)}
            </div>
          </div>
        </div>
        
        <div className="relative px-8 sm:px-12 pb-2">
          <div className="absolute left-14 right-14 h-1 bg-gray-200 top-3" />
          <div
            className="absolute left-14 h-1 bg-[#FF9B71] top-3 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
          />
          <div className="flex justify-between relative z-10">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-[#FF9B71] text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Check className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-[#964825]">DP Escrow</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-[#FF9B71] text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Check className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-[#964825]">Pengerjaan Siswa</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-[#FF9B71] text-white ring-4 ring-[#FFF1EB]' : 'bg-gray-200 text-gray-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-[#964825]">Review Deliverable</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500">Selesai & Cair</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#FFF7F3] px-6 py-2.5 border-b border-[#FFD9CA] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#964825] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
          <span>Status Rekber: DP {formatRupiah(activeAkad.nominalDP)} tersimpan aman di Rekening Penampung Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-bold">
            Saldo Deposit Anda: <span className="text-[#964825] font-extrabold">{formatRupiah(saldoAktif)}</span>
          </span>
          <Link
            href="/umkm/deposit"
            className="text-[11px] font-extrabold text-[#964825] hover:underline flex items-center gap-1"
          >
            <Wallet className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Top Up</span>
          </Link>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] flex flex-col gap-4">
        {projectChats.length > 0 ? (
          projectChats.map((msg) => {
            const isMe = msg.senderRole === 'umkm'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] font-bold text-gray-500 mb-1 px-1">{msg.senderName}</span>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                    isMe
                      ? 'bg-[#FF9B71] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs my-auto">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-600">Diskusi Akad Baru Dimulai</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Kirim brief pengerjaan atau pesan konfirmasi pertama Anda ke {activeAkad.namaPelajar}.
            </p>
          </div>
        )}

        {activeAkad.deliverables.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#FFD9CA] shadow-xs max-w-md self-center w-full my-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF9B71]" />
                <span>Deliverable Karya Siswa</span>
              </span>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                Siap Ditinjau
              </span>
            </div>

            {activeAkad.deliverables.map((del) => (
              <div key={del.id} className="bg-[#FAFAFA] rounded-xl p-3 flex items-center justify-between border border-gray-100 mb-2">
                <div>
                  <p className="font-bold text-xs text-gray-900">{del.fileName}</p>
                  <p className="text-[10px] text-gray-500">{del.fileSize}</p>
                </div>
                <button className="p-2 rounded-xl bg-[#FFF1EB] text-[#964825] hover:bg-[#FFD9CA] transition-colors cursor-pointer">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl">
               Silakan periksa berkas hasil kerja siswa di atas. Anda dapat meminta revisi atau menyetujui hasil karya untuk melepaskan sisa dana dari escrow.
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t border-[#EAEAEA] flex flex-col gap-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Tulis pesan atau catatan revisi untuk ${activeAkad.namaPelajar}...`}
            className="flex-1 h-11 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => {
              setInputMsg('[Permintaan Revisi]: ')
            }}
            className="w-full sm:w-1/2 py-3 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Minta Revisi Karya</span>
          </button>

          <button
            onClick={() => {
              if (activeAkad.step === 4) {
                alert('Proyek ini sudah berstatus selesai dan dana sudah dicairkan ke siswa.')
              } else {
                setShowRatingModal(true)
              }
            }}
            className={`w-full sm:w-1/2 py-3 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              activeAkad.step === 4
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{activeAkad.step === 4 ? 'Proyek Telah Selesai' : 'Beri Rating & Selesaikan Proyek'}</span>
          </button>
        </div>
      </footer>

      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Beri Rating & Ulasan Siswa</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bagikan pengalaman kerja Anda bersama <strong className="text-gray-900">{activeAkad.namaPelajar}</strong>. Rating Anda akan memperkuat portofolio siswa!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nilai Kepuasan Kerja</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || selectedRating) >= star
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-7 h-7 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    )
                  })}
                </div>
                <span className="text-xs font-extrabold text-[#964825]">
                  {selectedRating === 5
                    ? 'Sangat Memuaskan (5/5)'
                    : selectedRating === 4
                    ? 'Bagus & Rapi (4/5)'
                    : selectedRating === 3
                    ? 'Cukup Baik (3/5)'
                    : selectedRating === 2
                    ? 'Perlu Ditingkatkan (2/5)'
                    : 'Kurang Memuaskan (1/5)'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Testimoni / Ulasan Kinerja
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tulis ulasan Anda tentang kualitas pengerjaan dan ketepatan waktu siswa..."
                  className="w-full bg-[#F5F5F5] rounded-xl p-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    completeAkadAndPayout(activeAkad.id, selectedRating, reviewText)
                    setShowRatingModal(false)
                    setIsCompletedModal(true)
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Rating & Cairkan Dana Escrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="w-full py-2.5 text-gray-500 font-bold text-xs hover:text-gray-700 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Proyek Berhasil Diselesaikan!</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Rating bintang <span className="font-bold text-amber-600 inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedRating}.0</span> dan dana proyek sebesar <span className="font-bold text-gray-900">{formatRupiah(activeAkad.nominalTotal)}</span> telah berhasil dicairkan langsung ke saldo dompet <span className="font-bold text-gray-900">{activeAkad.namaPelajar}</span>.
            </p>
            <div className="p-3 bg-[#FFF1EB] rounded-2xl border border-[#FFD9CA] text-xs text-[#964825] mb-6 text-left">
              <span className="font-bold block mb-0.5">Ulasan Tersimpan:</span>
              &ldquo;{reviewText}&rdquo;
            </div>
            <button
              onClick={() => setIsCompletedModal(false)}
              className="w-full py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors cursor-pointer shadow-xs"
            >
              Tutup Ruang Akad
            </button>
          </div>
        </div>
      )}

      
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        type="invoice"
        akad={activeAkad}
      />
    </div>
  )
}
