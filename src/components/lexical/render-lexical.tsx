import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface Props {
  data: unknown
  className?: string
}

export function RenderLexical({ data, className }: Props) {
  if (!data || typeof data !== 'object') return null
  return (
    <div className={className}>
      <RichText data={data as SerializedEditorState} />
    </div>
  )
}

export function lexicalToPlainText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  const out: string[] = []
  const walk = (nodes: unknown[]) => {
    for (const n of nodes) {
      if (typeof n !== 'object' || n === null) continue
      const node = n as Record<string, unknown>
      if (typeof node.text === 'string') out.push(node.text)
      if (Array.isArray(node.children)) walk(node.children)
    }
  }
  walk(root.children)
  return out.join(' ').replace(/\s+/g, ' ').trim()
}
