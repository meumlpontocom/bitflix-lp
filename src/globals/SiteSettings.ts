import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description:
      'Configuracoes globais do site. Placeholders editaveis aqui ate receber valores definitivos.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'manifesto',
      type: 'richText',
      admin: {
        description:
          'Manifesto Bitflix (~4-6 linhas). Aparece no hero da home e na intro de /sobre.',
      },
    },
    {
      name: 'whatsapp_number',
      type: 'text',
      admin: {
        description: 'Formato internacional sem +: ex 5551999999999',
      },
    },
    {
      name: 'whatsapp_messages',
      type: 'group',
      fields: [
        {
          name: 'default',
          type: 'textarea',
          admin: { description: 'Mensagem padrao usada se CTA nao especificar.' },
        },
        {
          name: 'from_saas_card',
          type: 'textarea',
          admin: { description: 'Quando user clica em CTA dentro de card de produto SaaS.' },
        },
        {
          name: 'from_custom_cta',
          type: 'textarea',
          admin: { description: 'CTA do trilho custom (mid/large) em /servicos.' },
        },
        {
          name: 'from_blog_footer',
          type: 'textarea',
          admin: { description: 'Footer de cada artigo do blog.' },
        },
      ],
    },
    {
      name: 'email_institutional',
      type: 'email',
      admin: { description: 'Opcional. Mostrado em /contato se preenchido.' },
    },
    {
      name: 'umami_website_id',
      type: 'text',
      admin: {
        description:
          'Criar website em https://stats.bitflix.com.br/dashboard e copiar o ID aqui. Script so injeta em producao.',
      },
    },
    {
      name: 'migration_strategy',
      type: 'textarea',
      admin: {
        description:
          'Anotacoes livres sobre estrategia de migracao da LP atual em bitflix.com.br. Apagavel quando cutover concluido.',
      },
    },
  ],
}
