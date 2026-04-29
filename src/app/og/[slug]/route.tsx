import { ImageResponse } from 'next/og'
import { getArticleBySlug } from '@/services/articles.service'

export const runtime = 'nodejs'
export const revalidate = 3600

interface Params {
  params: Promise<{ slug: string }>
}

const TEAL_900 = '#003030'
const TEAL_500 = '#008090'
const CREAM = '#fbf1e1'

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  const title = article?.title ?? 'Bitflix'
  const category = article?.categories[0]?.name ?? 'IA aplicada'

  const dotPattern = `radial-gradient(rgba(255,255,255,0.18) 1.4px, transparent 1.4px)`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: `linear-gradient(135deg, ${TEAL_900} 0%, ${TEAL_500} 100%)`,
          color: CREAM,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: dotPattern,
            backgroundSize: '24px 24px',
            opacity: 0.6,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: CREAM,
            }}
          />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
            bitflix
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, zIndex: 1 }}>
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(251,241,225,0.18)',
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          <span>bitflix.com.br</span>
          <span>IA embarcada no cliente final</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  )
}
