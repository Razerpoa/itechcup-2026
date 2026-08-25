import { NextResponse, userAgent, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { device } = userAgent(request)
  const viewport = device.type === 'mobile' ? 'mobile' : device.type === 'tablet' ? 'tablet' : 'desktop'

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-device-type', viewport)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Security Headers (OWASP Hardening)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
