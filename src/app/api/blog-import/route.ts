import { NextResponse, type NextRequest } from 'next/server'
import { getContainer } from '@/container'
import { verifyBlogImportToken } from '@/lib/auth/blog-import-token'
import { AppError } from '@/errors/AppError'

export const runtime = 'nodejs'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const ipHits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count += 1
  return true
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit excedido. Tente novamente em 1 minuto.' },
      { status: 429 },
    )
  }

  try {
    const fingerprint = verifyBlogImportToken(req.headers.get('authorization'))

    const body = await req.json().catch(() => null)
    if (body === null) {
      return NextResponse.json({ error: 'Body JSON invalido' }, { status: 400 })
    }

    const container = await getContainer()
    const facade = container.resolve('blogImportFacade')
    const inputWithFingerprint = { ...body, triggered_by: body?.triggered_by ?? fingerprint }
    const result = await facade.create(inputWithFingerprint)

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[blog-import] erro inesperado', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
