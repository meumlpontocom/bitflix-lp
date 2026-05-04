import { getPayload } from '@/lib/payload'
import {
  PROJECT_TYPE_LABELS,
  toOpenSourceCatalogEntryVM,
  type OpenSourceCatalogFilterOption,
  type OpenSourceCatalogPageVM,
  type OpenSourceProjectType,
} from '@/dto/open-source-catalog'

interface ListOpenSourceCatalogArgs {
  page?: number
  perPage?: number
  q?: string
  projectType?: string
  language?: string
  license?: string
  tag?: string
  featured?: boolean
}

const PROJECT_TYPE_VALUES = Object.keys(PROJECT_TYPE_LABELS) as OpenSourceProjectType[]

function optionFromValue(value: string): OpenSourceCatalogFilterOption {
  return { label: value, value }
}

export async function listOpenSourceCatalog(
  args: ListOpenSourceCatalogArgs = {},
): Promise<OpenSourceCatalogPageVM> {
  const { page = 1, perPage = 12, q, projectType, language, license, tag, featured } = args
  const payload = await getPayload()

  const where: Record<string, unknown> = {
    and: [
      { catalog_status: { equals: 'published' } },
      { is_active: { not_equals: false } },
    ],
  }

  if (q) {
    ;(where.and as unknown[]).push({
      or: [
        { title: { like: q } },
        { summary_pt_br: { like: q } },
        { repository_url: { like: q } },
        { repository_owner: { like: q } },
        { repository_name: { like: q } },
      ],
    })
  }
  if (projectType && PROJECT_TYPE_VALUES.includes(projectType as OpenSourceProjectType)) {
    ;(where.and as unknown[]).push({ project_type: { equals: projectType } })
  }
  if (language) {
    ;(where.and as unknown[]).push({ primary_language: { equals: language } })
  }
  if (license) {
    ;(where.and as unknown[]).push({ license: { equals: license } })
  }
  if (tag) {
    ;(where.and as unknown[]).push({ 'tags.slug': { equals: tag } })
  }
  if (featured) {
    ;(where.and as unknown[]).push({ is_featured: { equals: true } })
  }

  const result = await payload.find({
    collection: 'open-source-catalog-entries',
    depth: 2,
    limit: 300,
    pagination: false,
    sort: '-is_featured,-stars,title',
    where: where as never,
  })

  const allItems = result.docs
    .map(toOpenSourceCatalogEntryVM)
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const totalDocs = allItems.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / perPage))
  const normalizedPage = Math.min(Math.max(1, page), totalPages)
  const start = (normalizedPage - 1) * perPage
  const items = allItems.slice(start, start + perPage)

  return {
    items,
    page: normalizedPage,
    totalPages,
    totalDocs,
    hasNext: normalizedPage < totalPages,
    hasPrev: normalizedPage > 1,
    filters: buildFilters(allItems),
  }
}

function buildFilters(
  items: NonNullable<ReturnType<typeof toOpenSourceCatalogEntryVM>>[],
): OpenSourceCatalogPageVM['filters'] {
  const languages = new Set<string>()
  const licenses = new Set<string>()
  const tags = new Map<string, string>()
  const projectTypes = new Set<OpenSourceProjectType>()

  for (const item of items) {
    projectTypes.add(item.projectType)
    if (item.primaryLanguage) languages.add(item.primaryLanguage)
    if (item.license) licenses.add(item.license)
    for (const tag of item.tags) tags.set(tag.slug, tag.name)
  }

  return {
    projectTypes: [...projectTypes].map((value) => ({
      value,
      label: PROJECT_TYPE_LABELS[value],
    })),
    languages: [...languages].sort().map(optionFromValue),
    licenses: [...licenses].sort().map(optionFromValue),
    tags: [...tags.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR')).map(([value, label]) => ({
      value,
      label,
    })),
  }
}
