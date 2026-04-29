export const QK = {
  articles: ['articles'] as const,
  articlesList: (params: { page?: number; cat?: string; tag?: string; q?: string }) =>
    ['articles', 'list', params] as const,
  article: (slug: string) => ['articles', slug] as const,
  products: ['products'] as const,
  productsFeatured: ['products', 'featured'] as const,
  author: (slug: string) => ['authors', slug] as const,
  siteSettings: ['site-settings'] as const,
  navigation: ['navigation'] as const,
}
