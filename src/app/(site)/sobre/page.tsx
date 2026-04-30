import type { Metadata } from 'next'
import { RenderLexical } from '@/components/lexical/render-lexical'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { getSiteSettings } from '@/services/site.service'
import { getAuthorBySlug, MILTON_SLUG } from '@/services/authors.service'
import { getSobrePage } from '@/services/pages.service'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Quem é a Bitflix e por que IA precisa chegar no cliente final.',
}

export default async function SobrePage() {
  const [settings, author, page] = await Promise.all([
    getSiteSettings(),
    getAuthorBySlug(MILTON_SLUG),
    getSobrePage(),
  ])

  return (
    <div className="bg-white">
      <header className="border-b border-neutral-200 bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            {page.title}
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
          {page.manifestoSectionTitle}
        </h2>
        <div className="mt-6 text-bitflix-text/85 text-lg leading-relaxed">
          {settings.manifestoLexical ? (
            <RenderLexical data={settings.manifestoLexical} className="prose prose-lg" />
          ) : null}
        </div>
      </section>

      {author ? (
        <section className="bg-bitflix-cream-light">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
              {page.authorSectionTitle}
            </h2>
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="font-semibold text-bitflix-900 text-lg">{author.name}</p>
              {author.bio ? (
                <p className="mt-3 text-bitflix-text/80 leading-relaxed">{author.bio}</p>
              ) : (
                <p className="mt-3 text-bitflix-text/60 italic">{page.authorBioFallback}</p>
              )}
              {(author.social.twitter || author.social.linkedin || author.social.github) && (
                <div className="mt-4 flex gap-4 text-sm text-bitflix-700">
                  {author.social.linkedin && (
                    <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {author.social.github && (
                    <a href={author.social.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {author.social.twitter && (
                    <a href={author.social.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
          {page.finalCtaTitle}
        </h2>
        <p className="mt-3 text-bitflix-text/80">{page.finalCtaBody}</p>
        <div className="mt-6 flex justify-center">
          <WhatsAppButton settings={settings} />
        </div>
      </section>
    </div>
  )
}
