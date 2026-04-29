import { getPayload } from '@/lib/payload'

export interface CategoryFilterVM {
  slug: string
  name: string
}

export async function listActiveCategories(): Promise<CategoryFilterVM[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 200,
    sort: 'name',
    where: { is_active: { not_equals: false } } as never,
  })
  return result.docs.map((c) => ({ slug: c.slug, name: c.name }))
}
