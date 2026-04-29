import { getPayload } from '@/lib/payload'
import { toProductVM, type ProductVM } from '@/dto/product'

export async function listProducts(featuredOnly = false): Promise<ProductVM[]> {
  const payload = await getPayload()
  const where = featuredOnly
    ? { and: [{ is_active: { not_equals: false } }, { featured: { equals: true } }] }
    : { is_active: { not_equals: false } }

  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 100,
    sort: 'display_order',
    where: where as never,
  })
  return result.docs.map(toProductVM)
}
