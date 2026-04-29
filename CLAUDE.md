# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Em execução do MVP.** Fases 1 (bootstrap) e 2 (modeling) concluídas em 2026-04-29. Próxima fase: Fase 3 (public frontend).

Antes de qualquer trabalho:

1. Leia `~/.engineering-standards/STANDARDS.md` (universal Bitflix).
2. Leia `docs/CONVENTIONS.md` (overrides do projeto + folder structure + checklist de review).
3. Leia `docs/PROJECT_SPEC.md` (produto, marca, editorial, schema Article).
4. Leia `docs/INFRA.md` (servidor, deploy, ambientes, secrets).
5. Leia `.omc/plans/mvp.md` (plano completo das 6 fases — contrato).
6. Leia `.omc/progress/mvp.md` (estado atual de execução, decisões e bloqueios).

Sessão nova começa fria mas com tudo persistido. Identifique próximo passo `not-started`/`in-progress` no progress file e siga.

Esses 4 arquivos são o contrato. Não duplicar conteúdo aqui.

## Identidade

**Bitflix** = dev house brasileira que **constrói software para entregar IA ao cliente final** (não "IA pra dev interno"). Site `bitflix.com.br` vende dois trilhos: SaaS próprios + projetos custom. Blog `bitflix.com.br/blog` é instrumento de autoridade.

Detalhe completo em `docs/PROJECT_SPEC.md` seção 1.

## Stack (resumo)

| Camada | Tecnologia (lock 2026-04-29) |
|--------|------------------------------|
| Framework | Next.js 15.5.15 (App Router) + React 19.2.5 — alvo original era 16.2.4 mas regressão Next 16 + React 19 quebra prerender de páginas internas (ver `.omc/progress/mvp.md` → Decisões 2026-04-29) |
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

## Toolchain quirks aprendidos durante execução

Estes pontos saíram da execução real e são CRÍTICOS pra próxima sessão não tropeçar:

- **`"type": "module"`** está ativo no `package.json`. Necessário pra `payload generate:types` e `payload run` funcionarem (Node 24 + ESM strict). NÃO remover.
- **`payload.config.ts` e `src/collections/*.ts` usam imports relativos com extensão `.ts` explícita**, NÃO o alias `@/`. O CLI Payload usa `tsx` interno que não lê `paths` do `tsconfig.json`. `tsconfig.json` tem `allowImportingTsExtensions: true` pra TS aceitar.
- **Alias `@/` continua válido em**: `src/app/**` (Next runtime), `src/lib/**`, `src/components/**`, `src/hooks/**`, `src/services/**`, `src/dto/**`, qualquer coisa consumida via Next/Webpack/Turbopack. Só evitar em arquivos consumidos pelo `payload` CLI.
- **Migrations auto-push em dev**. Payload v3 + Postgres com `push: true` (default em dev) sincroniza schema sem precisar `migrate`. Comando `payload migrate:create` gera apenas snapshots versionados (úteis pra prod). Em prod, vai precisar trocar pra `push: false` e rodar migrations manualmente.
- **Seed**: `pnpm seed` (executa `scripts/seed-minimal.ts` via `payload run`). Idempotente — checa `find` antes de `create`. Re-rodar é seguro.
- **`error.tsx`, `not-found.tsx`, `global-error.tsx`** todos têm `export const dynamic = 'force-dynamic'`. Mantém blindagem caso Next 15 minor reintroduza a regressão de prerender que fez Next 16 ser inviável. NÃO remover sem testar build.
- **Next 15.5.15 é o lock atual**. Next 16 quebra (ver Decisões em `.omc/progress/mvp.md`). Subir pra 16.x só quando 16.3+ confirmar fix oficial.
- **Geist via `next/font/google`** (não pelo package `geist`). Package `geist 1.7.0` está instalado mas não usado — pode remover na Fase 3 se confirmar obsoleto.
- **`importMap.js` em `src/app/(payload)/admin/`** é gerado por Payload. Commitar a versão regenerada quando rodar `pnpm dev` ou `payload generate:importmap` (Payload pode regenerar e deixar diff sujo se ignorar).
- **TypeScript 5.9.3 fixo**. NÃO subir pra 6.x ainda — ecossistema Payload/Drizzle/plugins não validados.

## Comandos comuns

```bash
# Dev server (Postgres + MinIO + app Next dev em compose)
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

# Test (vitest, quando configurado — Fase 3+)
pnpm test
pnpm test path/to/file.test.ts            # arquivo único
pnpm test -- --run -t "nome do teste"     # filtro por nome

# Payload (sempre rodar dentro do container ou via host com .env carregado)
docker compose exec bitflix-lp-app pnpm payload migrate              # aplica pendentes
docker compose exec bitflix-lp-app pnpm payload migrate:create       # cria snapshot
docker compose exec bitflix-lp-app pnpm payload:types                # regenera src/payload-types.ts
docker compose exec bitflix-lp-app pnpm seed                         # roda seed idempotente

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

## Estado atual do MVP (snapshot 2026-04-29)

**Fase 1 — Bootstrap: ✓ done**
- Repo `meumlpontocom/bitflix-lp` criado, branch `main`
- Stack instalada e travada: Next 15.5.15, React 19.2.5, TS 5.9.3, Payload 3.84.1, Postgres 17, MinIO, Tailwind 4.2.4
- Docker compose 4 services rodando (postgres, minio, mc-init, app dev)
- Admin Payload acessível em `localhost:3023/admin`, primeiro user (Milton, id=1) criado
- Bucket MinIO `bitflix-lp-staging-media` provisionado
- `pnpm build`/`tsc`/`lint` zero erros

**Fase 2 — Modeling: ✓ done**
- 8 Collections: Users, Authors, Articles, Categories, Tags, Products, Media, ArticleImportsLog (append-only)
- 2 Globals: SiteSettings (manifesto, whatsapp, umami, migration_strategy), Navigation (main_menu, footer_links)
- 21 tabelas no Postgres (auto-push em dev)
- `src/payload-types.ts` gerado (20.8 KB)
- Migration snapshot `src/migrations/20260429_220628_initial.{ts,json}`
- Seed idempotente em `scripts/seed-minimal.ts` (`pnpm seed`): Author Milton + 4 Products (meuml/postflix/marketflix/kronikor) + Globals com placeholders

**Fase 3 — Public frontend: pendente** (próxima fase). Ver `.omc/plans/mvp.md` Fase 3 pra escopo (10 rotas, OG dinâmico, RSS, ViewModel layer, sitemap, Umami).

**Commits relevantes em `main`:**
- `0708cb5` initial doc snapshot
- `33cccf5` Fase 1 bootstrap (53 files)
- `5cb3f52` importMap sync
- `8a277a9` progress update Fase 1 done
- `35690bd` Fase 2 modeling (21 files)

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
