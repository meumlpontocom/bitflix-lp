import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { parseOrThrow } from '@/lib/validators/parseOrThrow'
import type { PublishArticleUseCase } from '@/use-cases/blog/publish-article.use-case'

const publishRequestSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug deve ser kebab-case lowercase'),
})

export interface PublishArticleResult {
  article_id: number
  slug: string
  published_at: string | null
  status: 'published'
}

export class PublishArticleFacade {
  constructor(private readonly publishArticleUseCase: PublishArticleUseCase) {}

  async execute(input: unknown): Promise<PublishArticleResult> {
    const data = parseOrThrow(publishRequestSchema, input)
    const article = await this.publishArticleUseCase.execute(data.slug)
    revalidatePath('/blog')
    revalidatePath(`/blog/${article.slug}`)
    revalidatePath('/blog/feed.xml')
    revalidatePath('/sitemap.xml')
    return {
      article_id: article.id,
      slug: article.slug,
      published_at: article.published_at ?? null,
      status: 'published',
    }
  }
}
