import type { Article, Author, Category, Media, Tag } from '@/payload-types'
import { ROUTES } from '@/lib/constants/routes'

export type DisclaimerVariant = Article['disclaimer_variant']

export interface ArticleListItemVM {
  id: number
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string
  authorName: string
  publishedAt: string | null
  categories: { name: string; slug: string }[]
  isBitflixTake: boolean
  href: string
}

export interface ArticleSlideVM {
  index: number
  title: string | null
  contentLexical: unknown
  imageUrl: string | null
  speakerNotes: string | null
}

export interface ArticleSourceVM {
  title: string | null
  author: string | null
  site: string | null
  url: string | null
  publishedAt: string | null
  licenseNote: string | null
}

export interface ArticleDetailVM {
  id: number
  slug: string
  title: string
  excerpt: string | null
  bodyLexical: unknown
  coverUrl: string
  coverAlt: string
  author: { name: string; bio: string | null; slug: string }
  publishedAt: string | null
  updatedAt: string
  categories: { name: string; slug: string }[]
  tags: { name: string; slug: string }[]
  source: ArticleSourceVM
  disclaimerVariant: DisclaimerVariant
  isBitflixTake: boolean
  hasSlides: boolean
  slides: ArticleSlideVM[]
  href: string
  slidesHref: string
}

function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

function mediaUrl(media: Article['cover_image']): string | null {
  if (!isObject<Media>(media)) return null
  return media.url ?? null
}

function mediaAlt(media: Article['cover_image']): string | null {
  if (!isObject<Media>(media)) return null
  return media.alt ?? null
}

function ogFallbackUrl(slug: string): string {
  return ROUTES.og(slug)
}

function categoryToVM(cat: number | Category): { name: string; slug: string } | null {
  if (!isObject<Category>(cat)) return null
  return { name: cat.name, slug: cat.slug }
}

function tagToVM(tag: number | Tag): { name: string; slug: string } | null {
  if (!isObject<Tag>(tag)) return null
  return { name: tag.name, slug: tag.slug }
}

function authorToVM(author: number | Author): { name: string; bio: string | null; slug: string } {
  if (!isObject<Author>(author)) {
    return { name: 'Milton Bastos', bio: null, slug: 'milton-bastos' }
  }
  return { name: author.name, bio: author.bio ?? null, slug: author.slug }
}

export function toArticleListItemVM(article: Article): ArticleListItemVM {
  const override = mediaUrl(article.cover_image_override)
  const cover = mediaUrl(article.cover_image)
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? null,
    coverUrl: override ?? cover ?? ogFallbackUrl(article.slug),
    authorName: authorToVM(article.author).name,
    publishedAt: article.published_at ?? null,
    categories: (article.categories ?? [])
      .map(categoryToVM)
      .filter((c): c is { name: string; slug: string } => c !== null),
    isBitflixTake: Boolean(article.is_bitflix_take),
    href: ROUTES.article(article.slug),
  }
}

export function toArticleDetailVM(article: Article): ArticleDetailVM {
  const override = mediaUrl(article.cover_image_override)
  const cover = mediaUrl(article.cover_image)
  const coverUrl = override ?? cover ?? ogFallbackUrl(article.slug)
  const coverAlt =
    mediaAlt(article.cover_image_override) ?? mediaAlt(article.cover_image) ?? article.title

  const slides: ArticleSlideVM[] = (article.slides_blocks ?? []).map((s, idx) => ({
    index: idx,
    title: s.slide_title ?? null,
    contentLexical: s.slide_content ?? null,
    imageUrl: mediaUrl(s.slide_image as Article['cover_image']),
    speakerNotes: s.speaker_notes ?? null,
  }))

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? null,
    bodyLexical: article.body_lexical,
    coverUrl,
    coverAlt,
    author: authorToVM(article.author),
    publishedAt: article.published_at ?? null,
    updatedAt: article.updatedAt,
    categories: (article.categories ?? [])
      .map(categoryToVM)
      .filter((c): c is { name: string; slug: string } => c !== null),
    tags: (article.tags ?? [])
      .map(tagToVM)
      .filter((t): t is { name: string; slug: string } => t !== null),
    source: {
      title: article.source?.original_title ?? null,
      author: article.source?.original_author ?? null,
      site: article.source?.original_site ?? null,
      url: article.source?.original_url ?? null,
      publishedAt: article.source?.original_published_at ?? null,
      licenseNote: article.source?.license_note ?? null,
    },
    disclaimerVariant: article.disclaimer_variant,
    isBitflixTake: Boolean(article.is_bitflix_take),
    hasSlides: Boolean(article.has_slides) && slides.length > 0,
    slides,
    href: ROUTES.article(article.slug),
    slidesHref: ROUTES.slides(article.slug),
  }
}

export const DISCLAIMER_TEXT: Record<DisclaimerVariant, string> = {
  'ai-translated':
    'Tradução e adaptação por Bitflix com assistência de IA, revisado por Milton Bastos.',
  'ai-adapted-from-text':
    'Compilação editorial Bitflix com assistência de IA, revisado por Milton Bastos.',
  original: 'Conteúdo original Bitflix.',
}
