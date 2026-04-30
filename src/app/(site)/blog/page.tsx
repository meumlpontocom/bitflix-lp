import type { Metadata } from 'next'
import { ArticleCard } from '@/components/blog/article-card'
import { CategoryFilter } from '@/components/blog/category-filter'
import { BlogPagination } from '@/components/blog/pagination'
import { listPublishedArticles } from '@/services/articles.service'
import { listActiveCategories } from '@/services/categories.service'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Adaptações editoriais Bitflix sobre IA aplicada ao cliente final.',
}

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    page?: string
    cat?: string
    tag?: string
    q?: string
  }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const cat = params.cat ?? null
  const tag = params.tag ?? null
  const q = params.q ?? null

  const [list, categories] = await Promise.all([
    listPublishedArticles({
      page,
      perPage: 9,
      categorySlug: cat ?? undefined,
      tagSlug: tag ?? undefined,
      q: q ?? undefined,
    }),
    listActiveCategories(),
  ])

  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">Blog Bitflix</p>
          <h1 className="mt-3 font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            IA aplicada, sem hype.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bitflix-text/80">
            Adaptações editoriais. Cada artigo cita a fonte e marca a assistência de IA com
            transparência.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <CategoryFilter categories={categories} active={cat} q={q} />

        {tag ? (
          <p className="mt-6 font-mono text-bitflix-text/70 text-sm">
            Filtrando por tag <strong className="text-bitflix-900">#{tag}</strong>
          </p>
        ) : null}
        {q ? (
          <p className="mt-6 font-mono text-bitflix-text/70 text-sm">
            Buscando por <strong className="text-bitflix-900">&quot;{q}&quot;</strong>
          </p>
        ) : null}

        {list.items.length === 0 ? (
          <p className="mt-16 text-center text-bitflix-text/60">
            Nenhum artigo encontrado nesta combinação de filtros.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((a, idx) => (
                <ArticleCard key={a.id} article={a} priority={idx < 3} />
              ))}
            </div>

            <div className="mt-12">
              <BlogPagination page={list.page} totalPages={list.totalPages} cat={cat} tag={tag} q={q} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
