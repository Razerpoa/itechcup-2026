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

Aturan Format & Kerapian Jawaban (WAJIB DIPATUHI):
- Tulis jawaban dengan rapi, terstruktur, dan enak dibaca.
- Selalu beri pemisah baris baru antar paragraf atau antar poin.
- DILARANG menumpuk simbol markdown dalam satu baris (seperti '--- ### 💡').
- Jika memberikan langkah-langkah, gunakan penomoran rapi (1. 2. 3.) dengan penjelasan di baris baru setelah judul poin.
- Gunakan cetak tebal (**teks tebal**) hanya untuk kata kunci penting.
- Buat jawaban ringkas, padat, dan langsung menjawab pertanyaan pengguna.
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
        success: false,
        error: 'Kunci API AI belum dikonfigurasi.'
      }, { status: 500 })
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

    // Mulai dari model paling bawah/hemat token terlebih dahulu.
    // Jika token/kuota habis atau error, naik ke model berikutnya.
    // Jika semua model habis, return error ke user.
    const candidateModels = [
      'gemini-3.1-flash-lite', // Paling bawah & paling hemat token
      'gemini-3.5-flash',      // Tier menengah
      'gemini-3.6-flash',      // Tier tinggi
      'gemini-3.7-flash'       // Tier teratas
    ]

    let replyText: string | null = null
    let lastErrorMsg = ''

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
            console.log(`[AI Assistant] Successfully responded using model: ${model}`)
            break
          }
        } else {
          const errBody = await res.text().catch(() => '')
          lastErrorMsg = errBody
          console.warn(`[AI Assistant] Model ${model} failed (${res.status}):`, errBody.slice(0, 120))
        }
      } catch (err: any) {
        lastErrorMsg = err?.message || ''
        console.warn(`[AI Assistant] Error calling ${model}:`, err)
      }
    }

    // Jika semua model gagal / token habis
    if (!replyText) {
      return NextResponse.json({
        success: false,
        error: 'Mohon maaf, kuota token AI saat ini sedang penuh atau mencapai batas penggunaan. Silakan coba beberapa saat lagi atau hubungi CS di tab "Hubungi CS".'
      }, { status: 429 })
    }

    return NextResponse.json({
      success: true,
      reply: replyText
    })
  } catch (error) {
    console.error('Error handling AI chat assistant:', error)
    return NextResponse.json({
      success: false,
      error: 'Terjadi gangguan jaringan sementara pada layanan AI. Silakan coba lagi.'
    }, { status: 500 })
  }
}
