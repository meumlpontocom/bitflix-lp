import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { CodeBlockTerminal } from '@/components/blog/code-block-terminal'

interface Props {
  data: unknown
  className?: string
}

function extractCodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { children?: unknown[] }
  if (!Array.isArray(n.children)) return ''
  const parts: string[] = []
  for (const child of n.children) {
    if (!child || typeof child !== 'object') continue
    const c = child as { type?: string; text?: string; children?: unknown[] }
    if (c.type === 'linebreak') {
      parts.push('\n')
    } else if (typeof c.text === 'string') {
      parts.push(c.text)
    } else if (Array.isArray(c.children)) {
      parts.push(extractCodeText(c))
    }
  }
  return parts.join('')
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  code: ({ node }) => {
    const text = extractCodeText(node)
    const language = (node as { language?: string }).language
    return <CodeBlockTerminal code={text} language={language} />
  },
})

export function RenderLexical({ data, className }: Props) {
  if (!data || typeof data !== 'object') return null
  return (
    <div className={className}>
      <RichText converters={jsxConverters} data={data as SerializedEditorState} />
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
