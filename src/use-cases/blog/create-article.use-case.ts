import type { ArticlesRepository, CreateArticleInput } from '@/repositories/articles.repository'
import type { Article } from '@/payload-types'

export class CreateArticleUseCase {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async execute(input: CreateArticleInput): Promise<Article> {
    return this.articlesRepository.create(input)
  }
}
