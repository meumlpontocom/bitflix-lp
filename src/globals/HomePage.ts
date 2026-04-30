import type { GlobalConfig } from 'payload'

const ICON_OPTIONS = [
  { label: 'Cpu', value: 'Cpu' },
  { label: 'Layers', value: 'Layers' },
  { label: 'Rocket', value: 'Rocket' },
  { label: 'FlaskConical', value: 'FlaskConical' },
  { label: 'Network', value: 'Network' },
  { label: 'Cog', value: 'Cog' },
  { label: 'Shield', value: 'Shield' },
  { label: 'Zap', value: 'Zap' },
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Code2', value: 'Code2' },
] as const

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  admin: {
    description: 'Conteudo editorial da home (/). Manifesto continua em Site Settings.',
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
            {
              name: 'hero_title_prefix',
              type: 'text',
              required: true,
              admin: { description: 'Texto antes da palavra destacada. Ex: "Software com IA"' },
            },
            {
              name: 'hero_title_highlight',
              type: 'text',
              required: true,
              admin: { description: 'Palavra(s) destacadas na cor teal. Ex: "embarcada"' },
            },
            {
              name: 'hero_title_suffix',
              type: 'text',
              required: true,
              admin: { description: 'Texto depois do destaque. Ex: "no cliente final."' },
            },
            {
              name: 'hero_cta_primary_label',
              type: 'text',
              required: true,
              defaultValue: 'Conhecer produtos',
            },
            {
              name: 'hero_cta_secondary_label',
              type: 'text',
              required: true,
              defaultValue: 'Projeto sob demanda',
            },
          ],
        },
        {
          label: 'Pillars',
          fields: [
            {
              name: 'pillars_section_title',
              type: 'text',
              required: true,
            },
            {
              name: 'pillars_section_body',
              type: 'textarea',
              required: true,
            },
            {
              name: 'pillars',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: ICON_OPTIONS as unknown as { label: string; value: string }[],
                },
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Produtos section',
          fields: [
            { name: 'products_section_title', type: 'text', required: true },
            { name: 'products_section_body', type: 'textarea', required: true },
            { name: 'products_section_link_label', type: 'text', required: true, defaultValue: 'Ver todos' },
          ],
        },
        {
          label: 'Custom (sob demanda)',
          fields: [
            { name: 'custom_section_title', type: 'text', required: true },
            { name: 'custom_section_body', type: 'textarea', required: true },
            { name: 'custom_section_cta_label', type: 'text', required: true, defaultValue: 'Como funciona' },
            { name: 'custom_section_whatsapp_label', type: 'text', required: true, defaultValue: 'Tirar dúvidas' },
            { name: 'custom_section_aside_eyebrow', type: 'text', required: true, defaultValue: 'Como entregamos' },
            {
              name: 'custom_section_steps',
              type: 'array',
              minRows: 1,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Blog section',
          fields: [
            { name: 'blog_section_title', type: 'text', required: true, defaultValue: 'Do blog' },
            { name: 'blog_section_body', type: 'textarea', required: true },
            { name: 'blog_section_link_label', type: 'text', required: true, defaultValue: 'Ler tudo' },
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
