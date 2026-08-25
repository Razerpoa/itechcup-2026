'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'
import { useAuthUser } from '@/lib/auth-client'

export default function AiAssistant() {
  const user = useAuthUser()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Halo! Saya asisten virtual Mitra Muda. Saya siap membantu Anda seputar cara daftar, verifikasi akun, membuat proyek, cara melamar, sistem pembayaran escrow, dan fitur platform lainnya. Silakan tanya!'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  function getAIResponse(message: string, userRole?: string): string {
    const msg = message.toLowerCase()
    
    if (msg.includes('daftar') || msg.includes('registrasi') || msg.includes('register')) {
      return 'Untuk mendaftar, pilih peran Anda di halaman utama: Pelajar, UMKM, atau Sekolah. Isi formulir pendaftaran, lalu tunggu verifikasi dari admin atau sekolah Anda.'
    }
    if (msg.includes('verif')) {
      if (userRole === 'pelajar') return 'Verifikasi akun pelajar dilakukan oleh pihak sekolah Anda. Pastikan Anda mendaftar dengan nama sekolah yang benar. Sekolah Anda perlu login ke portal sekolah dan menyetujui verifikasi Anda.'
      if (userRole === 'umkm') return 'Verifikasi UMKM dilakukan oleh admin Mitra Muda. Pastikan data usaha Anda lengkap dan valid. Proses verifikasi biasanya memakan waktu 1-3 hari kerja.'
      return 'Verifikasi akun diperlukan agar Anda dapat menggunakan seluruh fitur platform. Pelajar diverifikasi oleh sekolah, UMKM oleh admin Mitra Muda.'
    }
    if (msg.includes('proyek') || msg.includes('lowongan')) {
      if (userRole === 'pelajar') return 'Sebagai pelajar, Anda bisa menjelajahi proyek di halaman Marketplace. Klik proyek yang diminati, baca deskripsinya, lalu klik Lamar dan isi proposal Anda.'
      if (userRole === 'umkm') return 'Untuk membuat proyek, klik tombol Buat Proyek di dashboard UMKM Anda. Isi judul, deskripsi, anggaran, dan deadline proyek. Pastikan akun UMKM Anda sudah terverifikasi terlebih dahulu.'
      return 'Proyek adalah lowongan pekerjaan dari UMKM untuk pelajar. Anda bisa melihat semua proyek di halaman Marketplace.'
    }
    if (msg.includes('escrow') || msg.includes('dp') || msg.includes('bayar') || msg.includes('pembayaran')) {
      return 'Sistem escrow Mitra Muda menjamin keamanan transaksi. UMKM menyetor DP (30-50%) ke rekening bersama Mitra Muda. Dana hanya dicairkan ke pelajar setelah pekerjaan selesai dan disetujui UMKM.'
    }
    if (msg.includes('saldo') || msg.includes('tarik') || msg.includes('dompet')) {
      return 'Saldo pelajar tersimpan di Dompet Mitra Muda. Anda bisa menarik saldo ke GoPay, OVO, atau Dana melalui halaman Dompet. Pencairan diproses admin dalam 1x24 jam.'
    }
    if (msg.includes('lamaran') || msg.includes('lamar') || msg.includes('apply')) {
      return 'Untuk melamar proyek: (1) Buka halaman Marketplace, (2) Pilih proyek yang sesuai keahlian, (3) Klik Lamar Proyek, (4) Isi harga penawaran dan pesan motivasi, (5) Kirim lamaran. UMKM akan menghubungi Anda jika tertarik.'
    }
    if (msg.includes('npsn') || msg.includes('sekolah')) {
      return 'NPSN adalah Nomor Pokok Sekolah Nasional, kode unik 8 digit tiap sekolah. Untuk mendaftar sebagai Sekolah di Mitra Muda, masukkan NPSN sekolah Anda. Sistem akan otomatis memvalidasi dengan data Kemendikdasmen.'
    }
    if (msg.includes('kontak') || msg.includes('bantuan') || msg.includes('support') || msg.includes('hubungi')) {
      return 'Tim support Mitra Muda siap membantu! Hubungi kami via: Email mitramuda.id@gmail.com, WhatsApp +62 812-3456-7890, atau Telegram @MitraMudaID. Jam layanan: Senin-Jumat pukul 08.00-17.00 WIB.'
    }
    if (msg.includes('halo') || msg.includes('hi') || msg.includes('hello') || msg.includes('hai')) {
      return `Halo! Selamat datang di Mitra Muda. Saya bisa membantu Anda memahami cara kerja platform ini. Silakan tanyakan apapun seputar pendaftaran, verifikasi akun, marketplace proyek, sistem pembayaran, atau fitur lainnya!`
    }
    if (msg.includes('apa') && msg.includes('mitra muda')) {
      return 'Mitra Muda adalah platform yang menghubungkan pelajar berbakat Indonesia dengan UMKM lokal. Pelajar bisa mendapatkan penghasilan dari proyek nyata, UMKM mendapatkan talenta muda berkualitas, dengan sistem transaksi aman tanpa syarat rekening bank atau KTP.'
    }
    
    return 'Terima kasih atas pertanyaan Anda. Untuk informasi lebih lanjut, silakan kunjungi halaman Panduan kami atau hubungi tim support via WhatsApp di +62 812-3456-7890. Kami siap membantu Anda!'
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setTimeout(() => {
      const aiResponse = { id: (Date.now() + 1).toString(), role: 'assistant', text: getAIResponse(userMsg.text, user?.role) }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 800)
  }

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white shadow-2xl flex items-center justify-center cursor-pointer transition-all"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
        {!isOpen && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-1 right-1 border-2 border-white" />}
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EAEAEA] flex flex-col overflow-hidden h-[480px]">
          <div className="p-4 border-b border-gray-100 bg-[#FFF7F3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-[#FF9B71] text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Asisten Mitra Muda</h3>
                <p className="text-xs text-gray-500">Tanya apapun seputar platform</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`px-4 py-2.5 text-xs max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-[#FF9B71] text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 h-10 bg-[#F5F5F5] rounded-full px-4 text-xs outline-none focus:ring-2 focus:ring-[#FF9B71]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-[#FF9B71] hover:bg-[#F5865A] text-white flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
