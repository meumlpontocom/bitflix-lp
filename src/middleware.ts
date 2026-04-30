import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_HOSTNAMES = new Set(
  ['cms.bitflix.com.br', 'staging.cms.bitflix.com.br'].filter(Boolean),
)

const PUBLIC_HOSTNAMES = new Set(
  ['bitflix.com.br', 'www.bitflix.com.br', 'staging.bitflix.com.br'].filter(Boolean),
)

const ADMIN_ONLY_PATHS = ['/admin', '/api']

function isAdminPath(pathname: string) {
  return ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? ''
  const { pathname } = req.nextUrl

  // localhost / IPs / hostname desconhecido: deixa passar (dev/staging local)
  if (!ADMIN_HOSTNAMES.has(host) && !PUBLIC_HOSTNAMES.has(host)) {
    return NextResponse.next()
  }

  // hostname do CMS: só permite paths admin/payload
  if (ADMIN_HOSTNAMES.has(host) && !isAdminPath(pathname)) {
    return NextResponse.rewrite(new URL('/404', req.url))
  }

  // hostname público: bloqueia paths admin/payload
  if (PUBLIC_HOSTNAMES.has(host) && isAdminPath(pathname)) {
    return NextResponse.rewrite(new URL('/404', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|map)$).*)'],
}
