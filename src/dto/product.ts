import type { Media, Product } from '@/payload-types'

export type ProductStatus = Product['status']

export interface ProductVM {
  id: number
  slug: string
  name: string
  tagline: string | null
  descriptionLexical: unknown
  domain: string
  ctaUrl: string
  status: ProductStatus
  logoUrl: string | null
  logoAlt: string | null
  featured: boolean
  displayOrder: number
}

const STATUS_LABEL: Record<ProductStatus, string> = {
  producao: 'Em produção',
  'recem-lancado': 'Recém-lançado',
  'em-desenvolvimento': 'Em desenvolvimento',
}

export function statusLabel(status: ProductStatus): string {
  return STATUS_LABEL[status]
}

function isMedia(v: unknown): v is Media {
  return typeof v === 'object' && v !== null && 'url' in (v as Record<string, unknown>)
}

export function toProductVM(p: Product): ProductVM {
  const logo = p.logo
  const ctaUrl = p.cta_url ?? `https://${p.domain}`
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? null,
    descriptionLexical: p.description ?? null,
    domain: p.domain,
    ctaUrl,
    status: p.status,
    logoUrl: isMedia(logo) ? (logo.url ?? null) : null,
    logoAlt: isMedia(logo) ? logo.alt : null,
    featured: Boolean(p.featured),
    displayOrder: p.display_order ?? 0,
  }
}
