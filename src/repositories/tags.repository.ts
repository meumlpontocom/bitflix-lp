import type { Payload } from 'payload'
import type { Tag } from '@/payload-types'

export class TagsRepository {
  constructor(private readonly payload: Payload) {}

  async findBySlug(slug: string): Promise<Tag | null> {
    const result = await this.payload.find({
      collection: 'tags',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } } as never,
    })
    return result.docs[0] ?? null
  }

  async create(input: { slug: string; name: string }): Promise<Tag> {
    return this.payload.create({
      collection: 'tags',
      data: {
        slug: input.slug,
        name: input.name,
        is_active: true,
      } as never,
    })
  }
}
