import type { CollectionConfig } from 'payload'

const validateUrl = (value: unknown) => {
  if (!value) return true
  try {
    new URL(String(value))
    return true
  } catch {
    return 'URL invalida'
  }
}

export const OpenSourceCatalogImports: CollectionConfig = {
  slug: 'open-source-catalog-imports',
  admin: {
    useAsTitle: 'source_url',
    defaultColumns: ['source_name', 'status', 'repos_found_count', 'repos_imported_count', 'updatedAt'],
    description:
      'Execucoes de importacao do catalogo open source. Use para auditoria de fonte, status e erros.',
    group: 'Catalogo Open Source',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'source_url',
      type: 'text',
      required: true,
      validate: validateUrl,
      admin: {
        description: 'URL da lista, video, newsletter ou pagina usada para descobrir repositorios.',
      },
    },
    {
      name: 'source_name',
      type: 'text',
      defaultValue: 'Github Awesome',
    },
    {
      name: 'requested_by',
      type: 'text',
      admin: {
        description: 'Pessoa/agente que solicitou ou executou a importacao.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Rodando', value: 'running' },
        { label: 'Concluido', value: 'done' },
        { label: 'Parcial', value: 'partial' },
        { label: 'Falhou', value: 'failed' },
      ],
    },
    {
      name: 'repos_found_count',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'repos_imported_count',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'repos_skipped_count',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'errors',
      type: 'array',
      admin: {
        description: 'Erros acumulados durante a importacao. Nao usar para HTML bruto da fonte.',
      },
      fields: [
        { name: 'repository_url', type: 'text', validate: validateUrl },
        { name: 'message', type: 'textarea', required: true },
        { name: 'occurred_at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'started_at',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'finished_at',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Notas editoriais. Nao colar conteudo pago; registrar apenas contexto operacional.',
      },
    },
  ],
}
