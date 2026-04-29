import type { Payload } from 'payload'
import type { Category } from '@/payload-types'

export class CategoriesRepository {
  constructor(private readonly payload: Payload) {}

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } } as never,
    })
    return result.docs[0] ?? null
  }

  async create(input: { slug: string; name: string }): Promise<Category> {
    return this.payload.create({
      collection: 'categories',
      data: {
        slug: input.slug,
        name: input.name,
        is_active: true,
      } as never,
    })
  }
}
