import type { Article } from '@/payload-types'
import type { BlogImportRequest } from '@/lib/validators/blog-import'
import type { ArticlesRepository } from '@/repositories/articles.repository'
import type { AuthorsRepository } from '@/repositories/authors.repository'
import type { EnsureCategoryUseCase } from './ensure-category.use-case'
import type { EnsureTagUseCase } from './ensure-tag.use-case'
import type { CreateArticleUseCase } from './create-article.use-case'
import type { CreateImportLogUseCase } from './create-import-log.use-case'
import { ConflictError, NotFoundError } from '@/errors/AppError'
import { slugify } from '@/lib/slugify'
import { MILTON_SLUG } from '@/services/authors.service'

export class CreateArticleFromImportCoordinatorUseCase {
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly authorsRepository: AuthorsRepository,
    private readonly ensureCategoryUseCase: EnsureCategoryUseCase,
    private readonly ensureTagUseCase: EnsureTagUseCase,
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly createImportLogUseCase: CreateImportLogUseCase,
  ) {}

  async execute(input: BlogImportRequest): Promise<Article> {
    const slug = input.slug ?? slugify(input.title)

    const existing = await this.articlesRepository.findBySlug(slug)
    if (existing) {
      throw new ConflictError(`Artigo com slug "${slug}" ja existe (id ${existing.id})`)
    }

    const author = await this.authorsRepository.findBySlug(MILTON_SLUG)
    if (!author) {
      throw new NotFoundError(`Author "${MILTON_SLUG}" nao encontrado`)
    }

    const categoryIds = await Promise.all(
      input.categories.map((c) => this.ensureCategoryUseCase.execute(c)),
    )
    const tagIds = await Promise.all(input.tags.map((t) => this.ensureTagUseCase.execute(t)))

    const article = await this.createArticleUseCase.execute({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      body_lexical: input.body_lexical,
      language_origin: input.language_origin,
      disclaimer_variant: input.disclaimer_variant,
      is_bitflix_take: input.is_bitflix_take,
      source: input.source,
      categories: categoryIds,
      tags: tagIds,
      author: author.id,
      has_slides: input.has_slides,
      slides_blocks: input.slides_blocks,
      status: 'draft',
      created_via: 'blog-import-skill',
    })

    await this.createImportLogUseCase.execute({
      article: article.id,
      source_url: input.source_url,
      import_method: input.import_method,
      triggered_by: input.triggered_by,
      llm_summary: input.llm_summary,
    })

    return article
  }
}
