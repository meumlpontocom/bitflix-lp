import type { Navigation, SiteSetting } from '@/payload-types'

export interface NavLinkVM {
  label: string
  href: string
  external: boolean
}

export interface SiteSettingsVM {
  manifestoLexical: unknown
  whatsappNumber: string | null
  whatsappMessages: {
    default: string | null
    fromSaasCard: string | null
    fromCustomCta: string | null
    fromBlogFooter: string | null
  }
  emailInstitutional: string | null
  umamiWebsiteId: string | null
}

export interface NavigationVM {
  mainMenu: NavLinkVM[]
  footerLinks: NavLinkVM[]
}

export function toSiteSettingsVM(s: SiteSetting): SiteSettingsVM {
  return {
    manifestoLexical: s.manifesto ?? null,
    whatsappNumber: s.whatsapp_number ?? null,
    whatsappMessages: {
      default: s.whatsapp_messages?.default ?? null,
      fromSaasCard: s.whatsapp_messages?.from_saas_card ?? null,
      fromCustomCta: s.whatsapp_messages?.from_custom_cta ?? null,
      fromBlogFooter: s.whatsapp_messages?.from_blog_footer ?? null,
    },
    emailInstitutional: s.email_institutional ?? null,
    umamiWebsiteId: s.umami_website_id ?? null,
  }
}

export function toNavigationVM(n: Navigation): NavigationVM {
  return {
    mainMenu: (n.main_menu ?? []).map((l) => ({
      label: l.label,
      href: l.href,
      external: Boolean(l.external),
    })),
    footerLinks: (n.footer_links ?? []).map((l) => ({
      label: l.label,
      href: l.href,
      external: Boolean(l.external),
    })),
  }
}
