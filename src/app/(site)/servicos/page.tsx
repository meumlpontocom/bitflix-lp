import type { Metadata } from 'next'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { getSiteSettings } from '@/services/site.service'
import { getServicosPage } from '@/services/pages.service'
import { getIcon } from '@/lib/icon-map'
import { DotGrid } from '@/components/decor/dot-grid'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Projetos personalizados Bitflix: IA aplicada para médias e grandes empresas.',
}

export const dynamic = 'force-dynamic'

export default async function ServicosPage() {
  const [settings, page] = await Promise.all([getSiteSettings(), getServicosPage()])

  return (
    <div className="bg-white">
      <header className="relative overflow-hidden bg-bitflix-cream-light">
        <DotGrid />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bitflix-text/80">{page.subtitle}</p>
          <div className="mt-8">
            <WhatsAppButton settings={settings} source="from_custom_cta" label={page.heroCtaLabel} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
          {page.projectTypesTitle}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {page.projectTypes.map((type) => {
            const Icon = getIcon(type.icon)
            return (
              <div
                key={type.title}
                className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <Icon className="size-6 shrink-0 text-bitflix-500" />
                <div>
                  <h3 className="font-semibold text-bitflix-900 text-lg">{type.title}</h3>
                  <p className="mt-2 text-sm text-bitflix-text/75 leading-relaxed">{type.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
            {page.processTitle}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {page.processSteps.map((s) => (
              <div key={s.number} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="font-mono text-bitflix-500 text-sm">{s.number}</p>
                <h3 className="mt-2 font-semibold text-bitflix-900 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-bitflix-text/75 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">
          {page.stackTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-bitflix-text/75">{page.stackIntro}</p>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {page.stackItems.map((s) => (
            <li
              key={s}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-mono text-bitflix-text/80 text-sm"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
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
