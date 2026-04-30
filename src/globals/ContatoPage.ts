import type { GlobalConfig } from 'payload'

export const ContatoPage: GlobalConfig = {
  slug: 'contato-page',
  admin: {
    description: 'Conteudo editorial de /contato. WhatsApp/email vem de Site Settings.',
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Contato' },
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'textarea', required: true },
  ],
}
