import type { ArticlesRepository } from '@/repositories/articles.repository'
import type { Article } from '@/payload-types'
import { ConflictError, NotFoundError } from '@/errors/AppError'

export class PublishArticleUseCase {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async execute(slug: string): Promise<Article> {
    const existing = await this.articlesRepository.findBySlug(slug)
    if (!existing) {
      throw new NotFoundError(`Artigo com slug "${slug}" nao encontrado`)
    }
    if (existing.status === 'published') {
      throw new ConflictError(`Artigo "${slug}" ja esta publicado`)
    }
    return this.articlesRepository.updateStatusToPublished(existing.id)
  }
}
