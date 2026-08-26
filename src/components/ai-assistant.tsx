'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Headphones, MessageCircle, Mail, Sparkles, PhoneCall } from 'lucide-react'
import { useAuthUser } from '@/lib/auth-client'

export default function AiAssistant() {
  const user = useAuthUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'support'>('chat')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Halo! Saya asisten virtual Mitra Muda. Saya siap membantu Anda seputar pendaftaran, verifikasi akun, pembuatan proyek, cara melamar, sistem escrow, atau kendala lainnya. Silakan pilih topik atau ketik pertanyaan Anda!'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activeTab])

  function getAIResponse(message: string, userRole?: string): string {
    const msg = message.toLowerCase()

    if (msg.includes('daftar') || msg.includes('registrasi') || msg.includes('register')) {
      return 'Untuk mendaftar, pilih peran Anda di halaman utama: Pelajar, UMKM, atau Sekolah. Isi formulir pendaftaran, unggah bukti identitas (kartu pelajar untuk siswa / NIB bukti usaha untuk UMKM), lalu tunggu proses verifikasi.'
    }
    if (msg.includes('verif')) {
      if (userRole === 'pelajar') return 'Verifikasi akun pelajar dilakukan oleh pihak sekolah atau admin Mitra Muda. Pastikan data nama dan NIS sesuai dengan data sekolah.'
      if (userRole === 'umkm') return 'Verifikasi UMKM dilakukan oleh admin Mitra Muda setelah meninjau bukti usaha (NIB/foto toko). Setelah disetujui, Anda dapat langsung membuat lowongan proyek dan top up saldo escrow.'
      return 'Verifikasi akun menjamin keamanan seluruh pihak di Mitra Muda. Pelajar diverifikasi status sekolahnya, dan UMKM diverifikasi legalitas usahanya oleh admin.'
    }
    if (msg.includes('proyek') || msg.includes('lowongan')) {
      if (userRole === 'pelajar') return 'Sebagai pelajar, buka halaman Marketplace untuk menemukan proyek yang sesuai keahlianmu, baca detail ketentuan, lalu klik "Lamar Proyek".'
      if (userRole === 'umkm') return 'Untuk membuat proyek, masuk ke Dashboard UMKM lalu klik tombol "Buat Proyek". Pastikan akun Anda sudah diverifikasi oleh admin terlebih dahulu.'
      return 'Proyek adalah lowongan pekerjaan dari UMKM untuk talenta pelajar. Anda bisa melihat semua proyek aktif di menu Marketplace.'
    }
    if (msg.includes('escrow') || msg.includes('dp') || msg.includes('bayar') || msg.includes('pembayaran') || msg.includes('rekber')) {
      return 'Sistem DP Escrow Mitra Muda menjamin keamanan transaksi tanpa perlu rekening bank untuk pelajar. UMKM menyetor DP ke rekening bersama resmi Mitra Muda, dan dana baru dicairkan ke dompet siswa setelah hasil kerja disetujui UMKM.'
    }
    if (msg.includes('saldo') || msg.includes('tarik') || msg.includes('dompet') || msg.includes('withdraw')) {
      return 'Saldo siswa tersimpan aman di Dompet Mitra Muda. Anda bisa menarik saldo langsung ke e-wallet seperti GoPay, OVO, atau Dana tanpa syarat memiliki rekening bank.'
    }
    if (msg.includes('lamaran') || msg.includes('lamar') || msg.includes('proposal')) {
      return 'Untuk melamar: (1) Buka Marketplace, (2) Pilih proyek yang cocok, (3) Tuliskan penawaran dan deskripsi solusi Anda, (4) Kirim proposal. Pemilik UMKM akan meninjau dan menerima proposal Anda di ruang akad.'
    }
    if (msg.includes('npsn') || msg.includes('sekolah')) {
      return 'NPSN (Nomor Pokok Sekolah Nasional) adalah 8 digit kode unik sekolah. Mitra Muda terintegrasi dengan database Kemendikdasmen untuk memvalidasi legalitas sekolah secara otomatis.'
    }
    if (msg.includes('kontak') || msg.includes('bantuan') || msg.includes('support') || msg.includes('hubungi') || msg.includes('cs')) {
      return 'Anda bisa langsung beralih ke tab "Hubungi CS" di bagian atas jendela ini, atau hubungi WhatsApp Customer Care kami di 0895-6224-94773.'
    }
    if (msg.includes('halo') || msg.includes('hi') || msg.includes('hello') || msg.includes('hai') || msg.includes('pagi') || msg.includes('siang') || msg.includes('malam')) {
      return 'Halo! Senang bisa membantu. Ada yang bisa saya jelaskan mengenai fitur, alur verifikasi, atau transaksi di Mitra Muda?'
    }
    if (msg.includes('mitra muda') || msg.includes('apa itu')) {
      return 'Mitra Muda adalah platform pemberdayaan talenta pelajar Indonesia yang menghubungkan siswa berbakat dengan UMKM lokal melalui marketplace jasa dan sistem transaksi aman tanpa syarat KTP/rekening bank.'
    }

    return 'Pertanyaan yang bagus! Untuk panduan lengkap silakan akses menu Panduan, atau hubungi tim Customer Support kami melalui tab "Hubungi CS" di atas.'
  }

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return
    const userMsg = { id: Date.now().toString(), role: 'user', text: query.trim() }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: getAIResponse(userMsg.text, user?.role)
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 600)
  }

  const quickPrompts = [
    'Cara Verifikasi Akun',
    'Cara Buat Proyek UMKM',
    'Sistem DP Escrow',
    'Cara Tarik Saldo Siswa'
  ]

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka Asisten Mitra Muda"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] active:scale-95 text-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 border-2 border-white" />
          </div>
        )}
      </button>

      {/* Assistant Popup Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[500px] max-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-[#FFF7F3] to-[#FFF1EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF9B71] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight">Asisten Mitra Muda</h3>
                <p className="text-[11px] text-gray-500">Pusat Bantuan & Tanya AI</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shadow-xs"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100 bg-white p-1 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#FFF1EB] text-[#964825] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tanya AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'support'
                  ? 'bg-[#FFF1EB] text-[#964825] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Hubungi CS</span>
            </button>
          </div>

          {/* TAB 1: Chat AI */}
          {activeTab === 'chat' ? (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#FAFAFA]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#FF9B71] text-white rounded-2xl rounded-tr-xs shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex gap-1.5 items-center shadow-2xs">
                      <div className="w-2 h-2 rounded-full bg-[#FF9B71] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#FF9B71] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#FF9B71] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-[#FFF1EB] hover:text-[#964825] text-[11px] font-medium text-gray-700 whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2.5 sm:p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 h-10 bg-[#F5F5F5] rounded-full px-4 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Kirim Pesan"
                  className="w-10 h-10 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* TAB 2: Direct Support Channels */
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
              <div className="p-3 bg-[#FFF7F3] border border-[#FFD9CA] rounded-2xl">
                <h4 className="font-extrabold text-xs text-[#964825] mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  Bantuan Langsung Tim Mitra Muda
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Ada kendala verifikasi, deposit escrow, atau pencairan saldo? Tim Customer Support siap membantu Anda.
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="https://wa.me/62895622494773?text=Halo%20Admin%20Mitra%20Muda,%20saya%20butuh%20bantuan%20seputar%20platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">WhatsApp CS</div>
                    <div className="text-[11px] text-emerald-700 font-medium">0895-6224-94773 (Raffa)</div>
                    <div className="text-[10px] text-gray-500">Respon cepat & konsultasi langsung</div>
                  </div>
                </a>

                <a
                  href="mailto:raffaxzee@gmail.com?subject=Pertanyaan%20Platform%20Mitra%20Muda"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50/40 transition-all group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">Email Resmi</div>
                    <div className="text-[11px] text-red-700 font-medium">raffaxzee@gmail.com</div>
                    <div className="text-[10px] text-gray-500">Bantuan formal & kerja sama</div>
                  </div>
                </a>
              </div>

              <div className="text-[11px] text-center text-gray-400 pt-2 border-t border-gray-100">
                Jam Layanan: Senin - Minggu (08.00 - 21.00 WIB)
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

