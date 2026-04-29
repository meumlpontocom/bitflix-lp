import { getPayload } from '@/lib/payload'
import {
  toArticleListItemVM,
  toArticleDetailVM,
  type ArticleListItemVM,
  type ArticleDetailVM,
} from '@/dto/article'

interface ListArticlesArgs {
  page?: number
  perPage?: number
  categorySlug?: string
  tagSlug?: string
  q?: string
}

export interface ArticlesPage {
  items: ArticleListItemVM[]
  page: number
  totalPages: number
  totalDocs: number
  hasNext: boolean
  hasPrev: boolean
}

export async function listPublishedArticles(args: ListArticlesArgs = {}): Promise<ArticlesPage> {
  const { page = 1, perPage = 9, categorySlug, tagSlug, q } = args
  const payload = await getPayload()

  const where: Record<string, unknown> = {
    and: [
      { status: { equals: 'published' } },
      { is_active: { not_equals: false } },
    ],
  }

  if (categorySlug) {
    ;(where.and as unknown[]).push({ 'categories.slug': { equals: categorySlug } })
  }
  if (tagSlug) {
    ;(where.and as unknown[]).push({ 'tags.slug': { equals: tagSlug } })
  }
  if (q) {
    ;(where.and as unknown[]).push({
      or: [
        { title: { like: q } },
        { excerpt: { like: q } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    page,
    limit: perPage,
    sort: '-published_at',
    where: where as never,
  })

  return {
    items: result.docs.map(toArticleListItemVM),
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    hasNext: result.hasNextPage,
    hasPrev: result.hasPrevPage,
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetailVM | null> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
        { is_active: { not_equals: false } },
      ],
    } as never,
  })
  const doc = result.docs[0]
  if (!doc) return null
  return toArticleDetailVM(doc)
}

export async function getLatestArticles(limit = 4): Promise<ArticleListItemVM[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit,
    sort: '-published_at',
    where: {
      and: [
        { status: { equals: 'published' } },
        { is_active: { not_equals: false } },
      ],
    } as never,
  })
  return result.docs.map(toArticleListItemVM)
}

export async function getAllPublishedArticleSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'articles',
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      and: [
        { status: { equals: 'published' } },
        { is_active: { not_equals: false } },
      ],
    } as never,
  })
  return result.docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt }))
}

export async function getRecentArticlesForFeed(limit = 30): Promise<ArticleDetailVM[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit,
    sort: '-published_at',
    where: {
      and: [
        { status: { equals: 'published' } },
        { is_active: { not_equals: false } },
      ],
    } as never,
  })
  return result.docs.map(toArticleDetailVM)
}
