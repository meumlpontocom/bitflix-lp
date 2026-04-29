import type { Payload } from 'payload'
import type { Author } from '@/payload-types'

export class AuthorsRepository {
  constructor(private readonly payload: Payload) {}

  async findBySlug(slug: string): Promise<Author | null> {
    const result = await this.payload.find({
      collection: 'authors',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } } as never,
    })
    return result.docs[0] ?? null
  }
}
