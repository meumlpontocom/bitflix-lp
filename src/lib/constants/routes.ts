export const ROUTES = {
  home: '/',
  produtos: '/produtos',
  servicos: '/servicos',
  sobre: '/sobre',
  contato: '/contato',
  blog: '/blog',
  article: (slug: string) => `/blog/${slug}`,
  slides: (slug: string) => `/blog/${slug}/slides`,
  feed: '/blog/feed.xml',
  og: (slug: string) => `/og/${slug}`,
} as const
