import Script from 'next/script'

interface Props {
  websiteId: string | null
}

export function Umami({ websiteId }: Props) {
  if (process.env.NODE_ENV !== 'production') return null
  if (!websiteId) return null
  const src = process.env.UMAMI_SCRIPT_URL ?? 'https://stats.bitflix.com.br/script.js'
  return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" defer />
}
