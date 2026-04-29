import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Umami } from '@/components/analytics/umami'
import { getNavigation, getSiteSettings } from '@/services/site.service'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()])

  return (
    <>
      <SiteHeader navLinks={nav.mainMenu} />
      <main className="flex-1">{children}</main>
      <SiteFooter footerLinks={nav.footerLinks} />
      <Umami websiteId={settings.umamiWebsiteId} />
    </>
  )
}
