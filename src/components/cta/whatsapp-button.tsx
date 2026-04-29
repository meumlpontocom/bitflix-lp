import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, type WhatsAppCtaSource } from '@/lib/whatsapp'
import type { SiteSettingsVM } from '@/dto/site'
import { cn } from '@/lib/utils'

interface Props {
  settings: SiteSettingsVM
  source?: WhatsAppCtaSource
  label?: string
  variant?: 'primary' | 'outline'
  className?: string
}

const MESSAGE_FALLBACK = 'Olá Bitflix, gostaria de saber mais.'

export function WhatsAppButton({
  settings,
  source = 'default',
  label = 'Falar no WhatsApp',
  variant = 'primary',
  className,
}: Props) {
  const messageMap: Record<WhatsAppCtaSource, string | null> = {
    default: settings.whatsappMessages.default,
    from_saas_card: settings.whatsappMessages.fromSaasCard,
    from_custom_cta: settings.whatsappMessages.fromCustomCta,
    from_blog_footer: settings.whatsappMessages.fromBlogFooter,
  }
  const message = messageMap[source] ?? settings.whatsappMessages.default ?? MESSAGE_FALLBACK
  const url = buildWhatsAppUrl(settings.whatsappNumber, message)
  if (!url) return null

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-sm transition-colors'
  const styles =
    variant === 'primary'
      ? 'bg-bitflix-500 text-white hover:bg-bitflix-900'
      : 'border border-bitflix-500 text-bitflix-700 hover:bg-bitflix-500 hover:text-white'

  return (
    <Link
      href={url}
      prefetch={false}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, styles, className)}
    >
      <MessageCircle className="size-4" />
      {label}
    </Link>
  )
}
