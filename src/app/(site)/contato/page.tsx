import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { getSiteSettings } from '@/services/site.service'
import { getContatoPage } from '@/services/pages.service'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale direto com a Bitflix.',
}

export const dynamic = 'force-dynamic'

export default async function ContatoPage() {
  const [settings, page] = await Promise.all([getSiteSettings(), getContatoPage()])

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">{page.eyebrow}</p>
        <h1 className="mt-3 font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-bitflix-text/80">{page.subtitle}</p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <WhatsAppButton settings={settings} />
          {settings.emailInstitutional ? (
            <a
              href={`mailto:${settings.emailInstitutional}`}
              className="inline-flex items-center gap-2 text-sm text-bitflix-700 hover:text-bitflix-900"
            >
              <Mail className="size-4" />
              {settings.emailInstitutional}
            </a>
          ) : null}
        </div>
      </section>
    </div>
  )
}
