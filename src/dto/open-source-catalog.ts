import type { Article, Category, OpenSourceCatalogEntry, Tag } from '@/payload-types'
import { ROUTES } from '@/lib/constants/routes'

export type OpenSourceProjectType = NonNullable<OpenSourceCatalogEntry['project_type']>

export const PROJECT_TYPE_LABELS: Record<OpenSourceProjectType, string> = {
  'ai-agent': 'AI agent',
  mcp: 'MCP',
  'llm-app': 'LLM app',
  'developer-tool': 'DevTool',
  automation: 'Automacao',
  'data-ai': 'Data/AI',
  frontend: 'Frontend',
  backend: 'Backend',
  infra: 'Infra',
  security: 'Seguranca',
  learning: 'Aprendizado',
  other: 'Outro',
}

export interface OpenSourceCatalogEntryVM {
  id: number
  title: string
  slug: string
  href: string
  repositoryUrl: string
  repositoryLabel: string
  summary: string
  projectType: OpenSourceProjectType
  projectTypeLabel: string
  primaryLanguage: string | null
  license: string | null
  stars: number
  forks: number
  lastPushedAt: string | null
  isFeatured: boolean
  categories: { name: string; slug: string }[]
  tags: { name: string; slug: string }[]
}

export interface OpenSourceCatalogFilterOption {
  label: string
  value: string
}

export interface OpenSourceCatalogPageVM {
  items: OpenSourceCatalogEntryVM[]
  page: number
  totalPages: number
  totalDocs: number
  hasNext: boolean
  hasPrev: boolean
  filters: {
    projectTypes: OpenSourceCatalogFilterOption[]
    languages: OpenSourceCatalogFilterOption[]
    licenses: OpenSourceCatalogFilterOption[]
    tags: OpenSourceCatalogFilterOption[]
  }
}

function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

function relationshipSlug(rel: number | Article): string | null {
  if (!isObject<Article>(rel)) return null
  if (rel.status !== 'published' || rel.is_active === false) return null
  return rel.slug
}

function categoryToVM(cat: number | Category): { name: string; slug: string } | null {
  if (!isObject<Category>(cat)) return null
  return { name: cat.name, slug: cat.slug }
}

function tagToVM(tag: number | Tag): { name: string; slug: string } | null {
  if (!isObject<Tag>(tag)) return null
  return { name: tag.name, slug: tag.slug }
}

function repositoryLabel(entry: OpenSourceCatalogEntry): string {
  if (entry.repository_owner && entry.repository_name) {
    return `${entry.repository_owner}/${entry.repository_name}`
  }
  try {
    const url = new URL(entry.repository_url)
    return url.pathname.replace(/^\/|\/$/g, '') || entry.repository_url
  } catch {
    return entry.repository_url
  }
}

export function toOpenSourceCatalogEntryVM(
  entry: OpenSourceCatalogEntry,
): OpenSourceCatalogEntryVM | null {
  const articleSlug = relationshipSlug(entry.article)
  if (!articleSlug) return null

  const projectType = entry.project_type ?? 'other'
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    href: ROUTES.article(articleSlug),
    repositoryUrl: entry.repository_url,
    repositoryLabel: repositoryLabel(entry),
    summary: entry.summary_pt_br,
    projectType,
    projectTypeLabel: PROJECT_TYPE_LABELS[projectType],
    primaryLanguage: entry.primary_language ?? null,
    license: entry.license ?? null,
    stars: entry.stars ?? 0,
    forks: entry.forks ?? 0,
    lastPushedAt: entry.last_pushed_at ?? null,
    isFeatured: Boolean(entry.is_featured),
    categories: (entry.categories ?? [])
      .map(categoryToVM)
      .filter((c): c is { name: string; slug: string } => c !== null),
    tags: (entry.tags ?? [])
      .map(tagToVM)
      .filter((t): t is { name: string; slug: string } => t !== null),
  }
}
