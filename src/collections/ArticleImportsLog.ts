import type { CollectionConfig } from 'payload'

/**
 * Append-only audit log de imports da skill /blog-import.
 * Sem update, sem delete (lock via access).
 */
export const ArticleImportsLog: CollectionConfig = {
  slug: 'article-imports-log',
  labels: {
    singular: 'Article Import Log',
    plural: 'Article Imports Log',
  },
  admin: {
    useAsTitle: 'source_url',
    defaultColumns: ['article', 'source_url', 'import_method', 'createdAt'],
    description: 'Append-only. Editar/apagar bloqueado. Auditoria do /api/blog-import.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
    },
    {
      name: 'source_url',
      type: 'text',
    },
    {
      name: 'import_method',
      type: 'select',
      required: true,
      options: [
        { label: 'URL', value: 'url' },
        { label: 'Texto colado', value: 'text-paste' },
      ],
    },
    {
      name: 'triggered_by',
      type: 'text',
      admin: {
        description: 'Identificador do token usado (hash dos primeiros 8 chars).',
      },
    },
    {
      name: 'llm_summary',
      type: 'textarea',
      admin: {
        description: 'Resumo curto da adaptacao feita pelo LLM (categorias sugeridas, voz, etc).',
      },
    },
  ],
  timestamps: true,
}
