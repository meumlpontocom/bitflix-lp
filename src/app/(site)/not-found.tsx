import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-bitflix-text">
      <p className="font-mono text-sm uppercase tracking-widest text-bitflix-500">
        404
      </p>
      <h1 className="text-3xl font-semibold text-bitflix-900">
        Página não encontrada
      </h1>
      <p className="text-bitflix-text/80">
        O endereço acessado não existe ou foi movido.
      </p>
      <Link
        href="/"
        prefetch={false}
        className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 text-sm font-medium text-white transition hover:bg-bitflix-900"
      >
        Voltar à página inicial
      </Link>
    </main>
  )
}
