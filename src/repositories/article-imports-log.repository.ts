import type { Payload } from 'payload'

export interface CreateImportLogInput {
  article: number
  source_url?: string
  import_method: 'url' | 'text-paste'
  triggered_by?: string
  llm_summary?: string
}

export class ArticleImportsLogRepository {
  constructor(private readonly payload: Payload) {}

  async create(input: CreateImportLogInput): Promise<void> {
    await this.payload.create({
      collection: 'article-imports-log',
      data: input as never,
    })
  }
}
