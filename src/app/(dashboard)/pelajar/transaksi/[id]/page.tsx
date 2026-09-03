'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Send,
  UploadCloud,
  Briefcase,
  Award,
  MessageCircle,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Paperclip,
  Camera,
  Download
} from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import {
  useAkadStore,
  sendAkadChat,
  submitPelajarDeliverable,
  syncAkadWithDB,
  ChatAttachment
} from '@/lib/akad-store'
import InvoiceModal from '@/components/invoice-modal'

export default function PelajarTransaksiRoomPage() {
  const params = useParams()
  const rawId = (params?.id as string) || '1'
  const user = useAuthUser()
  const akadState = useAkadStore()
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const chatImageInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    syncAkadWithDB()
    const interval = setInterval(() => {
      syncAkadWithDB()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const activeAkad =
    akadState.akadList.find(
      (a) =>
        a.id === rawId ||
        a.proyekId === rawId ||
        a.id === 'akad-' + rawId ||
        (user?.id && a.pelajarId === user.id)
    ) || akadState.akadList[0]

  const [inputMsg, setInputMsg] = useState('')
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)

  const [uploadType, setUploadType] = useState<'file' | 'link'>('file')
  const [fileNameInput, setFileNameInput] = useState('')
  const [fileLinkInput, setFileLinkInput] = useState('')
  const [fileCatatan, setFileCatatan] = useState('')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileSizeStr, setFileSizeStr] = useState('1.5 MB')
  const [fileTypeStr, setFileTypeStr] = useState('image')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    syncAkadWithDB()
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
      senderName: user.nama || 'Pelajar Mitra Muda',
      senderRole: 'pelajar',
      recipientId: activeAkad.umkmId,
      recipientName: activeAkad.namaUsaha,
      namaUsaha: activeAkad.namaUsaha,
      text: inputMsg.trim(),
      attachment: chatAttachment || undefined
    })

    setInputMsg('')
    setChatAttachment(null)
    if (chatImageInputRef.current) chatImageInputRef.current.value = ''
    if (chatFileInputRef.current) chatFileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileNameInput(file.name)
    const sizeInMB = file.size / (1024 * 1024)
    setFileSizeStr(sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`)

    if (file.type.startsWith('image/')) {
      setFileTypeStr('image')
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type.includes('pdf')) {
      setFileTypeStr('pdf')
      setFilePreview(null)
    } else if (file.type.includes('zip') || file.type.includes('rar')) {
      setFileTypeStr('zip')
      setFilePreview(null)
    } else {
      setFileTypeStr('document')
      setFilePreview(null)
    }
  }

  const handleUploadDeliverable = (e: React.FormEvent) => {
    e.preventDefault()
    const finalName = uploadType === 'file' ? fileNameInput.trim() : (fileNameInput.trim() || fileLinkInput.trim())
    if (!finalName) return

    submitPelajarDeliverable(activeAkad.id, {
      fileName: finalName,
      fileSize: uploadType === 'file' ? fileSizeStr : 'Tautan Eksternal',
      fileUrl: uploadType === 'link' ? fileLinkInput.trim() : undefined,
      filePreview: filePreview || undefined,
      fileType: fileTypeStr,
      catatan: fileCatatan.trim() || undefined
    })

    setFileNameInput('')
    setFileLinkInput('')
    setFileCatatan('')
    setFilePreview(null)
    setShowUploadModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-5rem)] min-h-[580px] max-h-[900px] flex flex-col bg-white rounded-3xl shadow-xs border border-[#EAEAEA] overflow-hidden">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-gray-50/70 flex flex-col gap-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/pelajar"
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

        <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-gray-800">Status Akad Proyek:</span>
            {step === 4 ? (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Proyek Telah Selesai & Dana Cair</span>
              </span>
            ) : step === 3 ? (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-extrabold border border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>Karya Diserahkan & Sedang Ditinjau UMKM</span>
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-extrabold border border-amber-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-amber-600" />
                <span>Pengerjaan Proyek / Revisi Diminta</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold">
            {activeAkad.deliverables.length} Berkas Karya Diserahkan
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFAFA]">
        {step === 4 && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900">Selamat! Proyek Selesai & Dana Lunas</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Klien UMKM telah menyetujui seluruh karya dan dana total sebesar {formatRupiah(activeAkad.nominalTotal)} telah dicairkan langsung ke Saldo Siap Cair dompetmu.
              </p>
              {activeAkad.ulasan && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-xl text-xs text-emerald-900 italic border border-emerald-200">
                  &ldquo;{activeAkad.ulasan}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && activeAkad.ulasan && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">Catatan Revisi dari Klien UMKM:</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200">
                &ldquo;{activeAkad.ulasan}&rdquo;
              </p>
              <p className="text-[11px] text-amber-700 mt-2 font-bold">
                Silakan lakukan revisi sesuai catatan di atas, kemudian unggah kembali berkas karya final melalui tombol di bawah.
              </p>
            </div>
          </div>
        )}

        {projectChats.length > 0 ? (
          projectChats.map((msg) => {
            const isMe = msg.senderRole === 'pelajar'
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
            <p className="font-bold text-gray-600">Mulai Obrolan Akad Proyek</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Diskusikan kebutuhan proyek, kirim foto/dokumen, atau koordinasikan penyerahan karya Anda di sini.
            </p>
          </div>
        )}

        {activeAkad.deliverables.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#FFD9CA] shadow-xs max-w-lg mx-auto w-full my-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF9B71]" />
                <span>Karya yang Telah Diserahkan ({activeAkad.deliverables.length})</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                step === 4
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {step === 4 ? 'Disetujui & Lunas' : 'Sedang Ditinjau UMKM'}
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
                        <FileCode className="w-5 h-5" />
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
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
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
            placeholder="Tulis pesan atau lampirkan foto/file..."
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

        {step === 4 ? (
          <div className="w-full py-2.5 px-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Karya Telah Disetujui & Dana Lunas Masuk ke Dompet Digital</span>
          </div>
        ) : (
          <div className="pt-1">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full py-2.5 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Foto / Berkas Hasil Karya Final (Tanpa Batas)</span>
            </button>
          </div>
        )}
      </footer>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Unggah Berkas Deliverable Karya</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Serahkan hasil karya (foto, desain, zip, dokumen, atau link) untuk ditinjau oleh {activeAkad.namaUsaha}.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                  uploadType === 'file'
                    ? 'bg-[#FF9B71] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unggah File / Foto Langsung
              </button>
              <button
                type="button"
                onClick={() => setUploadType('link')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                  uploadType === 'link'
                    ? 'bg-[#FF9B71] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tautan Drive / Figma / ZIP
              </button>
            </div>

            <form onSubmit={handleUploadDeliverable} className="space-y-4">
              {uploadType === 'file' ? (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    Pilih Berkas atau Foto Langsung dari Perangkat:
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip,.rar,.psd,.ai,.docx,.fig"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'image/*'
                          fileInputRef.current.click()
                        }
                      }}
                      className="p-3 rounded-2xl border-2 border-[#FFD9CA] bg-[#FFF1EB] hover:bg-[#FFE5DA] text-[#964825] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-[#FF9B71]" />
                      <span>Foto dari Galeri / Kamera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = '*/*'
                          fileInputRef.current.click()
                        }
                      }}
                      className="p-3 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Paperclip className="w-4 h-4 text-gray-600" />
                      <span>Berkas dari Folder (ZIP/PDF)</span>
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*,.pdf,.zip,.rar,.psd,.ai,.docx,.fig'
                        fileInputRef.current.click()
                      }
                    }}
                    className="border-2 border-dashed border-[#FFD9CA] bg-[#FFF1EB]/40 hover:bg-[#FFF1EB]/80 rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-7 h-7 text-[#FF9B71]" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {fileNameInput ? fileNameInput : 'Atau klik area ini untuk memilih berkas karya'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Mendukung Gambar, PDF, ZIP, PSD, Figma (Ukuran Bebas)
                      </p>
                    </div>
                  </div>

                  {filePreview && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-gray-200 shrink-0">
                        <Image src={filePreview} alt="Preview" fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-gray-900 truncate">{fileNameInput}</p>
                        <p className="text-[10px] text-gray-500">{fileSizeStr}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Terpilih
                      </span>
                    </div>
                  )}

                  {!filePreview && fileNameInput && (
                    <div className="mt-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-gray-900 truncate">{fileNameInput}</p>
                          <p className="text-[10px] text-gray-500">{fileSizeStr}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Terpilih
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Judul / Nama File Deliverable:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Desain Banner Final Siap Cetak"
                      value={fileNameInput}
                      onChange={(e) => setFileNameInput(e.target.value)}
                      className="w-full h-11 bg-[#F5F5F5] rounded-2xl px-4 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Tautan URL (Google Drive / Figma / Dropbox):
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={fileLinkInput}
                      onChange={(e) => setFileLinkInput(e.target.value)}
                      className="w-full h-11 bg-[#F5F5F5] rounded-2xl px-4 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Catatan untuk UMKM (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah disesuaikan dengan revisi warna dan font."
                  value={fileCatatan}
                  onChange={(e) => setFileCatatan(e.target.value)}
                  className="w-full h-11 bg-[#F5F5F5] rounded-2xl px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
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
                  disabled={uploadType === 'file' ? !fileNameInput : !fileLinkInput}
                  className="flex-1 py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Serahkan Karya ke UMKM
                </button>
              </div>
            </form>
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
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        type="certificate"
        akad={activeAkad}
      />
    </div>
  )
}
