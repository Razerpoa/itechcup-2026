import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'Token tidak ditemukan' }, { status: 400 })
    }

    const payload = verifyJwt(token)

    if (!payload) {
      return NextResponse.json({ valid: false, error: 'Token tidak valid atau sudah kadaluarsa' }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      email: payload.email
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Gagal memverifikasi token' }, { status: 500 })
  }
}
