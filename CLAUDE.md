# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Greenfield**. Repo contém apenas documentação por ora. Nenhuma linha de código foi escrita. Toda a stack, decisões de produto, identidade, infra e convenções já estão fechadas e documentadas em `docs/`.

Antes de qualquer trabalho:

1. Leia `~/.engineering-standards/STANDARDS.md` (universal Bitflix).
2. Leia `docs/CONVENTIONS.md` (overrides do projeto + folder structure + checklist de review).
3. Leia `docs/PROJECT_SPEC.md` (produto, marca, editorial, schema Article).
4. Leia `docs/INFRA.md` (servidor, deploy, ambientes, secrets).

Esses 4 arquivos são o contrato. Não duplicar conteúdo aqui.

## Identidade

**Bitflix** = dev house brasileira que **constrói software para entregar IA ao cliente final** (não "IA pra dev interno"). Site `bitflix.com.br` vende dois trilhos: SaaS próprios + projetos custom. Blog `bitflix.com.br/blog` é instrumento de autoridade.

Detalhe completo em `docs/PROJECT_SPEC.md` seção 1.

## Stack (resumo)

| Camada | Tecnologia (lock 2026-04-29) |
|--------|------------------------------|
| Framework | Next.js 16.2.4 (App Router) + React 19.2.5 |
| Linguagem | TypeScript 5.9.3 (NÃO 6.x ainda) |
| CMS | Payload 3.84.1 |
| DB | PostgreSQL 17.5 |
| ORM | Drizzle 0.45.2 |
| Validação | Zod 4.3.6 |
| DI | Awilix CLASSIC |
| UI | Tailwind 4.2.4 + shadcn/ui (new-york) |
| Fonts | Geist Sans + Geist Mono via `next/font` |
| Forms | react-hook-form + zodResolver |
| Data fetching | TanStack Query (client) + Payload Local API (server) |
| Storage | MinIO via `@payloadcms/storage-s3` |
| Slides | reveal.js v5 |
| OG images | `@vercel/og` |
| Analytics | Umami self-hosted (`stats.bitflix.com.br`) |
| Runtime | Node 24.15.0 LTS, pnpm 10.33.2 |

Lista completa de packages e versões em `docs/CONVENTIONS.md` seção "Stack".

## Arquitetura (big picture)

A camada de aplicação custom (endpoints próprios fora do Payload) segue arquitetura em camadas estrita:

```
Route handler (thin, ~15 linhas)
  └─ valida com parseOrThrow + chama 1 Facade
        └─ Facade (orquestra fluxo, NÃO recebe db, NÃO abre tx, lança AppError)
              └─ Coordinator Use Case (recebe db, ABRE a transação, orquestra UCs granulares)
                    └─ Granular Use Cases (thin bridge, sem regra de negócio, accept tx?)
                          └─ Repository (única camada que importa drizzle-orm, accept tx?)
                                └─ Provider (integrações externas, opcional)
```

Pontos cruciais (vão pegar agente novo de surpresa):

- **Coordinator UC abre transação**, não a Facade. Padrão atualizado 2026-04-10. Legacy pode usar Facade-opens-tx; código novo NÃO.
- **Use Cases granulares NÃO têm regra de negócio**. São thin bridges. Negócio mora na Facade.
- **AppError diferencia por mensagem**, nunca por classe. `throw new ConflictError("SKU ja cadastrado")`, NUNCA `throw new SkuAlreadyExistsError()`.
- **Drizzle só em `src/repositories/` ou `src/lib/db/`**. Drizzle import em route/facade/use-case = quebra de regra.
- **ViewModel obrigatório no frontend**. UI nunca renderiza Article (entity Payload) direto — sempre via `ArticleViewModel`. Justificativa: schemas Payload têm campos administrativos (`_status`, `versions`) que não fazem sentido na UI.
- **Server Components por default**. `'use client'` só quando precisa hooks/state/listeners.
- **`<Link prefetch={false}>` por default**. App Router faz prefetch automático ao entrar no viewport — sidebar com 20 links = 20 RSC requests por render. Override só em link primário acima da fold com clique alta probabilidade.
- **Multi-tenancy NÃO se aplica**. Override explícito do STANDARDS — Bitflix LP é single-tenant. Nada de `organizationId`.
- **Zustand NÃO usado no MVP**. Override explícito — site público read-only, admin é Payload puro.
- **Rota custom mais importante**: `/api/blog-import` (POST) recebe URL ou texto PT-BR + token, cria Article+Slides em `status: 'draft'` no Payload. Workflow completo em `docs/PROJECT_SPEC.md` seção 7.
- **Roteamento por hostname** via `src/middleware.ts`: `cms.bitflix.com.br` permite só `/admin/*` e `/api/payload/*`; `bitflix.com.br` bloqueia esses paths e serve só site público. Mesmo container serve ambos.

