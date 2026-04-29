import type {
  ArticleImportsLogRepository,
  CreateImportLogInput,
} from '@/repositories/article-imports-log.repository'

export class CreateImportLogUseCase {
  constructor(private readonly articleImportsLogRepository: ArticleImportsLogRepository) {}

  async execute(input: CreateImportLogInput): Promise<void> {
    await this.articleImportsLogRepository.create(input)
  }
}
