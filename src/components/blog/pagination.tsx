import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface Props {
  page: number
  totalPages: number
  cat: string | null
  tag: string | null
  q: string | null
}

function buildHref(page: number, cat: string | null, tag: string | null, q: string | null) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (cat) params.set('cat', cat)
  if (tag) params.set('tag', tag)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `${ROUTES.blog}?${qs}` : ROUTES.blog
}

export function BlogPagination({ page, totalPages, cat, tag, q }: Props) {
  if (totalPages <= 1) return null
  const prev = page > 1 ? buildHref(page - 1, cat, tag, q) : null
  const next = page < totalPages ? buildHref(page + 1, cat, tag, q) : null

  const linkClass =
    'inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 px-4 text-sm font-medium text-bitflix-text/80 transition-colors hover:border-bitflix-500 hover:text-bitflix-700'

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Paginação">
      {prev ? (
        <Link href={prev} prefetch={false} className={linkClass}>
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')}>
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </span>
      )}

      <span className="font-mono text-bitflix-text/60 text-sm">
        Página {page} de {totalPages}
      </span>

      {next ? (
        <Link href={next} prefetch={false} className={linkClass}>
          Próxima
          <ChevronRight className="ml-1 size-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')}>
          Próxima
          <ChevronRight className="ml-1 size-4" />
        </span>
      )}
    </nav>
  )
}