Folder structure completa em `docs/CONVENTIONS.md` seção "Folder Structure".

## Comandos comuns (futuro)

Como o projeto é greenfield, esta seção descreve o que estará disponível após Fase 1 (bootstrap):

```bash
# Dev server (single docker-compose com Postgres + MinIO + app Next dev)
docker compose up -d
docker compose logs -f bitflix-lp-app

# Acesso staging local
# Site público:    http://localhost:3023
# Admin Payload:   http://localhost:3023/admin

# Build e start standalone (prod-like)
pnpm install
pnpm build
pnpm start

# Type-check sem emit
pnpm tsc --noEmit

# Lint
pnpm lint

# Test (vitest, quando configurado)
pnpm test
pnpm test path/to/file.test.ts            # arquivo único
pnpm test -- --run -t "nome do teste"     # filtro por nome

# Payload migrations
pnpm payload migrate              # rodar pendentes
pnpm payload migrate:create       # criar nova
pnpm payload generate:types       # regenerar tipos a partir das Collections

# Drizzle studio (debug DB direto)
pnpm drizzle-kit studio

# Checklist de review automatizado (greps de docs/CONVENTIONS.md seção "Project-Specific Review Checklist")
# Rodar após qualquer refactor/feature
```

Lista de env vars obrigatórias em `docs/CONVENTIONS.md` seção "Operational Configuration".

## Ambientes

| Ambiente | Host | Stack |
|----------|------|-------|
| **Dev/Staging** | `parrilla` (máquina local user, IP fixo `45.182.133.84`) | Single docker-compose: Postgres + MinIO + app dev. nginx local + certbot. |
| **Produção** | `tomahawk` (servidor Bitflix dedicado, Ubuntu 24.04) | App via systemd em `/application/bitflix-lp/`, user `meuml`, porta `3060`. Postgres + MinIO em VM externa (`192.168.14.20`). |

Subdomínios: prod = `bitflix.com.br` + `cms.bitflix.com.br`. Staging = mesmos com prefixo `staging.`. DNS via Cloudflare (apenas A records).

Detalhes em `docs/INFRA.md`.

## Idioma e estilo de comunicação

- Sempre responder em **Português Brasil** (alinhado a `~/.claude/CLAUDE.md` global).
- Mensagens curtas. Sem floreio.
- Formatação BR para todos os dados monetários (`R$ 1.230,50`), datas (`DD/MM/YYYY`), horários (`HH:MM`). Helper centralizado em `src/lib/formatters.ts`.

## Decisões já fechadas (não revisitar sem motivo)

Todas estas decisões saíram de uma sessão de grilling profundo (`/grill-me`). Estão consolidadas nos 3 arquivos `docs/`:

- Light mode primário (sem dark mode); fundos branco + bege creme; accent teal da logo.
- Tipografia: Geist Sans + Geist Mono.
- Cover images: composição tipográfica server-side via `@vercel/og` (não AI por default).
- Editorial: adaptação editorial (não tradução fiel), autoria Milton Bastos, fonte sempre citada com link, disclaimer IA explícito, taxonomia dinâmica (sem categorias seed), sem cadência fixa.
- Slides: reveal.js v5, mesmo container do site, navegável + export PDF.
- Repo: `meumlpontocom/bitflix-lp` privado, branch `main`.
- Secrets: `.env` simples (sem Doppler/Infisical no MVP).

Preview tipográfico ainda no repo: `typography-preview.html` (mostrava 5 opções comparadas; vencedora foi B = Geist).

## Inputs do usuário ainda pendentes

Estes ficam como **placeholders editáveis no admin Payload** (Globals) até receber valores reais. Listados em `docs/PROJECT_SPEC.md` seção 10:

- Número WhatsApp + mensagens default por CTA
- Bio Milton Bastos
- Manifesto Bitflix (parágrafo completo)
- Estratégia de migração da LP atual em `bitflix.com.br`
- Decisão sobre e-mail institucional
- Umami website ID (criar em `stats.bitflix.com.br/dashboard`)
