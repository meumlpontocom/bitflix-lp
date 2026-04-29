import type { Payload } from 'payload'
import type { Article } from '@/payload-types'

export interface CreateArticleInput {
  title: string
  slug: string
  excerpt?: string
  body_lexical: unknown
  language_origin: 'en' | 'pt-br' | 'other'
  disclaimer_variant: 'ai-translated' | 'ai-adapted-from-text' | 'original'
  is_bitflix_take: boolean
  source?: {
    original_title?: string
    original_author?: string
    original_site?: string
    original_url?: string
    original_published_at?: string
    license_note?: string
  }
  categories: number[]
  tags: number[]
  author: number
  has_slides: boolean
  slides_blocks?: Array<{
    slide_title?: string
    slide_content?: unknown
    speaker_notes?: string
  }>
  status: 'draft' | 'review' | 'published'
  created_via: 'manual' | 'blog-import-skill'
}

export class ArticlesRepository {
  constructor(private readonly payload: Payload) {}

  async findBySlug(slug: string): Promise<Article | null> {
    const result = await this.payload.find({
      collection: 'articles',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } } as never,
    })
    return result.docs[0] ?? null
  }

  async create(input: CreateArticleInput): Promise<Article> {
    return this.payload.create({
      collection: 'articles',
      data: input as never,
    })
  }

  async updateStatusToPublished(id: number): Promise<Article> {
    return this.payload.update({
      collection: 'articles',
      id,
      data: {
        status: 'published',
      } as never,
    })
  }
}
