import { NextResponse, type NextRequest } from 'next/server'
import { getContainer } from '@/container'
import { verifyBlogImportToken } from '@/lib/auth/blog-import-token'
import { AppError } from '@/errors/AppError'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    verifyBlogImportToken(req.headers.get('authorization'))

    const body = await req.json().catch(() => null)
    if (body === null) {
      return NextResponse.json({ error: 'Body JSON invalido' }, { status: 400 })
    }

    const container = await getContainer()
    const facade = container.resolve('publishArticleFacade')
    const result = await facade.execute(body)

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[blog-publish] erro inesperado', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
