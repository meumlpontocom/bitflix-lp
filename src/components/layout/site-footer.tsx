import Link from 'next/link'
import type { NavLinkVM } from '@/dto/site'
import { ROUTES } from '@/lib/constants/routes'

interface Props {
  footerLinks: NavLinkVM[]
}

const DEFAULT_FOOTER: NavLinkVM[] = [
  { label: 'Produtos', href: ROUTES.produtos, external: false },
  { label: 'Serviços', href: ROUTES.servicos, external: false },
  { label: 'Blog', href: ROUTES.blog, external: false },
  { label: 'Contato', href: ROUTES.contato, external: false },
  { label: 'RSS', href: ROUTES.feed, external: false },
]

export function SiteFooter({ footerLinks }: Props) {
  const links = footerLinks.length > 0 ? footerLinks : DEFAULT_FOOTER
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-bitflix-cream-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="font-semibold text-bitflix-900 text-lg">bitflix</p>
          <p className="mt-3 text-sm leading-relaxed text-bitflix-text/75">
            Software com IA embarcada para o cliente final. SaaS prontos e projetos sob demanda.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={`f-${l.label}-${l.href}`}
              href={l.href}
              prefetch={false}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="text-sm text-bitflix-text/75 hover:text-bitflix-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-neutral-200/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-bitflix-text/60">
          <span>© {year} Bitflix</span>
          <span>Brasil</span>
        </div>
      </div>
    </footer>
  )
}
