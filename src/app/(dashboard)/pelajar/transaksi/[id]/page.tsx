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
  ShieldCheck,
  Sparkles,
  Send,
  UploadCloud,
  Briefcase,
  Award,
  MessageCircle
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useAkadStore, sendAkadChat, submitPelajarDeliverable, syncAkadWithDB } from '@/lib/akad-store'
import InvoiceModal from '@/components/invoice-modal'

export default function PelajarTransaksiRoomPage() {
  const params = useParams()
  const rawId = (params?.id as string) || '1'
  const user = useAuthUser()
  const akadState = useAkadStore()

  useEffect(() => {
    syncAkadWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  let activeAkad =
    akadState.akadList.find(
      (a) => a.id === rawId || a.proyekId === rawId || a.id === 'akad-' + rawId || (user?.id && a.pelajarId === user.id)
    ) || akadState.akadList[0]

  if (!activeAkad) {
    const matchingLamaran =
      akadState.lamaranList.find(
        (l) => l.id === rawId || l.proyekId === rawId || l.status === 'ACCEPTED' || (user?.id && l.pelajarId === user.id)
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
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [fileNameInput, setFileNameInput] = useState('')

  if (!activeAkad) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-8 sm:p-14 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4 font-bold">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
            Belum Ada Ruang Akad Berjalan
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            Ruang akad transaksi akan otomatis dibuat ketika proposal lamaran yang kamu ajukan pada proyek di marketplace telah diterima oleh pemilik UMKM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors shadow-xs"
            >
              Jelajahi Lowongan Marketplace
            </Link>
            <Link
              href="/pelajar"
              className="w-full sm:w-auto px-6 py-3 bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] rounded-full font-bold text-xs hover:bg-[#FFD9CA] transition-colors"
            >
              Kembali ke Dashboard Siswa
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
      senderName: user.nama || 'Pelajar Mitra Muda',
      senderRole: 'pelajar',
      recipientId: activeAkad.umkmId,
      text: inputMsg.trim()
    })
    setInputMsg('')
  }

  const handleUploadDeliverable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileNameInput.trim()) return

    submitPelajarDeliverable(activeAkad.id, {
      fileName: fileNameInput.trim(),
      fileSize: '14.2 MB'
    })

    if (user) {
      sendAkadChat({
        proyekId: activeAkad.proyekId,
        senderId: user.id,
        senderName: user.nama || 'Pelajar',
        senderRole: 'pelajar',
        recipientId: activeAkad.umkmId,
        text: `[Penyerahan Karya]: Berkas "${fileNameInput.trim()}" telah saya unggah untuk ditinjau.`
      })
    }

    setFileNameInput('')
    setShowUploadModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto h-[820px] flex flex-col bg-white rounded-3xl shadow-xs border border-[#EAEAEA] overflow-hidden">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-gray-50/50 flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pelajar" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer">
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
                Penyelenggara: <strong className="text-gray-900">{activeAkad.namaUsaha}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Cetak Surat Keterangan Pengalaman Kerja Resmi"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Surat Pengalaman</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Halo pihak ${activeAkad.namaUsaha}, saya ${activeAkad.namaPelajar} terkait proyek "${activeAkad.judulProyek}" di Mitra Muda: https://www.mitramuda.biz.id/pelajar/transaksi/${rawId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WA UMKM</span>
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
              <span className="text-[10px] uppercase font-bold text-[#964825]">Pengerjaan</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-[#FF9B71] text-white ring-4 ring-[#FFF1EB]' : 'bg-gray-200 text-gray-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-[#964825]">Review UMKM</span>
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
          <span>Status Rekber: DP {formatRupiah(activeAkad.nominalDP)} aman di rekening bersama admin</span>
        </div>
        <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline">
          Pelunasan otomatis cair ke Dompet saat UMKM menyetujui
        </span>
      </div>

      <main className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] flex flex-col gap-4">
        {projectChats.length > 0 ? (
          projectChats.map((msg) => {
            const isMe = msg.senderRole === 'pelajar'
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
            <p className="font-bold text-gray-600">Ruang Akad Aktif</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Diskusikan detail pengerjaan atau serahkan file karyamu ke {activeAkad.namaUsaha}.
            </p>
          </div>
        )}

        {activeAkad.deliverables.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#FFD9CA] shadow-xs max-w-md self-center w-full my-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF9B71]" />
                <span>Karya yang Diserahkan</span>
              </span>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                Sedang Ditinjau UMKM
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
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t border-[#EAEAEA] flex flex-col gap-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Tulis pesan untuk pemilik UMKM..."
            className="flex-1 h-11 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-1">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full py-3 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Serahkan / Unggah Berkas Hasil Karya</span>
          </button>
        </div>
      </footer>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Serahkan Berkas Deliverable</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Kirimkan nama berkas atau tautan hasil karya final (ZIP, Google Drive, Figma) untuk ditinjau oleh {activeAkad.namaUsaha}.
            </p>

            <form onSubmit={handleUploadDeliverable} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nama File / Tautan Deliverable:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desain_Final_SiapCetak.zip atau link Drive"
                  value={fileNameInput}
                  onChange={(e) => setFileNameInput(e.target.value)}
                  className="w-full h-11 bg-[#F5F5F5] rounded-2xl px-4 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] cursor-pointer shadow-xs"
                >
                  Kirim ke UMKM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate / Surat Pengalaman Modal */}
      <InvoiceModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        type="certificate"
        akad={activeAkad}
      />
    </div>
  )
}
