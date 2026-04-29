import Link from 'next/link'
import { Menu } from 'lucide-react'
import type { NavLinkVM } from '@/dto/site'
import { ROUTES } from '@/lib/constants/routes'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface Props {
  navLinks: NavLinkVM[]
}

const DEFAULT_LINKS: NavLinkVM[] = [
  { label: 'Produtos', href: ROUTES.produtos, external: false },
  { label: 'Serviços', href: ROUTES.servicos, external: false },
  { label: 'Blog', href: ROUTES.blog, external: false },
  { label: 'Sobre', href: ROUTES.sobre, external: false },
  { label: 'Contato', href: ROUTES.contato, external: false },
]

export function SiteHeader({ navLinks }: Props) {
  const links = navLinks.length > 0 ? navLinks : DEFAULT_LINKS

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={ROUTES.home}
          prefetch={false}
          className="font-semibold text-bitflix-900 text-lg tracking-tight"
        >
          bitflix
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={`${l.label}-${l.href}`}
              href={l.href}
              prefetch={false}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="text-sm text-bitflix-text/80 transition-colors hover:text-bitflix-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2 px-4">
                {links.map((l) => (
                  <Link
                    key={`m-${l.label}-${l.href}`}
                    href={l.href}
                    prefetch={false}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noopener noreferrer' : undefined}
                    className="rounded-md px-3 py-2 text-base text-bitflix-text/90 transition-colors hover:bg-bitflix-cream"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
