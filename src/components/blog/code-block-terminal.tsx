'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Props {
  code: string
  language?: string
}

export function CodeBlockTerminal({ code, language }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const label = language?.trim() || 'prompt'

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-green-500/80" aria-hidden />
          <span className="ml-3 font-mono text-xs uppercase tracking-wider text-zinc-400">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          aria-label={copied ? 'Copiado' : 'Copiar código'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-teal-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 text-sm leading-relaxed text-zinc-100">
        <code className="font-mono whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  )
}
