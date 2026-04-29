import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SlideDeck } from '@/components/blog/slide-deck'
import { getArticleBySlug } from '@/services/articles.service'
import './slides.css'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  return {
    title: article ? `${article.title} · Slides` : 'Slides não encontrados',
    description: article?.excerpt ?? undefined,
  }
}

export default async function SlidesPage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article || !article.hasSlides) notFound()

  return (
    <div className="bitflix-slides-host">
      <SlideDeck slides={article.slides} title={article.title} />
    </div>
  )
}
