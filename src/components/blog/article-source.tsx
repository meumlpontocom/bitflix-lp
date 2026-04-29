import { formatBRDate } from '@/lib/formatters'
import type { ArticleSourceVM } from '@/dto/article'

interface Props {
  source: ArticleSourceVM
}

export function ArticleSource({ source }: Props) {
  if (!source.url && !source.title) return null
  return (
    <aside className="rounded-2xl border border-neutral-200 bg-bitflix-cream-light p-6">
      <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">Fonte original</p>
      <div className="mt-3 space-y-1 text-sm text-bitflix-text/85">
        {source.title ? (
          <p className="font-semibold text-bitflix-900 text-base">{source.title}</p>
        ) : null}
        {source.author ? <p>Autor: {source.author}</p> : null}
        {source.site ? <p>Publicado em: {source.site}</p> : null}
        {source.publishedAt ? <p>Data: {formatBRDate(source.publishedAt)}</p> : null}
        {source.licenseNote ? (
          <p className="text-bitflix-text/65">{source.licenseNote}</p>
        ) : null}
        {source.url ? (
          <p className="pt-2">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-bitflix-700 underline hover:text-bitflix-900"
            >
              {source.url}
            </a>
          </p>
        ) : null}
      </div>
    </aside>
  )
}
