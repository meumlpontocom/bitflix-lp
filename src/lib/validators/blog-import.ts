import { z } from 'zod'

const taxonomyItemSchema = z.object({
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
})

const sourceSchema = z
  .object({
    original_title: z.string().max(500).optional(),
    original_author: z.string().max(200).optional(),
    original_site: z.string().max(200).optional(),
    original_url: z.string().url().optional(),
    original_published_at: z.string().datetime().optional(),
    license_note: z.string().max(2000).optional(),
  })
  .optional()

const slideSchema = z.object({
  slide_title: z.string().max(200).optional(),
  slide_content: z.unknown().optional(),
  speaker_notes: z.string().max(2000).optional(),
})

export const blogImportRequestSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug deve ser kebab-case lowercase')
    .optional(),
  excerpt: z.string().max(280).optional(),
  body_lexical: z.unknown(),
  language_origin: z.enum(['en', 'pt-br', 'other']).default('en'),
  disclaimer_variant: z
    .enum(['ai-translated', 'ai-adapted-from-text', 'original'])
    .default('ai-translated'),
  is_bitflix_take: z.boolean().default(false),
  source: sourceSchema,
  categories: z.array(taxonomyItemSchema).max(8).default([]),
  tags: z.array(taxonomyItemSchema).max(20).default([]),
  has_slides: z.boolean().default(false),
  slides_blocks: z.array(slideSchema).max(30).default([]),
  llm_summary: z.string().max(1000).optional(),
  source_url: z.string().url().optional(),
  import_method: z.enum(['url', 'text-paste']).default('url'),
  triggered_by: z.string().max(40).optional(),
})

export type BlogImportRequest = z.infer<typeof blogImportRequestSchema>
export type BlogImportTaxonomyItem = z.infer<typeof taxonomyItemSchema>
