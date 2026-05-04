import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink, Filter, Search, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listOpenSourceCatalog } from '@/services/open-source-catalog.service'
import { formatBRDate, formatBRNumber } from '@/lib/formatters'
import { ROUTES } from '@/lib/constants/routes'
import type { OpenSourceCatalogFilterOption } from '@/dto/open-source-catalog'

export const metadata: Metadata = {
  title: 'Catálogo Open Source para IA e Software',
  description:
    'Curadoria Bitflix de projetos open source para IA, agentes, MCPs, automacao e desenvolvimento de software.',
}

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    page?: string
    q?: string
    tipo?: string
    linguagem?: string
    licenca?: string
    tag?: string
    destaque?: string
  }>
}

export default async function OpenSourceCatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const featured = params.destaque === '1'

  const catalog = await listOpenSourceCatalog({
    page,
    q: params.q,
    projectType: params.tipo,
    language: params.linguagem,
    license: params.licenca,
    tag: params.tag,
    featured,
  })

  const current = {
    q: params.q ?? '',
    tipo: params.tipo ?? '',
    linguagem: params.linguagem ?? '',
    licenca: params.licenca ?? '',
    tag: params.tag ?? '',
    destaque: featured ? '1' : '',
  }

  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.blog}
              prefetch={false}
              className="font-mono text-bitflix-700 text-xs uppercase tracking-wide hover:text-bitflix-900"
            >
              Blog Bitflix
            </Link>
            <span className="text-bitflix-text/30">/</span>
            <span className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
              Catálogo open source
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            Catálogo Open Source para IA e Software
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-bitflix-text/80">
            Curadoria prática de projetos para agentes, MCPs, LLM apps, automação e devtools.
            Cada item aponta para um post do blog com análise em PT-BR.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <form className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:grid-cols-[minmax(220px,1.6fr)_repeat(4,minmax(130px,1fr))_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bitflix-text/45" />
            <span className="sr-only">Buscar</span>
            <input
              name="q"
              defaultValue={current.q}
              placeholder="Buscar por projeto, uso ou repo"
              className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-bitflix-500 focus:ring-2 focus:ring-bitflix-500/15"
            />
          </label>

          <SelectFilter name="tipo" label="Tipo" value={current.tipo} options={catalog.filters.projectTypes} />
          <SelectFilter
            name="linguagem"
            label="Linguagem"
            value={current.linguagem}
            options={catalog.filters.languages}
          />
          <SelectFilter
            name="licenca"
            label="Licença"
            value={current.licenca}
            options={catalog.filters.licenses}
          />
          <SelectFilter name="tag" label="Tag" value={current.tag} options={catalog.filters.tags} />

          <div className="flex gap-2">
            {featured ? <input type="hidden" name="destaque" value="1" /> : null}
            <Button type="submit" className="h-10 bg-bitflix-500 text-white hover:bg-bitflix-700">
              <Filter />
              Filtrar
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-bitflix-text/65 text-sm">
            {formatBRNumber(catalog.totalDocs)}{' '}
            {catalog.totalDocs === 1 ? 'projeto publicado' : 'projetos publicados'}
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterLink href={buildHref({ ...current, destaque: featured ? '' : '1', page: '' })} active={featured}>
              <Star className="size-3.5" />
              Destaques
            </FilterLink>
            <FilterLink href={ROUTES.openSourceCatalog} active={false}>
              Limpar filtros
            </FilterLink>
          </div>
        </div>

        {catalog.items.length === 0 ? (
          <div className="mt-14 rounded-lg border border-dashed border-neutral-300 bg-bitflix-cream-light px-6 py-12 text-center">
            <h2 className="font-semibold text-bitflix-900 text-xl">Nenhum projeto publicado ainda.</h2>
            <p className="mx-auto mt-3 max-w-xl text-bitflix-text/75">
              O catálogo só mostra entradas ativas com post publicado. Imports novos entram como
              rascunho para revisão editorial antes de aparecer aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {catalog.items.map((item) => (
                <article
                  key={item.id}
                  className="flex min-h-[260px] flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-bitflix-500 text-white">{item.projectTypeLabel}</Badge>
                    {item.isFeatured ? (
                      <Badge variant="secondary" className="bg-bitflix-cream text-bitflix-900">
                        Destaque Bitflix
                      </Badge>
                    ) : null}
                    {item.primaryLanguage ? (
                      <Badge variant="outline">{item.primaryLanguage}</Badge>
                    ) : null}
                    {item.license ? <Badge variant="outline">{item.license}</Badge> : null}
                  </div>

                  <h2 className="mt-4 font-semibold text-bitflix-900 text-xl leading-snug">
                    <Link href={item.href} prefetch={false} className="hover:text-bitflix-700">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-bitflix-text/75">
                    {item.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.slice(0, 5).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={buildHref({ ...current, tag: tag.slug, page: '' })}
                        prefetch={false}
                        className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-bitflix-text/70 text-xs transition hover:bg-bitflix-cream hover:text-bitflix-900"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>

                  <dl className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm sm:grid-cols-4">
                    <Metric label="Stars" value={formatBRNumber(item.stars)} />
                    <Metric label="Forks" value={formatBRNumber(item.forks)} />
                    <Metric
                      label="Atualizado"
                      value={item.lastPushedAt ? formatBRDate(item.lastPushedAt) : '—'}
                    />
                    <div>
                      <dt className="font-mono text-bitflix-text/50 text-xs uppercase">Repo</dt>
                      <dd className="mt-1">
                        <a
                          href={item.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1 truncate text-bitflix-700 hover:text-bitflix-900"
                        >
                          <span className="truncate">{item.repositoryLabel}</span>
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
              {catalog.hasPrev ? (
                <Button variant="outline" asChild>
                  <Link
                    href={buildHref({ ...current, page: String(Math.max(1, catalog.page - 1)) })}
                    prefetch={false}
                  >
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Anterior
                </Button>
              )}
              <span className="font-mono text-bitflix-text/60 text-sm">
                Página {catalog.page} de {catalog.totalPages}
              </span>
              {catalog.hasNext ? (
                <Button variant="outline" asChild>
                  <Link
                    href={buildHref({ ...current, page: String(catalog.page + 1) })}
                    prefetch={false}
                  >
                    Próxima
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Próxima
                </Button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function SelectFilter({
  name,
  label,
  value,
  options,
}: {
  name: string
  label: string
  value: string
  options: OpenSourceCatalogFilterOption[]
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-bitflix-500 focus:ring-2 focus:ring-bitflix-500/15"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-bitflix-text/50 text-xs uppercase">{label}</dt>
      <dd className="mt-1 font-semibold text-bitflix-900">{value}</dd>
    </div>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`inline-flex h-8 items-center gap-1 rounded-md border px-3 text-sm transition ${
        active
          ? 'border-bitflix-500 bg-bitflix-500 text-white'
          : 'border-neutral-200 bg-white text-bitflix-text/75 hover:border-bitflix-500 hover:text-bitflix-900'
      }`}
    >
      {children}
    </Link>
  )
}

function buildHref(params: Record<string, string>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return query ? `${ROUTES.openSourceCatalog}?${query}` : ROUTES.openSourceCatalog
}
