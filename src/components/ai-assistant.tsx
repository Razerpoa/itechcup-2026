'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Headphones, MessageCircle, Mail, Sparkles, PhoneCall, AlertCircle } from 'lucide-react'
import { useAuthUser } from '@/lib/auth-client'

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  text: string
  isError?: boolean
}

function FormattedMessage({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
  }

  // Clean raw symbols & extra dashes
  const cleaned = text
    .replace(/^---\s*$/gm, '')
    .replace(/---\s*###/g, '\n###')
    .replace(/\r\n/g, '\n')
    .trim()

  const paragraphs = cleaned.split(/\n{2,}/)

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#2D2319]">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  return (
    <div className="space-y-2.5 text-[12.5px] leading-relaxed text-gray-800">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').map((l) => l.trim()).filter(Boolean)

        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              // Header line: ### or ## or #
              if (/^#+\s/.test(line)) {
                const title = line.replace(/^#+\s*/, '')
                return (
                  <div key={lIdx} className="font-bold text-[13px] text-[#964825] mt-2 mb-1 flex items-center gap-1.5">
                    {renderInline(title)}
                  </div>
                )
              }

              // Numbered list: 1. or 1)
              const numMatch = line.match(/^(\d+[\.\)])\s*(.*)/)
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-1">
                    <span className="font-bold text-[#964825] bg-[#FFF1EB] border border-[#FFD9CA] px-1.5 py-0.5 rounded-md text-[10px] shrink-0 mt-0.5">
                      {numMatch[1]}
                    </span>
                    <div className="flex-1 leading-relaxed text-gray-800">{renderInline(numMatch[2])}</div>
                  </div>
                )
              }

              // Bullet list: * or -
              if (line.startsWith('* ') || line.startsWith('- ')) {
                const content = line.replace(/^[\*\-]\s*/, '')
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1 my-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B71] shrink-0 mt-1.5" />
                    <div className="flex-1 leading-relaxed text-gray-800">{renderInline(content)}</div>
                  </div>
                )
              }

              // Normal paragraph line
              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInline(line)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function AiAssistant() {
  const user = useAuthUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'support'>('chat')
  const [messages, setMessages] = useState<MessageItem[]>([
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

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return
    const userMsg: MessageItem = { id: Date.now().toString(), role: 'user', text: query.trim() }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages,
          userRole: user?.role || 'pengunjung',
          userNama: user?.nama
        })
      })

      const data = await res.json()

      if (res.ok && data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: data.reply
          }
        ])
      } else {
        const errorText = data.error || 'Mohon maaf, kuota token AI saat ini sedang penuh atau mencapai batas penggunaan. Silakan coba beberapa saat lagi atau hubungi CS di tab "Hubungi CS".'
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: errorText,
            isError: true
          }
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Terjadi gangguan jaringan sementara pada layanan AI. Silakan coba lagi atau hubungi CS via tab "Hubungi CS".',
          isError: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
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
                    {msg.isError ? (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl rounded-tl-xs p-3 text-xs max-w-[88%] shadow-2xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Pemberitahuan Sistem</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('support')}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>Hubungi CS WhatsApp</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`px-3.5 py-2.5 text-xs max-w-[88%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#FF9B71] text-white rounded-2xl rounded-tr-xs shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <FormattedMessage text={msg.text} isUser={msg.role === 'user'} />
                      </div>
                    )}
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

