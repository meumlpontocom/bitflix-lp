import { ForbiddenError } from '@/errors/AppError'

export function verifyBlogImportToken(authHeader: string | null | undefined): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ForbiddenError('Authorization header ausente ou invalido')
  }
  const provided = authHeader.slice(7).trim()
  const expected = process.env.BLOG_IMPORT_TOKEN
  if (!expected) {
    throw new ForbiddenError('BLOG_IMPORT_TOKEN nao configurado no servidor')
  }
  if (!constantTimeEquals(provided, expected)) {
    throw new ForbiddenError('Token invalido')
  }
  return tokenFingerprint(provided)
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

function tokenFingerprint(token: string): string {
  return token.slice(0, 8)
}
