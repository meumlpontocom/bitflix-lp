import type {
  HomePage,
  ProdutosPage,
  ServicosPage,
  SobrePage,
  ContatoPage,
} from '@/payload-types'

export type IconName =
  | 'Cpu'
  | 'Layers'
  | 'Rocket'
  | 'FlaskConical'
  | 'Network'
  | 'Cog'
  | 'Shield'
  | 'Zap'
  | 'Sparkles'
  | 'Code2'

export interface PillarVM {
  icon: IconName
  title: string
  body: string
}

export interface HomePageVM {
  heroTitlePrefix: string
  heroTitleHighlight: string
  heroTitleSuffix: string
  heroCtaPrimaryLabel: string
  heroCtaSecondaryLabel: string
  pillarsSectionTitle: string
  pillarsSectionBody: string
  pillars: PillarVM[]
  productsSectionTitle: string
  productsSectionBody: string
  productsSectionLinkLabel: string
  customSectionTitle: string
  customSectionBody: string
  customSectionCtaLabel: string
  customSectionWhatsappLabel: string
  customSectionAsideEyebrow: string
  customSectionSteps: string[]
  blogSectionTitle: string
  blogSectionBody: string
  blogSectionLinkLabel: string
  finalCtaTitle: string
  finalCtaBody: string
}

export interface ProdutosPageVM {
  eyebrow: string
  title: string
  subtitle: string
  emptyStateLabel: string
  bottomCtaTitle: string
  bottomCtaBody: string
}

export interface ProjectTypeVM {
  icon: IconName
  title: string
  body: string
}

export interface ProcessStepVM {
  number: string
  title: string
  body: string
}

export interface ServicosPageVM {
  eyebrow: string
  title: string
  subtitle: string
  heroCtaLabel: string
  projectTypesTitle: string
  projectTypes: ProjectTypeVM[]
  processTitle: string
  processSteps: ProcessStepVM[]
  stackTitle: string
  stackIntro: string
  stackItems: string[]
  bottomCtaTitle: string
  bottomCtaBody: string
}

export interface SobrePageVM {
  eyebrow: string
  title: string
  manifestoSectionTitle: string
  authorSectionTitle: string
  authorBioFallback: string
  finalCtaTitle: string
  finalCtaBody: string
}

export interface ContatoPageVM {
  eyebrow: string
  title: string
  subtitle: string
}

export function toHomePageVM(p: HomePage): HomePageVM {
  return {
    heroTitlePrefix: p.hero_title_prefix,
    heroTitleHighlight: p.hero_title_highlight,
    heroTitleSuffix: p.hero_title_suffix,
    heroCtaPrimaryLabel: p.hero_cta_primary_label,
    heroCtaSecondaryLabel: p.hero_cta_secondary_label,
    pillarsSectionTitle: p.pillars_section_title,
    pillarsSectionBody: p.pillars_section_body,
    pillars: (p.pillars ?? []).map((row) => ({
      icon: row.icon,
      title: row.title,
      body: row.body,
    })),
    productsSectionTitle: p.products_section_title,
    productsSectionBody: p.products_section_body,
    productsSectionLinkLabel: p.products_section_link_label,
    customSectionTitle: p.custom_section_title,
    customSectionBody: p.custom_section_body,
    customSectionCtaLabel: p.custom_section_cta_label,
    customSectionWhatsappLabel: p.custom_section_whatsapp_label,
    customSectionAsideEyebrow: p.custom_section_aside_eyebrow,
    customSectionSteps: (p.custom_section_steps ?? []).map((s) => s.text),
    blogSectionTitle: p.blog_section_title,
    blogSectionBody: p.blog_section_body,
    blogSectionLinkLabel: p.blog_section_link_label,
    finalCtaTitle: p.final_cta_title,
    finalCtaBody: p.final_cta_body,
  }
}

export function toProdutosPageVM(p: ProdutosPage): ProdutosPageVM {
  return {
    eyebrow: p.eyebrow,
    title: p.title,
    subtitle: p.subtitle,
    emptyStateLabel: p.empty_state_label,
    bottomCtaTitle: p.bottom_cta_title,
    bottomCtaBody: p.bottom_cta_body,
  }
}

export function toServicosPageVM(p: ServicosPage): ServicosPageVM {
  return {
    eyebrow: p.eyebrow,
    title: p.title,
    subtitle: p.subtitle,
    heroCtaLabel: p.hero_cta_label,
    projectTypesTitle: p.project_types_title,
    projectTypes: (p.project_types ?? []).map((row) => ({
      icon: row.icon,
      title: row.title,
      body: row.body,
    })),
    processTitle: p.process_title,
    processSteps: (p.process_steps ?? []).map((row) => ({
      number: row.number,
      title: row.title,
      body: row.body,
    })),
    stackTitle: p.stack_title,
    stackIntro: p.stack_intro,
    stackItems: (p.stack_items ?? []).map((s) => s.label),
    bottomCtaTitle: p.bottom_cta_title,
    bottomCtaBody: p.bottom_cta_body,
  }
}

export function toSobrePageVM(p: SobrePage): SobrePageVM {
  return {
    eyebrow: p.eyebrow,
    title: p.title,
    manifestoSectionTitle: p.manifesto_section_title,
    authorSectionTitle: p.author_section_title,
    authorBioFallback: p.author_bio_fallback,
    finalCtaTitle: p.final_cta_title,
    finalCtaBody: p.final_cta_body,
  }
}

export function toContatoPageVM(p: ContatoPage): ContatoPageVM {
  return {
    eyebrow: p.eyebrow,
    title: p.title,
    subtitle: p.subtitle,
  }
}
