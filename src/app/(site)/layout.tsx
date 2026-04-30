import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Umami } from '@/components/analytics/umami'
import { getNavigation, getSiteSettings } from '@/services/site.service'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Bitflix — software com IA embarcada',
    template: '%s · Bitflix',
  },
  description:
    'Bitflix é uma dev house brasileira que constrói software para entregar IA ao cliente final. SaaS prontos e projetos sob demanda.',
  metadataBase: process.env.PAYLOAD_PUBLIC_SERVER_URL
    ? new URL(process.env.PAYLOAD_PUBLIC_SERVER_URL)
    : undefined,
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()])

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader navLinks={nav.mainMenu} />
        <main className="flex-1">{children}</main>
        <SiteFooter footerLinks={nav.footerLinks} />
        <Umami websiteId={settings.umamiWebsiteId} />
      </body>
    </html>
  )
}
