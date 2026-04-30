import type { GlobalConfig } from 'payload'

const ICON_OPTIONS = [
  { label: 'FlaskConical', value: 'FlaskConical' },
  { label: 'Network', value: 'Network' },
  { label: 'Cog', value: 'Cog' },
  { label: 'Shield', value: 'Shield' },
  { label: 'Cpu', value: 'Cpu' },
  { label: 'Layers', value: 'Layers' },
  { label: 'Rocket', value: 'Rocket' },
  { label: 'Zap', value: 'Zap' },
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Code2', value: 'Code2' },
] as const

export const ServicosPage: GlobalConfig = {
  slug: 'servicos-page',
  admin: {
    description: 'Conteudo editorial de /servicos.',
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
            { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Projetos sob demanda' },
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'textarea', required: true },
            { name: 'hero_cta_label', type: 'text', required: true, defaultValue: 'Solicitar orçamento' },
          ],
        },
        {
          label: 'Tipos de projeto',
          fields: [
            { name: 'project_types_title', type: 'text', required: true, defaultValue: 'Tipos de projeto' },
            {
              name: 'project_types',
              type: 'array',
              minRows: 1,
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
          label: 'Como trabalhamos',
          fields: [
            { name: 'process_title', type: 'text', required: true, defaultValue: 'Como trabalhamos' },
            {
              name: 'process_steps',
              type: 'array',
              minRows: 1,
              fields: [
                { name: 'number', type: 'text', required: true, admin: { description: 'Ex: 01, 02, 03, 04' } },
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Stack',
          fields: [
            { name: 'stack_title', type: 'text', required: true, defaultValue: 'Stack atual' },
            { name: 'stack_intro', type: 'textarea', required: true },
            {
              name: 'stack_items',
              type: 'array',
              minRows: 1,
              fields: [{ name: 'label', type: 'text', required: true }],
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
