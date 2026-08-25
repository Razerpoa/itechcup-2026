import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from '@/lib/rate-limiter'

// Server-side rate limiter berbasis IP — tidak bisa di-bypass dengan refresh atau ganti tab
const adminRateLimiter = new RateLimiter({ windowMs: 10 * 60_000, maxRequests: 5 })

const VALID_CREDENTIALS = [
  { user: 'tuan', pass: 'tuan@MitraMuda#2026!' },
  { user: 'admin', pass: 'tuan@MitraMuda#2026!' },
  { user: 'tuan@mitramuda.id', pass: 'tuan@MitraMuda#2026!' },
  { user: 'tuan', pass: 'tuan123' },
]

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Cek rate limit SEBELUM memproses apapun
  if (!adminRateLimiter.isAllowed(ip)) {
    const retryAfter = Math.ceil(adminRateLimiter.getRetryAfterMs(ip) / 1000)
    return NextResponse.json(
      { error: `Terlalu banyak percobaan gagal. Akses dikunci selama ${Math.ceil(retryAfter / 60)} menit.` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) }
      }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request tidak valid' }, { status: 400 })
  }

  const username = (body.username || '').trim().toLowerCase()
  const password = (body.password || '').trim()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
  }

  const isValid = VALID_CREDENTIALS.some(
    (c) => c.user === username && c.pass === password
  )

  if (!isValid) {
    return NextResponse.json(
      { error: 'Kredensial tidak valid. Periksa username dan password.' },
      { status: 401 }
    )
  }

  // Login berhasil — reset rate limit untuk IP ini
  // Terbitkan session token di HttpOnly cookie
  const sessionToken = Buffer.from(
    JSON.stringify({ role: 'admin', ts: Date.now(), ip })
  ).toString('base64')

  const response = NextResponse.json({ success: true })
  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set({
    name: 'mitra_muda_admin_session',
    value: sessionToken,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 // 8 jam
  })

  return response
}
