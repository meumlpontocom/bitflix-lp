import type { Metadata } from 'next'
import { ProductCard } from '@/components/products/product-card'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { listProducts } from '@/services/products.service'
import { getSiteSettings } from '@/services/site.service'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'SaaS Bitflix com IA embarcada para o cliente final.',
}

export default async function ProdutosPage() {
  const [products, settings] = await Promise.all([listProducts(), getSiteSettings()])

  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
            Produtos próprios
          </p>
          <h1 className="mt-3 font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            SaaS feitos para o cliente final usar IA.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bitflix-text/80">
            Cada produto vive em domínio próprio. O Bitflix.com.br é vitrine — clique no card pra ir
            direto pro site, trial ou login.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {products.length === 0 ? (
          <p className="text-bitflix-text/70">Em breve.</p>
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
            Não achou o que precisa?
          </h2>
          <p className="mt-3 text-bitflix-text/80">
            Construímos sob demanda também. Conta pra gente o problema.
          </p>
          <div className="mt-6 flex justify-center">
            <WhatsAppButton settings={settings} source="from_custom_cta" />
          </div>
        </div>
      </section>
    </div>
  )
}
