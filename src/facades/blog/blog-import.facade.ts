import { parseOrThrow } from '@/lib/validators/parseOrThrow'
import { blogImportRequestSchema } from '@/lib/validators/blog-import'
import type { CreateArticleFromImportCoordinatorUseCase } from '@/use-cases/blog/create-article-from-import.coordinator.use-case'

export interface BlogImportResult {
  article_id: number
  slug: string
  admin_url: string
  status: 'draft'
}

export class BlogImportFacade {
  constructor(
    private readonly createArticleFromImportCoordinatorUseCase: CreateArticleFromImportCoordinatorUseCase,
  ) {}

  async create(input: unknown): Promise<BlogImportResult> {
    const data = parseOrThrow(blogImportRequestSchema, input)
    const article = await this.createArticleFromImportCoordinatorUseCase.execute(data)
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? ''
    return {
      article_id: article.id,
      slug: article.slug,
      admin_url: `${baseUrl}/admin/collections/articles/${article.id}`,
      status: 'draft',
    }
  }
}
