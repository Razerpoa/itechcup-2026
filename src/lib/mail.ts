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
  const resetUrl = `${baseUrl}/auth/callback?type=recovery&token=${encodeURIComponent(resetToken)}`

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
        2026 Mitra Muda - Platform Pemberdayaan Talenta Pelajar Indonesia.
      </div>
    </div>
  `

  try {
    const data = await resend.emails.send({
      from: customFrom,
      to: [to],
      subject: 'Instruksi Pemulihan Kata Sandi - Mitra Muda',
      html: emailHtml,
    })

    if (data.error) {
      console.warn('Fallback ke onboarding@resend.dev karena domain pengirim utama:', data.error)
      const fallbackData = await resend.emails.send({
        from: 'Mitra Muda <onboarding@resend.dev>',
        to: [to],
        subject: 'Instruksi Pemulihan Kata Sandi - Mitra Muda',
        html: emailHtml,
      })
      if (fallbackData.error) {
        console.warn('Resend fallback notice:', fallbackData.error)
        return { success: true, simulated: true, resetUrl, data: fallbackData }
      }
      return { success: true, resetUrl, data: fallbackData }
    }

    return { success: true, resetUrl, data }
  } catch (error) {
    console.warn('Resend email notice (using secure fallback):', error)
    return { success: true, simulated: true, resetUrl }
  }
}

export interface SendConfirmMailParams {
  to: string
  userNama?: string
  role?: string
}

export async function sendConfirmationEmail({ to, userNama = 'Pengguna Mitra Muda', role = 'Pelajar' }: SendConfirmMailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mitramuda.biz.id'
  const confirmUrl = `${baseUrl}/auth/callback?type=signup&email=${encodeURIComponent(to)}`

  if (!apiKey) {
    console.log(`[Resend Mail Simulation] Confirmation email for ${to}: ${confirmUrl}`)
    return { success: true, simulated: true, confirmUrl }
  }

  const resend = new Resend(apiKey)
  const customFrom = process.env.RESEND_FROM_EMAIL || 'Mitra Muda <noreply@mitramuda.raffzdigital.biz.id>'

  const emailHtml = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0; padding: 40px 16px; background-color: #F6F3EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2D2319;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E6DFD5; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(45, 35, 25, 0.06);">
            <tr>
              <td style="height: 6px; background: linear-gradient(90deg, #FF9B71 0%, #E8754D 50%, #964825 100%);"></td>
            </tr>
            <tr>
              <td style="padding: 36px 36px 24px 36px;">
                <div style="display: inline-block; background-color: #FFF1EB; border: 1px solid #FFD9CA; border-radius: 100px; padding: 6px 14px;">
                  <span style="font-size: 11px; font-weight: 800; color: #964825; letter-spacing: 0.8px; text-transform: uppercase;">
                    Mitra Muda - ${role.toUpperCase()}
                  </span>
                </div>
                <h1 style="font-size: 22px; font-weight: 800; color: #2D2319; margin: 18px 0 8px 0; letter-spacing: -0.4px; line-height: 1.3;">
                  Konfirmasi Pendaftaran Akun Anda
                </h1>
                <p style="font-size: 14px; line-height: 1.6; color: #6B5E51; margin: 0;">
                  Halo <strong>${userNama}</strong>, terima kasih telah mendaftar di Mitra Muda. Klik tombol di bawah ini untuk memverifikasi email Anda dan masuk ke dashboard.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px; text-align: center;">
                <a href="${confirmUrl}" style="display: block; background-color: #FF9B71; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 100px; box-shadow: 0 4px 16px rgba(255, 155, 113, 0.35); text-align: center;">
                  Verifikasi & Masuk Akun
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px 28px 36px;">
                <div style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 8px; padding: 10px 12px; word-break: break-all;">
                  <a href="${confirmUrl}" style="font-size: 11px; color: #964825; text-decoration: none; font-family: monospace;">${confirmUrl}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #FAF8F5; border-top: 1px solid #EFEAE2; padding: 20px 36px; text-align: center; font-size: 11px; color: #9E8F80;">
                Jika Anda tidak merasa mendaftar di Mitra Muda, silakan abaikan email ini.<br>
                2026 Mitra Muda - <a href="https://mitramuda.biz.id" style="color: #8A7A6B;">mitramuda.biz.id</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `

  try {
    const data = await resend.emails.send({
      from: customFrom,
      to: [to],
      subject: 'Konfirmasi Pendaftaran Akun - Mitra Muda',
      html: emailHtml,
    })

    if (data.error) {
      console.warn('Fallback ke onboarding@resend.dev:', data.error)
      const fallbackData = await resend.emails.send({
        from: 'Mitra Muda <onboarding@resend.dev>',
        to: [to],
        subject: 'Konfirmasi Pendaftaran Akun - Mitra Muda',
        html: emailHtml,
      })
      return { success: true, data: fallbackData }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Gagal mengirim email konfirmasi via Resend:', error)
    return { success: false, error }
  }
}
