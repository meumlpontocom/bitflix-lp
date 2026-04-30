import type { Metadata } from 'next'
import { ProductCard } from '@/components/products/product-card'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { listProducts } from '@/services/products.service'
import { getSiteSettings } from '@/services/site.service'
import { getProdutosPage } from '@/services/pages.service'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'SaaS Bitflix com IA embarcada para o cliente final.',
}

export default async function ProdutosPage() {
  const [products, settings, page] = await Promise.all([
    listProducts(),
    getSiteSettings(),
    getProdutosPage(),
  ])

  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bitflix-text/80">{page.subtitle}</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {products.length === 0 ? (
          <p className="text-bitflix-text/70">{page.emptyStateLabel}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} showDescription />
            ))}
          </div>
        )}
      </section>

      <section className="bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
            {page.bottomCtaTitle}
          </h2>
          <p className="mt-3 text-bitflix-text/80">{page.bottomCtaBody}</p>
          <div className="mt-6 flex justify-center">
            <WhatsAppButton settings={settings} source="from_custom_cta" />
          </div>
        </div>
      </section>
    </div>
  )
}
