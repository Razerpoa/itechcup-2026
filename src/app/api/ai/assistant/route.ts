import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_INSTRUCTION = `
Kamu adalah "Asisten Virtual Mitra Muda", AI resmi yang ramah, solutif, dan profesional untuk platform **Mitra Muda — Platform Pemberdayaan Talenta Pelajar Indonesia**.

Konteks Utama Platform:
1. **Tujuan Mitra Muda:** Menghubungkan talenta pelajar (SMK/SMA) dengan UMKM Indonesia untuk mengerjakan proyek nyata dan meningkatkan portofolio serta pendapatan mandiri.
2. **Peran Pengguna:**
   - **Pelajar:** Mendaftar dengan NIS & kartu pelajar, mencari proyek di Marketplace, menawarkan jasa, akad kesepakatan aman, dan menarik penghasilan langsung ke e-wallet (GoPay, OVO, Dana) tanpa syarat KTP atau rekening bank.
   - **UMKM:** Mendaftarkan bisnis, diverifikasi admin melalui NIB/foto toko, memposting lowongan proyek, menyetor DP ke Rekening Bersama (Escrow), dan memberikan review/rating setelah proyek selesai.
   - **Sekolah:** Mendaftar dengan NPSN 8-digit resmi (tervalidasi API Kemendikdasmen RI), memverifikasi data siswa sekolahnya, dan memantau kinerja portofolio siswa.
   - **Admin (Tuan):** Memverifikasi pendaftaran legalitas UMKM, sekolah, dan menjaga keamanan transaksi escrow.
3. **Fitur Unggulan:**
   - Sistem Transaksi DP Escrow (Aman bagi siswa dan UMKM).
   - Verifikasi Sekolah Anti-Impostor terhubung ke basis data Kemendikdasmen.
   - Portofolio & Rating publik pelajar.
   - Verifikasi email pendaftaran & reset password via Resend/Gmail.
4. **Kontak Layanan Pengguna (Customer Support):**
   - WhatsApp CS: 0895-6224-94773 (Raffa)
   - Email: raffaxzee@gmail.com / noreply@mitramuda.raffzdigital.biz.id

Gaya Jawaban:
- Gunakan Bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.
- Jika relevan, gunakan poin-poin terstruktur agar mudah dibaca pengguna.
- Sesuaikan jawaban dengan peran pengguna (Pelajar / UMKM / Sekolah) jika diketahui.
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [], userRole = 'pengunjung', userNama } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        reply: 'Halo! Saya asisten Mitra Muda. Saat ini saya siap membantu Anda seputar pendaftaran, sistem escrow, pencairan saldo dompet, verifikasi NPSN sekolah, atau lowongan proyek di Marketplace!'
      })
    }

    // Format chat history for Gemini API
    const formattedContents: any[] = []

    // Add conversation history
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) { // keep last 6 messages for context
        if (msg.role === 'user' || msg.role === 'assistant') {
          formattedContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          })
        }
      }
    }

    // Add current user message with role context
    const userContextPrefix = userNama
      ? `[Pengguna: ${userNama}, Peran: ${userRole}] `
      : `[Peran: ${userRole}] `

    formattedContents.push({
      role: 'user',
      parts: [{ text: `${userContextPrefix}${message.trim()}` }]
    })

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash']
    let replyText: string | null = null

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        })

        if (res.ok) {
          const data = await res.json()
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (candidateText && candidateText.trim()) {
            replyText = candidateText.trim()
            break
          }
        } else {
          const errBody = await res.text().catch(() => '')
          console.warn(`Model ${model} returned status ${res.status}:`, errBody.slice(0, 150))
        }
      } catch (err) {
        console.warn(`Error attempting model ${model}:`, err)
      }
    }

    if (!replyText) {
      return NextResponse.json({
        success: true,
        reply: 'Halo! Saya asisten resmi Mitra Muda. Ada yang bisa saya bantu terkait pembuatan proyek UMKM, pendaftaran pelajar, verifikasi NPSN sekolah, atau sistem pembayaran DP escrow?'
      })
    }

    return NextResponse.json({
      success: true,
      reply: replyText
    })
  } catch (error) {
    console.error('Error handling AI chat assistant:', error)
    return NextResponse.json({
      success: true,
      reply: 'Terjadi gangguan jaringan sementara pada layanan AI. Silakan tanyakan kembali atau hubungi Customer Support di WhatsApp 0895-6224-94773.'
    })
  }
}
