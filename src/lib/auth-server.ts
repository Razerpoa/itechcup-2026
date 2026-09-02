import { NextRequest } from 'next/server'
import { verifyJwt, JwtPayload } from './jwt'

export const AUTH_COOKIE_NAME = 'mitra_muda_session'

export function getAuthUserFromRequest(request: NextRequest): JwtPayload | null {
  
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (cookieToken) {
    const verified = verifyJwt(cookieToken)
    if (verified) return verified
  }

  
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    const verified = verifyJwt(token)
    if (verified) return verified
  }

  return null
}
