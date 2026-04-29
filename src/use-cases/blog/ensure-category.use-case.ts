import type { CategoriesRepository } from '@/repositories/categories.repository'

export class EnsureCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(input: { slug: string; name: string }): Promise<number> {
    const existing = await this.categoriesRepository.findBySlug(input.slug)
    if (existing) return existing.id
    const created = await this.categoriesRepository.create(input)
    return created.id
  }
}
