import { NextResponse, userAgent, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { device } = userAgent(request)
  const viewport = device.type === 'mobile' ? 'mobile' : device.type === 'tablet' ? 'tablet' : 'desktop'

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-device-type', viewport)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
