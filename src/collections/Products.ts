import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slugify.ts'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'domain', 'featured', 'display_order'],
    description:
      'SaaS proprios da Bitflix. Vitrine na home + grid em /produtos. CTA externo para o dominio do produto.',
    listSearchableFields: ['name', 'tagline'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
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
            if (data?.name) return slugify(String(data.name))
            return value
          },
        ],
      },
    },
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'Frase curta (~80 chars) que resume o produto.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      admin: {
        description: 'Sem protocolo. Ex: meuml.com',
      },
    },
    {
      name: 'cta_url',
      type: 'text',
      admin: {
        description: 'Link externo. Se vazio, derivado de https://{domain}.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.domain) return `https://${data.domain}`
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'em-desenvolvimento',
      options: [
        { label: 'Producao', value: 'producao' },
        { label: 'Recem-lancado', value: 'recem-lancado' },
        { label: 'Em desenvolvimento', value: 'em-desenvolvimento' },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Destacar na home (se mais de 4 featured, ordenar por display_order).',
      },
    },
    {
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Ordem ascendente (menor primeiro).',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
