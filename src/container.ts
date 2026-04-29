import { asClass, asValue, createContainer, InjectionMode, Lifetime } from 'awilix'
import type { Payload } from 'payload'
import { getPayload } from '@/lib/payload'

import { ArticlesRepository } from '@/repositories/articles.repository'
import { AuthorsRepository } from '@/repositories/authors.repository'
import { CategoriesRepository } from '@/repositories/categories.repository'
import { TagsRepository } from '@/repositories/tags.repository'
import { ArticleImportsLogRepository } from '@/repositories/article-imports-log.repository'

import { EnsureCategoryUseCase } from '@/use-cases/blog/ensure-category.use-case'
import { EnsureTagUseCase } from '@/use-cases/blog/ensure-tag.use-case'
import { CreateArticleUseCase } from '@/use-cases/blog/create-article.use-case'
import { CreateImportLogUseCase } from '@/use-cases/blog/create-import-log.use-case'
import { CreateArticleFromImportCoordinatorUseCase } from '@/use-cases/blog/create-article-from-import.coordinator.use-case'
import { PublishArticleUseCase } from '@/use-cases/blog/publish-article.use-case'

import { BlogImportFacade } from '@/facades/blog/blog-import.facade'
import { PublishArticleFacade } from '@/facades/blog/publish-article.facade'

export interface AppCradle {
  payload: Payload
  articlesRepository: ArticlesRepository
  authorsRepository: AuthorsRepository
  categoriesRepository: CategoriesRepository
  tagsRepository: TagsRepository
  articleImportsLogRepository: ArticleImportsLogRepository
  ensureCategoryUseCase: EnsureCategoryUseCase
  ensureTagUseCase: EnsureTagUseCase
  createArticleUseCase: CreateArticleUseCase
  createImportLogUseCase: CreateImportLogUseCase
  createArticleFromImportCoordinatorUseCase: CreateArticleFromImportCoordinatorUseCase
  publishArticleUseCase: PublishArticleUseCase
  blogImportFacade: BlogImportFacade
  publishArticleFacade: PublishArticleFacade
}

type AppContainer = Awaited<ReturnType<typeof buildContainer>>

let cached: Promise<AppContainer> | null = null

async function buildContainer() {
  const payload = await getPayload()
  const container = createContainer<AppCradle>({ injectionMode: InjectionMode.CLASSIC })

  container.register({
    payload: asValue(payload),
    articlesRepository: asClass(ArticlesRepository, { lifetime: Lifetime.SINGLETON }),
    authorsRepository: asClass(AuthorsRepository, { lifetime: Lifetime.SINGLETON }),
    categoriesRepository: asClass(CategoriesRepository, { lifetime: Lifetime.SINGLETON }),
    tagsRepository: asClass(TagsRepository, { lifetime: Lifetime.SINGLETON }),
    articleImportsLogRepository: asClass(ArticleImportsLogRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    ensureCategoryUseCase: asClass(EnsureCategoryUseCase, { lifetime: Lifetime.TRANSIENT }),
    ensureTagUseCase: asClass(EnsureTagUseCase, { lifetime: Lifetime.TRANSIENT }),
    createArticleUseCase: asClass(CreateArticleUseCase, { lifetime: Lifetime.TRANSIENT }),
    createImportLogUseCase: asClass(CreateImportLogUseCase, { lifetime: Lifetime.TRANSIENT }),
    createArticleFromImportCoordinatorUseCase: asClass(
      CreateArticleFromImportCoordinatorUseCase,
      { lifetime: Lifetime.TRANSIENT },
    ),
    publishArticleUseCase: asClass(PublishArticleUseCase, { lifetime: Lifetime.TRANSIENT }),
    blogImportFacade: asClass(BlogImportFacade, { lifetime: Lifetime.TRANSIENT }),
    publishArticleFacade: asClass(PublishArticleFacade, { lifetime: Lifetime.TRANSIENT }),
  })

  return container
}

export async function getContainer() {
  if (!cached) cached = buildContainer()
  return cached
}

export function resetContainer() {
  cached = null
}
