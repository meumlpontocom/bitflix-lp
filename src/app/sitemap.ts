import type { MetadataRoute } from 'next'
import { getAllPublishedArticleSlugsForBuild } from '@/services/articles.service'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bitflix.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPublishedArticleSlugsForBuild()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/produtos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/servicos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ]

  const articleEntries: MetadataRoute.Sitemap = slugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...articleEntries]
}
