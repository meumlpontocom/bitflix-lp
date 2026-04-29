import Link from 'next/link'
import type { CategoryFilterVM } from '@/services/categories.service'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface Props {
  categories: CategoryFilterVM[]
  active: string | null
  q: string | null
}

function buildHref(slug: string | null, q: string | null) {
  const params = new URLSearchParams()
  if (slug) params.set('cat', slug)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `${ROUTES.blog}?${qs}` : ROUTES.blog
}

export function CategoryFilter({ categories, active, q }: Props) {
  if (categories.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={buildHref(null, q)}
        prefetch={false}
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm transition-colors',
          active === null
            ? 'border-bitflix-500 bg-bitflix-500 text-white'
            : 'border-neutral-200 text-bitflix-text/80 hover:border-bitflix-500 hover:text-bitflix-700',
        )}
      >
        Todas
      </Link>
      {categories.map((c) => {
        const isActive = active === c.slug
        return (
          <Link
            key={c.slug}
            href={buildHref(c.slug, q)}
            prefetch={false}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              isActive
                ? 'border-bitflix-500 bg-bitflix-500 text-white'
                : 'border-neutral-200 text-bitflix-text/80 hover:border-bitflix-500 hover:text-bitflix-700',
            )}
          >
            {c.name}
          </Link>
        )
      })}
    </div>
  )
}
