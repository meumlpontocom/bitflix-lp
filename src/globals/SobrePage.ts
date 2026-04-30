import type { GlobalConfig } from 'payload'

export const SobrePage: GlobalConfig = {
  slug: 'sobre-page',
  admin: {
    description: 'Conteudo editorial de /sobre. Manifesto continua em Site Settings.',
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Sobre a Bitflix' },
            { name: 'title', type: 'text', required: true },
          ],
        },
        {
          label: 'Sections',
          fields: [
            { name: 'manifesto_section_title', type: 'text', required: true, defaultValue: 'Manifesto' },
            { name: 'author_section_title', type: 'text', required: true, defaultValue: 'Quem assina' },
            {
              name: 'author_bio_fallback',
              type: 'text',
              required: true,
              defaultValue: 'Bio em construção.',
              admin: { description: 'Mostrado se Author nao tem bio preenchida.' },
            },
          ],
        },
        {
          label: 'CTA final',
          fields: [
            { name: 'final_cta_title', type: 'text', required: true },
            { name: 'final_cta_body', type: 'textarea', required: true },
          ],
        },
      ],
    },
  ],
}
