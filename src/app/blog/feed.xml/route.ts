import { getRecentArticlesForFeed } from '@/services/articles.service'

export const runtime = 'nodejs'
export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bitflix.com.br'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const articles = await getRecentArticlesForFeed(30)

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}${a.href}`
      const pub = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date(a.updatedAt).toUTCString()
      const description = a.excerpt ?? ''
      const categories = a.categories
        .map((c) => `<category>${escapeXml(c.name)}</category>`)
        .join('')
      return `<item>
  <title>${escapeXml(a.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <description>${escapeXml(description)}</description>
  <pubDate>${pub}</pubDate>
  <author>noreply@bitflix.com.br (${escapeXml(a.author.name)})</author>
  ${categories}
</item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Bitflix Blog</title>
  <link>${SITE_URL}/blog</link>
  <description>IA aplicada ao cliente final — adaptações editoriais Bitflix.</description>
  <language>pt-BR</language>
  <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
