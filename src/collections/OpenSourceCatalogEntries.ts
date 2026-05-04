import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slugify.ts'

const validateUrl = (value: unknown) => {
  if (!value) return true
  try {
    new URL(String(value))
    return true
  } catch {
    return 'URL invalida'
  }
}

export const OPEN_SOURCE_PROJECT_TYPE_OPTIONS = [
  { label: 'AI agent', value: 'ai-agent' },
  { label: 'MCP', value: 'mcp' },
  { label: 'LLM app', value: 'llm-app' },
  { label: 'Developer tool', value: 'developer-tool' },
  { label: 'Automacao', value: 'automation' },
  { label: 'Data/AI', value: 'data-ai' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Infra', value: 'infra' },
  { label: 'Seguranca', value: 'security' },
  { label: 'Aprendizado', value: 'learning' },
  { label: 'Outro', value: 'other' },
] as const

export const OpenSourceCatalogEntries: CollectionConfig = {
  slug: 'open-source-catalog-entries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project_type', 'primary_language', 'catalog_status', 'is_featured'],
    description:
      'Metadados estruturados do catalogo open source. Cada item aponta para um post real do blog.',
    group: 'Catalogo Open Source',
    listSearchableFields: ['title', 'repository_url', 'summary_pt_br'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Projeto',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (value) return slugify(String(value))
                    if (data?.title) return slugify(String(data.title))
                    return value
                  },
                ],
              },
            },
            {
              name: 'article',
              type: 'relationship',
              relationTo: 'articles',
              required: true,
              unique: true,
              admin: {
                description: 'Post do blog usado como detalhe publico do projeto.',
              },
            },
            {
              name: 'repository_url',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              validate: validateUrl,
            },
            { name: 'repository_owner', type: 'text', index: true },
            { name: 'repository_name', type: 'text', index: true },
            { name: 'homepage_url', type: 'text', validate: validateUrl },
            { name: 'docs_url', type: 'text', validate: validateUrl },
            {
              name: 'source_links',
              type: 'array',
              admin: {
                description: 'Links oficiais consultados: repo, docs, exemplos, site do projeto.',
              },
              fields: [
                { name: 'label', type: 'text' },
                { name: 'url', type: 'text', required: true, validate: validateUrl },
              ],
            },
          ],
        },
        {
          label: 'Curadoria',
          fields: [
            { name: 'description_original', type: 'textarea' },
            {
              name: 'summary_pt_br',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Resumo curto editorial para o card do catalogo.',
              },
              maxLength: 500,
            },
            { name: 'what_it_does', type: 'textarea' },
            { name: 'when_to_use', type: 'textarea' },
            { name: 'when_not_to_use', type: 'textarea' },
            {
              name: 'target_users',
              type: 'array',
              fields: [{ name: 'label', type: 'text', required: true }],
            },
            {
              name: 'project_type',
              type: 'select',
              required: true,
              defaultValue: 'other',
              options: [...OPEN_SOURCE_PROJECT_TYPE_OPTIONS],
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
            },
          ],
        },
        {
          label: 'GitHub',
          fields: [
            {
              name: 'github_topics',
              type: 'array',
              fields: [{ name: 'topic', type: 'text', required: true }],
            },
            { name: 'primary_language', type: 'text', index: true },
            { name: 'license', type: 'text', index: true },
            { name: 'stars', type: 'number', defaultValue: 0, min: 0 },
            { name: 'forks', type: 'number', defaultValue: 0, min: 0 },
            { name: 'open_issues', type: 'number', defaultValue: 0, min: 0 },
            { name: 'last_pushed_at', type: 'date' },
            { name: 'last_checked_at', type: 'date' },
            {
              name: 'readme_excerpt',
              type: 'textarea',
              admin: {
                description: 'Trecho curto e sanitizado, apenas quando ajudar a revisao editorial.',
              },
              maxLength: 1200,
            },
          ],
        },
        {
          label: 'Descoberta e publicacao',
          fields: [
            { name: 'discovery_source_url', type: 'text', validate: validateUrl },
            { name: 'discovery_source_name', type: 'text' },
            {
              name: 'discovery_batch_id',
              type: 'relationship',
              relationTo: 'open-source-catalog-imports',
            },
            {
              name: 'catalog_status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              options: [
                { label: 'Rascunho', value: 'draft' },
                { label: 'Em revisao', value: 'review' },
                { label: 'Publicado', value: 'published' },
                { label: 'Arquivado', value: 'archived' },
              ],
            },
            { name: 'is_featured', type: 'checkbox', defaultValue: false },
            { name: 'is_active', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
  ],
}
