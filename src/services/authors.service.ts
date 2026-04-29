import { getPayload } from '@/lib/payload'
import { toAuthorVM, type AuthorVM } from '@/dto/author'

export async function getAuthorBySlug(slug: string): Promise<AuthorVM | null> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'authors',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } } as never,
  })
  const doc = result.docs[0]
  if (!doc) return null
  return toAuthorVM(doc)
}

export const MILTON_SLUG = 'milton-bastos'
