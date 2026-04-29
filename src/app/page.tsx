import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bitflix-cream-light px-6 text-bitflix-text">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-bitflix-900 sm:text-6xl">
          bitflix
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-bitflix-text/80">
          Software com IA embarcada para o cliente final. Site institucional em
          construção — Fase 1 do MVP em andamento.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/admin"
            prefetch={false}
            className="inline-flex h-11 items-center justify-center rounded-full bg-bitflix-500 px-6 text-sm font-medium text-white transition hover:bg-bitflix-900"
          >
            Admin Payload
          </Link>
        </div>
      </div>
    </main>
  )
}
