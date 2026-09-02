'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  Send,
  Star,
  Receipt,
  MessageCircle,
  ExternalLink,
  ImageIcon,
  X,
  RefreshCw,
  Clock,
  AlertCircle,
  Edit,
  Eye,
  Paperclip,
  Camera
} from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import {
  useAkadStore,
  sendAkadChat,
  completeAkadAndPayout,
  requestRevisionWork,
  syncAkadWithDB,
  ChatAttachment
} from '@/lib/akad-store'
import { useEscrowStore, syncEscrowWithDB } from '@/lib/escrow-store'
import InvoiceModal from '@/components/invoice-modal'

export default function UmkmTransaksiRoomPage() {
  const params = useParams()
  const rawId = (params?.id as string) || '1'
  const user = useAuthUser()
  const akadState = useAkadStore()
  const escrowState = useEscrowStore()
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const chatImageInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    syncAkadWithDB()
    syncEscrowWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
      syncEscrowWithDB()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const activeAkad =
    akadState.akadList.find(
      (a) =>
        a.id === rawId ||
        a.proyekId === rawId ||
        a.id === 'akad-' + rawId ||
        (user?.id && a.umkmId === user.id)
    ) || akadState.akadList[0]

  const [inputMsg, setInputMsg] = useState('')
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [isCompletedModal, setIsCompletedModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)

  const [selectedRating, setSelectedRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('Pekerjaan diselesaikan dengan sangat baik, komunikasi responsif, dan hasil deliverable memuaskan!')

  useEffect(() => {
    syncAkadWithDB()
    syncEscrowWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [akadState.chatMessages])

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

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMB = file.size / (1024 * 1024)
    const sizeStr = sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      setChatAttachment({
        name: file.name,
        size: sizeStr,
        type: 'image',
        dataUrl: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMB = file.size / (1024 * 1024)
    const sizeStr = sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`

    const reader = new FileReader()
    reader.onload = () => {
      setChatAttachment({
        name: file.name,
        size: sizeStr,
        type: 'file',
        dataUrl: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputMsg.trim() && !chatAttachment) || !user) return

    sendAkadChat({
      proyekId: activeAkad.proyekId,
      judulProyek: activeAkad.judulProyek,
      senderId: user.id,
      senderName: user.namaUsaha || user.nama || 'Pemilik Usaha',
      senderRole: 'umkm',
      recipientId: activeAkad.pelajarId,
      recipientName: activeAkad.namaPelajar,
      namaUsaha: user.namaUsaha || '',
      text: inputMsg.trim(),
      attachment: chatAttachment || undefined
    })

    setInputMsg('')
    setChatAttachment(null)
    if (chatImageInputRef.current) chatImageInputRef.current.value = ''
    if (chatFileInputRef.current) chatFileInputRef.current.value = ''
  }

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault()
    if (!revisionNotes.trim()) return

    requestRevisionWork(activeAkad.id, revisionNotes.trim())
    setRevisionNotes('')
    setShowRevisionModal(false)
  }

  const handleCompletePayout = () => {
    completeAkadAndPayout(activeAkad.id, selectedRating, reviewText)
    setShowRatingModal(false)
    setIsCompletedModal(true)
  }

  return (
    <div className="max-w-4xl mx-auto h-[860px] flex flex-col bg-white rounded-3xl shadow-xs border border-[#EAEAEA] overflow-hidden">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-gray-50/70 flex flex-col gap-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/umkm"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-gray-900">{activeAkad.judulProyek}</h1>
                <span className="bg-[#FFF1EB] text-[#964825] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-[#FFD9CA]">
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
            >
              <Receipt className="w-3.5 h-3.5 text-[#FF9B71]" />
              <span>Invoice DP & Pelunasan</span>
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

        <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-gray-800">Status Akad Transaksi:</span>
            {step === 4 ? (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Proyek Selesai & Dana Lunas ke Siswa</span>
              </span>
            ) : step === 3 ? (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-extrabold border border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>Karya Siswa Masuk & Siap Ditinjau</span>
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-extrabold border border-amber-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-amber-600" />
                <span>Dalam Pengerjaan / Menunggu Revisi Siswa</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold">
            {activeAkad.deliverables.length} Berkas Karya Diterima
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFAFA]">
        {step === 4 && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900">Proyek Telah Selesai & Dana Berhasil Dicairkan</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Anda telah menyetujui hasil karya siswa dan melepaskan dana escrow sebesar {formatRupiah(activeAkad.nominalTotal)} langsung ke dompet digital {activeAkad.namaPelajar}.
              </p>
              {activeAkad.ulasan && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-xl text-xs text-emerald-900 italic border border-emerald-200">
                  &ldquo;{activeAkad.ulasan}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        {projectChats.length > 0 ? (
          projectChats.map((msg) => {
            const isMe = msg.senderRole === 'umkm'
            const isDeliverableNote = msg.text.startsWith('[Penyerahan Karya]')
            const isRevisionNote = msg.text.startsWith('[Permintaan Revisi]')

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] font-bold text-gray-500 mb-0.5 px-1">
                  {msg.senderName}
                </span>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs font-medium leading-relaxed ${
                    isDeliverableNote
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs'
                      : isRevisionNote
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                      : isMe
                      ? 'bg-[#FF9B71] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {msg.attachment && (
                    <div className="mb-2">
                      {msg.attachment.type === 'image' && msg.attachment.dataUrl ? (
                        <div
                          onClick={() => setSelectedPreviewImage(msg.attachment?.dataUrl || null)}
                          className="rounded-xl overflow-hidden cursor-pointer relative max-w-xs border border-black/10 hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={msg.attachment.dataUrl}
                            alt={msg.attachment.name}
                            className="max-h-60 w-full object-cover rounded-xl"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md">
                            {msg.attachment.size}
                          </div>
                        </div>
                      ) : (
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                          isMe ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs truncate">{msg.attachment.name}</p>
                              <p className="text-[10px] opacity-80">{msg.attachment.size}</p>
                            </div>
                          </div>
                          {msg.attachment.dataUrl && (
                            <a
                              href={msg.attachment.dataUrl}
                              download={msg.attachment.name}
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isMe ? 'bg-white/30 hover:bg-white/40 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                              }`}
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="font-bold text-gray-600">Mulai Obrolan dengan Siswa</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Kirim arahan kerja, lampirkan foto/dokumen contoh, atau diskusikan detail proyek dengan {activeAkad.namaPelajar} di sini.
            </p>
          </div>
        )}

        {activeAkad.deliverables.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#FFD9CA] shadow-xs max-w-lg mx-auto w-full my-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF9B71]" />
                <span>Deliverable Karya Siswa ({activeAkad.deliverables.length})</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                step === 4
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {step === 4 ? 'Disetujui' : 'Siap Ditinjau'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {activeAkad.deliverables.map((del) => (
                <div
                  key={del.id}
                  className="bg-[#FAFAFA] rounded-xl p-3 flex items-center justify-between border border-gray-100 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {del.filePreview ? (
                      <div
                        onClick={() => setSelectedPreviewImage(del.filePreview || null)}
                        className="w-12 h-12 rounded-lg overflow-hidden relative border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={del.filePreview}
                          alt={del.fileName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : del.fileType === 'pdf' ? (
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                        <FileText className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0 border border-[#FFD9CA]">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-gray-900 truncate">{del.fileName}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>{del.fileSize}</span>
                        <span>•</span>
                        <span>{formatDate(del.uploadedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {del.fileUrl ? (
                      <a
                        href={del.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        title="Buka Tautan File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : del.filePreview ? (
                      <button
                        onClick={() => setSelectedPreviewImage(del.filePreview || null)}
                        className="p-2 rounded-xl bg-[#FFF1EB] text-[#964825] hover:bg-[#FFD9CA] transition-colors cursor-pointer"
                        title="Lihat Pratinjau Gambar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[11px] text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              Periksa berkas hasil karya di atas. Anda dapat meminta revisi atau menyetujui proyek untuk mencairkan dana escrow ke siswa.
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </main>

      <footer className="p-4 bg-white border-t border-[#EAEAEA] flex flex-col gap-2">
        {chatAttachment && (
          <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {chatAttachment.type === 'image' && chatAttachment.dataUrl ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-300 shrink-0">
                  <img src={chatAttachment.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-extrabold text-xs text-gray-900 truncate">{chatAttachment.name}</p>
                <p className="text-[10px] text-gray-500">{chatAttachment.size}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatAttachment(null)
                if (chatImageInputRef.current) chatImageInputRef.current.value = ''
                if (chatFileInputRef.current) chatFileInputRef.current.value = ''
              }}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={chatImageInputRef}
            onChange={handleChatImageSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={chatFileInputRef}
            onChange={handleChatFileSelect}
            accept="*/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => chatImageInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Pilih Foto dari Galeri / Kamera Langsung"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => chatFileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Pilih Berkas / Dokumen dari Folder Langsung"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={`Tulis pesan atau catatan revisi untuk ${activeAkad.namaPelajar}...`}
            className="flex-1 h-11 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() && !chatAttachment}
            className="w-11 h-11 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => setShowRevisionModal(true)}
            className="w-full sm:w-1/2 py-3 rounded-full border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-[#FF9B71]" />
            <span>Minta Revisi Karya</span>
          </button>

          <button
            onClick={() => {
              if (activeAkad.step === 4) {
                alert('Proyek ini sudah berstatus selesai dan dana sudah dicairkan ke dompet siswa.')
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
            <span>{activeAkad.step === 4 ? 'Proyek Telah Selesai (Lunas)' : 'Setujui Karya & Selesaikan Proyek'}</span>
          </button>
        </div>
      </footer>

      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#FF9B71]" />
                <h3 className="text-lg font-extrabold text-gray-900">Minta Revisi Karya</h3>
              </div>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Tuliskan detail perbaikan yang Anda inginkan. Status akad akan beralih ke mode <strong>Dalam Pengerjaan/Revisi</strong> dan siswa akan segera memperbaikinya.
            </p>

            <form onSubmit={handleSendRevision} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Catatan Revisi & Permintaan Perbaikan:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Mohon perbaiki ukuran banner menjadi 1920x1080 dan ubah palet warna sesuai logo toko kami..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-2xl p-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#964825] text-white rounded-full font-bold text-xs hover:bg-[#7D3B1E] cursor-pointer shadow-xs"
                >
                  Kirim Catatan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Beri Rating & Ulasan Siswa</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bagikan pengalaman kerja Anda bersama <strong className="text-gray-900">{activeAkad.namaPelajar}</strong>. Rating Anda akan memperkuat portofolio siswa dan mencairkan sisa dana escrow!
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
                  onClick={handleCompletePayout}
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

      {selectedPreviewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-extrabold text-sm text-gray-900">Pratinjau Foto</h4>
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={selectedPreviewImage}
                alt="Preview"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
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
