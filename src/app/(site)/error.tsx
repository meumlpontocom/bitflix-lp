'use client'

export const dynamic = 'force-dynamic'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-bitflix-900">Algo deu errado</h1>
      <p className="text-bitflix-text/80">
        Tente novamente ou volte para a página inicial.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 text-sm font-medium text-white transition hover:bg-bitflix-900"
      >
        Tentar novamente
      </button>
    </main>
  )
}
