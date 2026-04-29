import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slugify.ts'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'is_active', 'updatedAt'],
    description: 'Tags livres geradas pela skill /blog-import (5-10 por artigo).',
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
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
