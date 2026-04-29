import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatBRDate } from '@/lib/formatters'
import type { ArticleListItemVM } from '@/dto/article'

interface Props {
  article: ArticleListItemVM
  priority?: boolean
}

export function ArticleCard({ article, priority }: Props) {
  const primaryCat = article.categories[0]
  return (
    <Link
      href={article.href}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-[1200/630] w-full overflow-hidden bg-bitflix-cream">
        <Image
          src={article.coverUrl}
          alt={article.title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority={priority}
          unoptimized={article.coverUrl.startsWith('/og/')}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {primaryCat ? (
            <Badge variant="secondary" className="bg-bitflix-cream text-bitflix-900">
              {primaryCat.name}
            </Badge>
          ) : null}
          {article.isBitflixTake ? (
            <Badge className="bg-bitflix-500 text-white">Bitflix Take</Badge>
          ) : null}
        </div>
        <h3 className="font-semibold text-bitflix-900 text-lg leading-snug">{article.title}</h3>
        {article.excerpt ? (
          <p className="line-clamp-3 text-sm text-bitflix-text/75">{article.excerpt}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-bitflix-text/60">
          <span>{article.authorName}</span>
          <span>{article.publishedAt ? formatBRDate(article.publishedAt) : '—'}</span>
        </div>
      </div>
    </Link>
  )
}
