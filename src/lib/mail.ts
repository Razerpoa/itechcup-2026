import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mitra Muda <onboarding@resend.dev>'

export interface SendResetMailParams {
  to: string
  userNama?: string
  resetToken?: string
}

export async function sendResetPasswordEmail({ to, userNama = 'Pengguna Mitra Muda', resetToken = 'dummy-token' }: SendResetMailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mitramuda.biz.id'
  const resetUrl = `${baseUrl}/auth/callback?type=recovery&email=${encodeURIComponent(to)}`

  if (!apiKey) {
    console.log(`[Resend Mail Simulation] Reset password email for ${to}: ${resetUrl}`)
    return { success: true, simulated: true, resetUrl }
  }

  const resend = new Resend(apiKey)
  const customFrom = process.env.RESEND_FROM_EMAIL || 'Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>'

  const emailHtml = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAFAFA; padding: 32px; border-radius: 24px; border: 1px solid #EAEAEA;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #FFF1EB; border: 1px solid #FFD9CA; padding: 12px 24px; border-radius: 100px; font-weight: bold; color: #964825; font-size: 18px;">
          Mitra Muda
        </div>
      </div>
      
      <div style="background-color: #FFFFFF; padding: 32px; border-radius: 20px; border: 1px solid #EAEAEA; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
        <h2 style="color: #111827; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Halo ${userNama},</h2>
        <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Kami menerima permintaan untuk mengembalikan kata sandi akun Mitra Muda Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #FF9B71; color: #FFFFFF; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 100px; display: inline-block; box-shadow: 0 4px 12px rgba(255, 155, 113, 0.3);">
            Atur Ulang Kata Sandi
          </a>
        </div>

        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini. Tautan ini akan kadaluwarsa dalam 60 menit demi keamanan akun Anda.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #9CA3AF; font-size: 11px;">
        © 2026 Mitra Muda — Platform Pemberdayaan Talenta Pelajar Indonesia.
      </div>
    </div>
  `

  try {
    const data = await resend.emails.send({
      from: customFrom,
      to: [to],
      subject: '🔑 Instruksi Pemulihan Kata Sandi — Mitra Muda',
      html: emailHtml,
    })

    if (data.error) {
      console.warn('Fallback ke onboarding@resend.dev karena domain pengirim utama error:', data.error)
      const fallbackData = await resend.emails.send({
        from: 'Mitra Muda <onboarding@resend.dev>',
        to: [to],
        subject: '🔑 Instruksi Pemulihan Kata Sandi — Mitra Muda',
        html: emailHtml,
      })
      return { success: true, data: fallbackData }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Gagal mengirim email via Resend:', error)
    return { success: false, error }
  }
}
