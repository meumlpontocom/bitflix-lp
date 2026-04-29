import type { GlobalConfig } from 'payload'

const linkFields = [
  { name: 'label', type: 'text', required: true },
  { name: 'href', type: 'text', required: true },
  {
    name: 'external',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Se true, abre em nova aba e usa rel=noopener.' },
  },
] as const

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    description: 'Menu principal e links do rodape.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'main_menu',
      type: 'array',
      fields: [...linkFields],
    },
    {
      name: 'footer_links',
      type: 'array',
      fields: [...linkFields],
    },
  ],
}
