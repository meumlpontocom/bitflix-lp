import { getPayload } from '@/lib/payload'
import { toNavigationVM, toSiteSettingsVM, type NavigationVM, type SiteSettingsVM } from '@/dto/site'

export async function getSiteSettings(): Promise<SiteSettingsVM> {
  const payload = await getPayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  return toSiteSettingsVM(settings)
}

export async function getNavigation(): Promise<NavigationVM> {
  const payload = await getPayload()
  const nav = await payload.findGlobal({ slug: 'navigation', depth: 1 })
  return toNavigationVM(nav)
}
