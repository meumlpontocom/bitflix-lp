import type { ZodType } from 'zod'
import { ValidationError } from '@/errors/AppError'

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (result.success) return result.data
  const issues = result.error.issues
    .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
    .join('; ')
  throw new ValidationError(issues)
}
