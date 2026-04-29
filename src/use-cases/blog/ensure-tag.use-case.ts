import type { TagsRepository } from '@/repositories/tags.repository'

export class EnsureTagUseCase {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async execute(input: { slug: string; name: string }): Promise<number> {
    const existing = await this.tagsRepository.findBySlug(input.slug)
    if (existing) return existing.id
    const created = await this.tagsRepository.create(input)
    return created.id
  }
}
