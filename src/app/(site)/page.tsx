import Link from 'next/link'
import { ArrowRight, Cpu, Layers, Rocket } from 'lucide-react'
import { DotGrid } from '@/components/decor/dot-grid'
import { ProductCard } from '@/components/products/product-card'
import { ArticleCard } from '@/components/blog/article-card'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { RenderLexical } from '@/components/lexical/render-lexical'
import { listProducts } from '@/services/products.service'
import { getLatestArticles } from '@/services/articles.service'
import { getSiteSettings } from '@/services/site.service'
import { ROUTES } from '@/lib/constants/routes'

export default async function HomePage() {
  const [products, latestPosts, settings] = await Promise.all([
    listProducts(),
    getLatestArticles(4),
    getSiteSettings(),
  ])

  const featured = products.filter((p) => p.featured)
  const display = featured.length > 0 ? featured : products.slice(0, 4)

  return (
    <>
      <section className="relative overflow-hidden bg-bitflix-cream-light">
        <DotGrid />
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <h1 className="text-balance font-semibold text-bitflix-900 text-5xl leading-tight tracking-tight sm:text-6xl">
            Software com IA <span className="text-bitflix-500">embarcada</span> no cliente final.
          </h1>

          <div className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-bitflix-text/80">
            {settings.manifestoLexical ? (
              <RenderLexical data={settings.manifestoLexical} className="prose prose-lg" />
            ) : (
              <p>
                Bitflix é uma dev house brasileira que constrói software entregando IA ao usuário
                final, não apenas como produtividade interna do time. SaaS prontos e projetos
                personalizados sob demanda.
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.produtos}
              prefetch={false}
              className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 font-medium text-sm text-white transition-colors hover:bg-bitflix-900"
            >
              Conhecer produtos
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href={ROUTES.servicos}
              prefetch={false}
              className="inline-flex h-11 items-center justify-center rounded-full border border-bitflix-500 px-6 font-medium text-sm text-bitflix-700 transition-colors hover:bg-bitflix-500 hover:text-white"
            >
              Projeto sob demanda
            </Link>
            <WhatsAppButton settings={settings} variant="outline" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
              IA não como ferramenta interna — como entrega.
            </h2>
            <p className="mt-4 text-bitflix-text/75 leading-relaxed">
              Construímos produtos onde o cliente final usa IA diretamente. Não é só Copilot no nosso
              IDE: é IA viva no software que vai pra produção.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Cpu,
                title: 'IA no produto, não no processo',
                body: 'Cada SaaS Bitflix entrega capacidade de IA ao usuário, embarcada no fluxo do produto.',
              },
              {
                icon: Layers,
                title: 'Stack moderno, sênior',
                body: 'Next, Postgres, Drizzle, Payload, Tailwind. Arquitetura em camadas, testável, observável.',
              },
              {
                icon: Rocket,
                title: 'Entrega pra valer',
                body: 'Do MVP ao produto em produção. Sem parar no PowerPoint. Domínio próprio, deploy próprio.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              >
                <Icon className="size-6 text-bitflix-500" />
                <h3 className="mt-4 font-semibold text-bitflix-900 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bitflix-text/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-bitflix-cream-light">
        <DotGrid className="opacity-60" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
                Produtos próprios
              </h2>
              <p className="mt-3 max-w-xl text-bitflix-text/75 leading-relaxed">
                Cada um com seu domínio, seu trial, sua dor. O CTA leva direto pro produto.
              </p>
            </div>
            <Link
              href={ROUTES.produtos}
              prefetch={false}
              className="hidden text-sm font-medium text-bitflix-700 hover:text-bitflix-900 sm:inline-flex sm:items-center"
            >
              Ver todos
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
              Projeto sob demanda
            </h2>
            <p className="mt-4 text-bitflix-text/80 leading-relaxed">
              Projetos personalizados para empresas médias e grandes. IA aplicada à dor real do
              negócio, integrada no software entregue ao seu cliente final.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={ROUTES.servicos}
                prefetch={false}
                className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 font-medium text-sm text-white transition-colors hover:bg-bitflix-900"
              >
                Como funciona
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <WhatsAppButton settings={settings} source="from_custom_cta" variant="outline" label="Tirar dúvidas" />
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-bitflix-cream p-8">
            <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
              Como entregamos
            </p>
            <ul className="mt-4 space-y-3 text-sm text-bitflix-text/85">
              <li>1. Diagnóstico curto da dor + escopo realista do MVP.</li>
              <li>2. Construção em ciclos curtos, deploy em staging cedo.</li>
              <li>3. Entrega ao cliente em produção, com observabilidade.</li>
              <li>4. Evolução incremental conforme uso real.</li>
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
                  Do blog
                </h2>
                <p className="mt-3 text-bitflix-text/75">
                  Adaptações editoriais do que está acontecendo em IA aplicada.
                </p>
              </div>
              <Link
                href={ROUTES.blog}
                prefetch={false}
                className="hidden text-sm font-medium text-bitflix-700 hover:text-bitflix-900 sm:inline-flex sm:items-center"
              >
                Ler tudo
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
            Vamos conversar?
          </h2>
          <p className="mt-4 text-bitflix-text/80 leading-relaxed">
            Pega o WhatsApp aí. Sem formulário, sem fila. Resposta direta.
          </p>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton settings={settings} />
          </div>
        </div>
      </section>
    </>
  )
}
