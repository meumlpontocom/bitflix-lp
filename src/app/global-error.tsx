'use client'

export const dynamic = 'force-dynamic'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#2d2d2d',
          background: '#fbf1e1',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 600, color: '#003030' }}>
          Erro inesperado
        </h1>
        <p style={{ opacity: 0.8 }}>Tente novamente.</p>
        <button
          onClick={reset}
          style={{
            background: '#008090',
            color: '#fff',
            border: 'none',
            borderRadius: 9999,
            height: 44,
            padding: '0 24px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
