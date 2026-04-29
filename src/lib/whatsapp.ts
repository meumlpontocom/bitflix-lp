export type WhatsAppCtaSource = 'default' | 'from_saas_card' | 'from_custom_cta' | 'from_blog_footer'

export function buildWhatsAppUrl(
  number: string | null | undefined,
  message: string | null | undefined,
): string | null {
  if (!number) return null
  const cleaned = number.replace(/\D/g, '')
  if (!cleaned) return null
  const params = new URLSearchParams()
  if (message) params.set('text', message)
  const qs = params.toString()
  return `https://wa.me/${cleaned}${qs ? `?${qs}` : ''}`
}
