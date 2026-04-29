import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slugify.ts'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'is_bitflix_take', 'published_at', 'updatedAt'],
    description:
      'Posts do blog. Adaptacao editorial (nao traducao fiel). Fonte sempre citada.',
    listSearchableFields: ['title', 'excerpt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteudo',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
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
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description: 'Resumo curto (~200 caracteres). Aparece no listing e meta description.',
              },
              maxLength: 280,
            },
            {
              name: 'body_lexical',
              type: 'richText',
              required: true,
            },
            {
              name: 'cover_image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Cover gerado automaticamente via OG dinamico (/og/[slug]) se vazio. Faca override apenas se quiser foto/AI especifica.',
              },
            },
            {
              name: 'cover_image_override',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Sobrescreve o cover dinamico (uso pontual).',
              },
            },
          ],
        },
        {
          label: 'Fonte e adaptacao',
          fields: [
            {
              name: 'source',
              type: 'group',
              fields: [
                { name: 'original_title', type: 'text' },
                { name: 'original_author', type: 'text' },
                { name: 'original_site', type: 'text' },
                {
                  name: 'original_url',
                  type: 'text',
                  validate: (value: unknown) => {
                    if (!value) return true
                    try {
                      new URL(String(value))
                      return true
                    } catch {
                      return 'URL invalida'
                    }
                  },
                },
                { name: 'original_published_at', type: 'date' },
                { name: 'license_note', type: 'textarea' },
              ],
            },
            {
              name: 'language_origin',
              type: 'select',
              required: true,
              defaultValue: 'en',
              options: [
                { label: 'English', value: 'en' },
                { label: 'Portugues (PT-BR)', value: 'pt-br' },
                { label: 'Outro', value: 'other' },
              ],
            },
            {
              name: 'disclaimer_variant',
              type: 'select',
              required: true,
              defaultValue: 'ai-translated',
              options: [
                { label: 'Traducao adaptada por IA', value: 'ai-translated' },
                { label: 'Compilacao editorial Bitflix com IA', value: 'ai-adapted-from-text' },
                { label: 'Texto original (sem IA)', value: 'original' },
              ],
            },
            {
              name: 'is_bitflix_take',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Marca artigo com adaptacao forte. Mostra tag [Bitflix Take] no listing/article.',
              },
            },
          ],
        },
        {
          label: 'Slides',
          fields: [
            {
              name: 'has_slides',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Habilita rota /blog/[slug]/slides com reveal.js.',
              },
            },
            {
              name: 'slides_blocks',
              type: 'array',
              admin: {
                condition: (data) => Boolean(data?.has_slides),
                description: '8-12 slides geralmente. Geradas automaticamente pela skill /blog-import.',
              },
              fields: [
                { name: 'slide_title', type: 'text' },
                { name: 'slide_content', type: 'richText' },
                { name: 'slide_image', type: 'upload', relationTo: 'media' },
                { name: 'speaker_notes', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Taxonomia e autor',
          fields: [
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              required: true,
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
          label: 'Publicacao',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              options: [
                { label: 'Rascunho', value: 'draft' },
                { label: 'Em revisao', value: 'review' },
                { label: 'Publicado', value: 'published' },
              ],
            },
            {
              name: 'published_at',
              type: 'date',
              admin: {
                description:
                  'Setado automaticamente quando status muda para "published" se vazio.',
                date: { pickerAppearance: 'dayAndTime' },
              },
            },
            {
              name: 'is_active',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Soft delete. Artigos inativos nao aparecem no site publico.',
              },
            },
            {
              name: 'created_via',
              type: 'select',
              required: true,
              defaultValue: 'manual',
              admin: {
                readOnly: true,
                description: 'Auditoria. Setado pelo endpoint /api/blog-import.',
              },
              options: [
                { label: 'Manual', value: 'manual' },
                { label: 'Skill /blog-import', value: 'blog-import-skill' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        // Auto-set published_at quando promove para "published" pela primeira vez
        if (
          data?.status === 'published' &&
          !data?.published_at &&
          (operation === 'create' || originalDoc?.status !== 'published')
        ) {
          data.published_at = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
