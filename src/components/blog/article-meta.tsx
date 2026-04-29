import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatBRDate } from '@/lib/formatters'
import { ROUTES } from '@/lib/constants/routes'
import type { ArticleDetailVM } from '@/dto/article'

interface Props {
  article: ArticleDetailVM
}

export function ArticleMeta({ article }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-bitflix-text/65">
      <span className="text-bitflix-900 font-medium">{article.author.name}</span>
      <span aria-hidden>·</span>
      <span>{article.publishedAt ? formatBRDate(article.publishedAt) : 'Rascunho'}</span>
      {article.categories.length > 0 ? (
        <>
          <span aria-hidden>·</span>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((c) => (
              <Link
                key={c.slug}
                href={`${ROUTES.blog}?cat=${c.slug}`}
                prefetch={false}
                className="text-bitflix-700 hover:text-bitflix-900"
              >
                #{c.slug}
              </Link>
            ))}
          </div>
        </>
      ) : null}
      {article.isBitflixTake ? (
        <Badge className="ml-1 bg-bitflix-500 text-white">Bitflix Take</Badge>
      ) : null}
    </div>
  )
}
