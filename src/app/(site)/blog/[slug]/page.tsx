import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Presentation } from 'lucide-react'
import { ArticleMeta } from '@/components/blog/article-meta'
import { ArticleSource } from '@/components/blog/article-source'
import { ArticleDisclaimer } from '@/components/blog/disclaimer'
import { RenderLexical, lexicalToPlainText } from '@/components/lexical/render-lexical'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { getArticleBySlug, getAllPublishedArticleSlugs } from '@/services/articles.service'
import { getSiteSettings } from '@/services/site.service'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedArticleSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Artigo não encontrado' }
  const description =
    article.excerpt ?? lexicalToPlainText(article.bodyLexical).slice(0, 200)
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      images: [{ url: article.coverUrl }],
    },
  }
}

export const revalidate = 300

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, settings] = await Promise.all([getArticleBySlug(slug), getSiteSettings()])
  if (!article) notFound()

  return (
    <article className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-balance font-semibold text-bitflix-900 text-4xl leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-4 text-bitflix-text/80 text-lg leading-relaxed">{article.excerpt}</p>
          ) : null}
          <div className="mt-6">
            <ArticleMeta article={article} />
          </div>
          {article.hasSlides ? (
            <div className="mt-6">
              <Link
                href={article.slidesHref}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full border border-bitflix-500 px-5 py-2 text-sm font-medium text-bitflix-700 transition-colors hover:bg-bitflix-500 hover:text-white"
              >
                <Presentation className="size-4" />
                Ver versão em slides
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative mx-auto max-w-4xl px-6 -mt-8">
        <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl border border-neutral-200 bg-bitflix-cream shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <Image
            src={article.coverUrl}
            alt={article.coverAlt}
            fill
            sizes="(min-width:1024px) 900px, 100vw"
            className="object-cover"
            priority
            unoptimized={article.coverUrl.startsWith('/og/')}
          />
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <RenderLexical
          data={article.bodyLexical}
          className="prose prose-lg max-w-none text-bitflix-text prose-headings:text-bitflix-900 prose-a:text-bitflix-700 hover:prose-a:text-bitflix-900"
        />

        {article.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/blog?tag=${t.slug}`}
                prefetch={false}
                className="rounded-full bg-bitflix-cream px-3 py-1 font-mono text-bitflix-700 text-xs hover:bg-bitflix-500 hover:text-white"
              >
                #{t.slug}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 pb-16">
        <ArticleSource source={article.source} />
        <ArticleDisclaimer variant={article.disclaimerVariant} />
      </section>

      <section className="border-t border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
            Quer aplicar no seu negócio?
          </h2>
          <p className="mt-3 text-bitflix-text/80">Mandamos um caminho realista no WhatsApp.</p>
          <div className="mt-6 flex justify-center">
            <WhatsAppButton settings={settings} source="from_blog_footer" />
          </div>
        </div>
      </section>
    </article>
  )
}
