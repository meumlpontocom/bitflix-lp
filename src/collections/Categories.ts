import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slugify.ts'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'is_active', 'updatedAt'],
    description:
      'Taxonomia dinamica: criadas pela skill /blog-import ou manualmente. Sem categorias seed.',
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Soft delete. Categorias inativas nao aparecem no site publico.',
      },
    },
  ],
}
