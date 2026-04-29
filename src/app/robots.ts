import type { MetadataRoute } from 'next'

const SITE_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'https://bitflix.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/payload', '/api/blog-import'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
