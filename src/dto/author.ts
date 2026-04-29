import type { Author, Media } from '@/payload-types'

export interface AuthorVM {
  id: number
  slug: string
  name: string
  bio: string | null
  avatarUrl: string | null
  email: string | null
  social: {
    twitter: string | null
    linkedin: string | null
    github: string | null
  }
}

function isMedia(v: unknown): v is Media {
  return typeof v === 'object' && v !== null && 'url' in (v as Record<string, unknown>)
}

export function toAuthorVM(a: Author): AuthorVM {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    bio: a.bio ?? null,
    avatarUrl: isMedia(a.avatar) ? (a.avatar.url ?? null) : null,
    email: a.email ?? null,
    social: {
      twitter: a.social?.twitter ?? null,
      linkedin: a.social?.linkedin ?? null,
      github: a.social?.github ?? null,
    },
  }
}
