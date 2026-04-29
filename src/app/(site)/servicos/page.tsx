import type { Metadata } from 'next'
import { Cog, FlaskConical, Network, Shield } from 'lucide-react'
import { WhatsAppButton } from '@/components/cta/whatsapp-button'
import { getSiteSettings } from '@/services/site.service'
import { DotGrid } from '@/components/decor/dot-grid'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Projetos personalizados Bitflix: IA aplicada para médias e grandes empresas.',
}

const PROJECT_TYPES = [
  {
    icon: FlaskConical,
    title: 'MVPs com IA',
    body: 'Validar uma hipótese de IA em produção, com usuário real, em poucos ciclos.',
  },
  {
    icon: Network,
    title: 'Plataformas internas',
    body: 'Sistemas multi-usuário onde a IA agrega valor direto ao trabalho final do cliente.',
  },
  {
    icon: Cog,
    title: 'Integrações de IA',
    body: 'Plugar capacidade de IA em sistemas legados, bem desenhado, com guardrails.',
  },
  {
    icon: Shield,
    title: 'Auditoria + arquitetura',
    body: 'Reescrever ou consolidar bases existentes em arquitetura testável e observável.',
  },
]

const PROCESS_STEPS = [
  {
    n: '01',
    t: 'Diagnóstico',
    d: 'Conversa direta sobre a dor, restrições, prazo, orçamento. Saída com escopo de MVP realista.',
  },
  {
    n: '02',
    t: 'Construção',
    d: 'Ciclos curtos, deploy em staging desde a primeira semana. Demos quinzenais ao seu time.',
  },
  {
    n: '03',
    t: 'Produção',
    d: 'Deploy em produção, observabilidade, runbook. Entrega ao seu cliente final.',
  },
  {
    n: '04',
    t: 'Evolução',
    d: 'Iterar conforme uso real. Sem cobrança fantasma. Cada ciclo é planejado e visível.',
  },
]

const STACK = [
  'Next.js 15 + React 19',
  'TypeScript 5.9',
  'PostgreSQL 17',
  'Drizzle ORM',
  'Payload CMS 3',
  'Tailwind 4 + shadcn/ui',
  'Anthropic Claude / OpenAI',
  'Docker + systemd',
]

export default async function ServicosPage() {
  const settings = await getSiteSettings()

  return (
    <div className="bg-white">
      <header className="relative overflow-hidden bg-bitflix-cream-light">
        <DotGrid />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-bitflix-700 text-xs uppercase tracking-wide">
            Projetos sob demanda
          </p>
          <h1 className="mt-3 max-w-3xl font-semibold text-bitflix-900 text-4xl tracking-tight sm:text-5xl">
            Construímos software com IA para o cliente final do seu negócio.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bitflix-text/80">
            Foco em médias e grandes empresas. Quando IA precisa chegar embarcada no produto que você
            entrega, não como produtividade interna do dev.
          </p>
          <div className="mt-8">
            <WhatsAppButton settings={settings} source="from_custom_cta" label="Solicitar orçamento" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">Tipos de projeto</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PROJECT_TYPES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <Icon className="size-6 shrink-0 text-bitflix-500" />
              <div>
                <h3 className="font-semibold text-bitflix-900 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-bitflix-text/75 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-bitflix-cream-light">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">Como trabalhamos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="font-mono text-bitflix-500 text-sm">{s.n}</p>
                <h3 className="mt-2 font-semibold text-bitflix-900 text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-bitflix-text/75 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-semibold text-bitflix-900 text-3xl tracking-tight">Stack atual</h2>
        <p className="mt-3 max-w-2xl text-bitflix-text/75">
          Decisões pragmáticas e validadas. Cada item ajusta-se ao projeto, mas o eixo é estável.
        </p>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {STACK.map((s) => (
            <li
              key={s}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-mono text-bitflix-text/80 text-sm"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-bitflix-cream-light">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-semibold text-bitflix-900 text-2xl tracking-tight">
            Conta o problema. Devolvemos um caminho.
          </h2>
          <p className="mt-3 text-bitflix-text/80">
            Sem briefing longo. Conversa de 30 minutos no WhatsApp resolve a maior parte.
          </p>
          <div className="mt-6 flex justify-center">
            <WhatsAppButton settings={settings} source="from_custom_cta" />
          </div>
        </div>
      </section>
    </div>
  )
}
