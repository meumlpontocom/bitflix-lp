import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DotGrid } from '@/components/decor/dot-grid'
import { ProductCard } from '@/components/products/product-card'
import { ArticleCard } from '@/components/blog/article-card'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { RenderLexical } from '@/components/lexical/render-lexical'
import { listProducts } from '@/services/products.service'
import { getLatestArticles } from '@/services/articles.service'
import { getSiteSettings } from '@/services/site.service'
import { getHomePage } from '@/services/pages.service'
import { getIcon } from '@/lib/icon-map'
import { ROUTES } from '@/lib/constants/routes'

export default async function HomePage() {
  const [products, latestPosts, settings, page] = await Promise.all([
    listProducts(),
    getLatestArticles(4),
    getSiteSettings(),
    getHomePage(),
  ])

  const featured = products.filter((p) => p.featured)
  const display = featured.length > 0 ? featured : products.slice(0, 4)

  return (
    <>
      <section className="relative overflow-hidden bg-bitflix-cream-light">
        <DotGrid />
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <h1 className="text-balance font-semibold text-bitflix-900 text-5xl leading-tight tracking-tight sm:text-6xl">
            {page.heroTitlePrefix} <span className="text-bitflix-500">{page.heroTitleHighlight}</span> {page.heroTitleSuffix}
          </h1>

          <div className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-bitflix-text/80">
            {settings.manifestoLexical ? (
              <RenderLexical data={settings.manifestoLexical} className="prose prose-lg" />
            ) : null}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.produtos}
              prefetch={false}
              className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 font-medium text-sm text-white transition-colors hover:bg-bitflix-900"
            >
              {page.heroCtaPrimaryLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href={ROUTES.servicos}
              prefetch={false}
              className="inline-flex h-11 items-center justify-center rounded-full border border-bitflix-500 px-6 font-medium text-sm text-bitflix-700 transition-colors hover:bg-bitflix-500 hover:text-white"
            >
              {page.heroCtaSecondaryLabel}
            </Link>
            <WhatsAppButton settings={settings} variant="outline" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
              {page.pillarsSectionTitle}
            </h2>
            <p className="mt-4 text-bitflix-text/75 leading-relaxed">{page.pillarsSectionBody}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {page.pillars.map((pillar) => {
              const Icon = getIcon(pillar.icon)
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <Icon className="size-6 text-bitflix-500" />
                  <h3 className="mt-4 font-semibold text-bitflix-900 text-lg">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bitflix-text/75">{pillar.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-bitflix-cream-light">
        <DotGrid className="opacity-60" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
                {page.productsSectionTitle}
              </h2>
              <p className="mt-3 max-w-xl text-bitflix-text/75 leading-relaxed">
                {page.productsSectionBody}
              </p>
            </div>
            <Link
              href={ROUTES.produtos}
              prefetch={false}
              className="hidden text-sm font-medium text-bitflix-700 hover:text-bitflix-900 sm:inline-flex sm:items-center"
            >
              {page.productsSectionLinkLabel}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {display.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
              {page.customSectionTitle}
            </h2>
            <p className="mt-4 text-bitflix-text/80 leading-relaxed">{page.customSectionBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ROUTES.servicos}
                prefetch={false}
                className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 font-medium text-sm text-white transition-colors hover:bg-bitflix-900"
              >
                {page.customSectionCtaLabel}
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <WhatsAppButton
                settings={settings}
                source="from_custom_cta"
                variant="outline"
                label={page.customSectionWhatsappLabel}
              />
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-bitflix-cream p-8">
            <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
              {page.customSectionAsideEyebrow}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-bitflix-text/85">
              {page.customSectionSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
                  {page.blogSectionTitle}
                </h2>
                <p className="mt-3 text-bitflix-text/75">{page.blogSectionBody}</p>
              </div>
              <Link
                href={ROUTES.blog}
                prefetch={false}
                className="hidden text-sm font-medium text-bitflix-700 hover:text-bitflix-900 sm:inline-flex sm:items-center"
              >
                {page.blogSectionLinkLabel}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestPosts.map((a, idx) => (
                <ArticleCard key={a.id} article={a} priority={idx === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-bitflix-cream-light">
        <DotGrid />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
            {page.finalCtaTitle}
          </h2>
          <p className="mt-4 text-bitflix-text/80 leading-relaxed">{page.finalCtaBody}</p>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton settings={settings} />
          </div>
        </div>
      </section>
    </>
  )
}
