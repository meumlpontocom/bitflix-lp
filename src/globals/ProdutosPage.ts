import type { GlobalConfig } from 'payload'

export const ProdutosPage: GlobalConfig = {
  slug: 'produtos-page',
  admin: {
    description: 'Conteudo editorial de /produtos. Lista de produtos vem da collection Products.',
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
            { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Produtos próprios' },
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Empty state',
          fields: [
            {
              name: 'empty_state_label',
              type: 'text',
              required: true,
              defaultValue: 'Em breve.',
              admin: { description: 'Texto exibido se nenhum produto cadastrado.' },
            },
          ],
        },
        {
          label: 'CTA bottom',
          fields: [
            { name: 'bottom_cta_title', type: 'text', required: true },
            { name: 'bottom_cta_body', type: 'textarea', required: true },
          ],
        },
      ],
    },
  ],
}
