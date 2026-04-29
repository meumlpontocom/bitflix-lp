'use client'

import { useEffect, useRef } from 'react'
import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { ArticleSlideVM } from '@/dto/article'

interface Props {
  slides: ArticleSlideVM[]
  title: string
}

export function SlideDeck({ slides, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Reveal.Api | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const deck = new Reveal(containerRef.current, {
      hash: true,
      controls: true,
      progress: true,
      slideNumber: 'c/t',
      transition: 'slide',
      embedded: false,
    })
    deck.initialize()
    deckRef.current = deck

    return () => {
      try {
        deck.destroy()
      } catch {
        // reveal.destroy throws on some HMR situations; safe to swallow.
      }
      deckRef.current = null
    }
  }, [slides])

  return (
    <div ref={containerRef} className="reveal">
      <div className="slides">
        <section data-state="cover">
          <h1>{title}</h1>
          <p style={{ opacity: 0.7 }}>Bitflix · IA aplicada ao cliente final</p>
        </section>

        {slides.map((s) => (
          <section key={s.index} data-state={`slide-${s.index}`}>
            {s.title ? <h2>{s.title}</h2> : null}
            {s.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.imageUrl}
                alt={s.title ?? `Slide ${s.index + 1}`}
                style={{ maxHeight: 360, margin: '0 auto', borderRadius: 12 }}
              />
            ) : null}
            {s.contentLexical && typeof s.contentLexical === 'object' ? (
              <RichText data={s.contentLexical as SerializedEditorState} />
            ) : null}
            {s.speakerNotes ? <aside className="notes">{s.speakerNotes}</aside> : null}
          </section>
        ))}
      </div>
    </div>
  )
}
