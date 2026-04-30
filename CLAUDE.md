# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**MVP staging done.** Fases 1-5 concluídas em 2026-04-29. Pós-MVP em 2026-04-30: split `NEXT_PUBLIC_SITE_URL`/`PAYLOAD_PUBLIC_SERVER_URL`, code blocks terminal-style com botão Copiar no blog, e todas as 5 páginas estáticas (home/produtos/servicos/sobre/contato) editáveis via Payload admin sob grupo "Pages". Site rodando em `https://staging.bitflix.com.br` + `https://staging.cms.bitflix.com.br/admin`. Próximo passo: refinar copy via admin + Lighthouse + decidir cutover DNS apex. Deploy produção em plano separado (`.omc/plans/prod-deploy.md`), roda só após sinal explícito.

Antes de qualquer trabalho:

1. Leia `~/.engineering-standards/STANDARDS.md` (universal Bitflix).
2. Leia `docs/CONVENTIONS.md` (overrides do projeto + folder structure + checklist de review).
3. Leia `docs/PROJECT_SPEC.md` (produto, marca, editorial, schema Article).
4. Leia `docs/INFRA.md` (servidor, deploy, ambientes, secrets).
5. Leia `.omc/plans/mvp.md` (plano MVP staging — Fases 1-5; contrato).
6. Leia `.omc/plans/prod-deploy.md` (plano deploy prod — só relevante quando for deployar).
7. Leia `.omc/progress/mvp.md` (estado atual de execução, decisões e bloqueios).

Sessão nova começa fria mas com tudo persistido. Identifique próximo passo `not-started`/`in-progress` no progress file e siga.

Esses arquivos são o contrato. Não duplicar conteúdo aqui.

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
- **Conteúdo editorial das 5 páginas estáticas vem de Globals**, não hardcode. Cada page (`src/app/(site)/*/page.tsx`) lê de seu Global correspondente (`HomePage`, `ProdutosPage`, `ServicosPage`, `SobrePage`, `ContatoPage`) via service `pages.service.ts` + VMs em `src/dto/pages.ts`. Ícones Lucide usados em conteúdo dinâmico (pillars, project_types) são resolvidos via `src/lib/icon-map.ts` (enum string `Cpu`/`Layers`/etc → componente). Adicionar nova página: criar Global, registrar em `payload.config.ts`, criar VM+service, ler em page.tsx.
- **Dois URLs distintos**: `PAYLOAD_PUBLIC_SERVER_URL` = host do CMS (CSRF/cors/admin URL Payload). `NEXT_PUBLIC_SITE_URL` = host do site público (usado por `sitemap.xml`, `robots.txt`, `feed.xml`, `metadataBase` Open Graph). Em prod são subdomínios diferentes. Lidos em runtime pelos endpoints/layout — após editar `.env`, sempre `docker compose up -d --force-recreate bitflix-lp-app`.
- **Code blocks no blog renderizam terminal-style com botão Copiar** via override de JSXConverter (`src/components/lexical/render-lexical.tsx`) mapeando node `code` Lexical → `CodeBlockTerminal` client component (`src/components/blog/code-block-terminal.tsx`). Extractor handling tanto `linebreak` nodes quanto `\n` em text node (Lexical aceita ambas formas).

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
- **CRÍTICO `pnpm build` polui `.next/` do dev server.** Rodar `pnpm build` dentro do container compose dev contamina volume `.next` com chunks de prod build. Próximo request retorna 500 com `Cannot find module './vendor-chunks/<lib>.js'`. Fix: `docker compose exec bitflix-lp-app sh -c 'rm -rf .next/*'` + `docker compose restart bitflix-lp-app` + warm-up curl. Pra sanity-check de build em sessão dev, rodar em container/branch dedicada — NÃO no compose dev.
- **Globals "Pages" agrupados em sidebar admin via `admin.group: 'Pages'`** nas 5 globals page-content. SiteSettings + Navigation ficam standalone (sem group). Pra adicionar global novo no grupo: setar `admin.group: 'Pages'` no GlobalConfig.

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

## Estado atual do MVP (snapshot 2026-04-30)

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

**Fase 3 — Public frontend: ✓ done**
- 10 rotas públicas + 4 internas (admin/api) — `pnpm build` OK 14/14 pages
- shadcn/ui (preset Nova) inicializado: button + card + badge + separator + sheet
- Componentes layout: `site-header.tsx` (sticky, sheet mobile), `site-footer.tsx`
- ViewModels (`src/dto/`): `article.ts`, `product.ts`, `author.ts`, `site.ts` — UI consome só VMs
- Services (`src/services/`): `articles`, `products`, `authors`, `categories`, `site` — wrappers Payload Local API
- Páginas: home (hero+pillars+vitrine+blog+CTA), `/produtos`, `/servicos`, `/sobre`, `/contato`, `/blog` (listing+filtros+paginação), `/blog/[slug]` (Lexical render+source+disclaimer+slides link), `/blog/[slug]/slides` (reveal.js v5 client wrapper)
- OG dinâmico `/og/[slug]` via `next/og` ImageResponse Node runtime, gradient teal + dot grid + Geist
- RSS `/blog/feed.xml` (últimos 30, escape XML, cache 1h)
- `sitemap.ts` + `robots.ts` (Next metadata helpers)
- Umami component (só prod E websiteId definido)
- WhatsApp button compartilhado (`buildWhatsAppUrl` helper)
- Checklist project-specific review zero violações

**Fase 4 — Translation workflow: ✓ done**
- Endpoints `/api/blog-import` (POST cria draft) e `/api/blog-publish` (POST promove draft → published + revalidatePath blog/feed/sitemap), auth `Authorization: Bearer $BLOG_IMPORT_TOKEN` (constant-time + fingerprint salvo no log)
- Camadas estritas: route → Facade (parseOrThrow + AppError) → Coordinator UC → UCs granulares → Repositories Payload-based
- Rate limit 10/min/IP in-memory na rota import
- Repos: articles, authors, categories, tags, article-imports-log (Payload v3 Local API; sem Drizzle direto)
- UCs granulares thin: ensure-category, ensure-tag, create-article, create-import-log, publish-article. Coordinator `create-article-from-import` orquestra (sem tx no MVP — ver Decisões)
- Container Awilix CLASSIC: repos singleton, UCs/Facades transient
- Validators Zod centralizados em `src/lib/validators/{parseOrThrow,blog-import}.ts`
- Skills locais `~/.claude/skills/blog-import/SKILL.md` (orquestra fetch/extract/LLM/lexical/POST) e `~/.claude/skills/blog-publish/SKILL.md` (POST publish + relata revalidate)
- Smoke test 100% passou: 201 create, 200 publish, 403 auth, 400 zod, 404 not-found, 409 conflict, 429 rate-limit

**Fase 5 — Deploy staging parrilla: ✓ done** (2026-04-29, reboot test deferred)
- DNS Cloudflare: A records `staging.bitflix.com.br` + `staging.cms.bitflix.com.br` → `45.182.133.84` (DNS only).
- nginx vhosts em `infra/staging/*.conf` instalados em `/etc/nginx/sites-{available,enabled}/`.
- TLS via `certbot --nginx --redirect`: cert único cobre os 2 nomes, expira 2026-07-28, renovação automática (`certbot.timer`).
- systemd unit `bitflix-lp-staging.service` enabled (autostart compose ao boot).
- Smoke test 4/4 OK: `staging.bitflix.com.br` → 200 site público, `staging.cms.bitflix.com.br/admin` → 200 admin, `/admin` no público → 404 middleware, `/blog` no cms → 404 middleware.
- Acceptance único pendente: reboot test compose autostart (deferred — design idempotente, valida natural em próxima reboot).
- URLs ativas: https://staging.bitflix.com.br + https://staging.cms.bitflix.com.br/admin.
- **Quirk dev mode:** primeira request após boot pode retornar 500 transient (`__webpack_modules__[moduleId] is not a function` em chunks `@payloadcms/ui`/`richtext-lexical`). Próxima mesma request → 200. Detalhe em `.omc/progress/mvp.md` Bloqueios. Em prod (`prod-deploy.md`, `next start` build) não acontece — só dev mode.
- **CRÍTICO `.env` reload:** após editar `.env`, NUNCA usar `docker compose restart` — env vars ficam stale. Sempre `docker compose up -d --force-recreate bitflix-lp-app`. Confirmar com `docker compose exec -T bitflix-lp-app printenv PAYLOAD_PUBLIC_SERVER_URL`. Bug raiz que causou 403 em todos os saves do admin (CSRF rejeita Origin diferente do serverURL stale). Detalhes em progress.
- **Layout root canônico Payload v3 + Next 15:** NÃO ter `src/app/layout.tsx`. Cada route group `(site)`/`(payload)` é seu próprio root layout (emite html+body). `error.tsx`/`not-found.tsx` ficam dentro do route group correto; `global-error.tsx` fica em `src/app/` (Next exige). Bitflix LP fez essa migração em 2026-04-29 após bug de dois `<html>` aninhados.
- **Users `useSessions: false`:** sessions feature do Payload v3 exige sid em JWT validar contra `users_sessions` table. Mantido desabilitado pra simplicidade. Tabela `users_sessions` removida do DB.

**Pós-MVP — 2026-04-30:**
- `e371a84` feat blog code block terminal-style + split SITE_URL from CMS_URL — componente `CodeBlockTerminal` (header mac + Copiar/Copiado), JSXConverter override pra node `code` Lexical, `NEXT_PUBLIC_SITE_URL` separado de `PAYLOAD_PUBLIC_SERVER_URL` em sitemap/robots/feed/metadataBase.
- `3faf350` feat CMS make all 5 site pages editable via Payload admin — 5 Globals novos (HomePage, ProdutosPage, ServicosPage, SobrePage, ContatoPage) sob grupo "Pages", VMs em `src/dto/pages.ts`, service `pages.service.ts`, icon mapper `src/lib/icon-map.ts`, seed idempotente populando defaults.

**Commits relevantes em `main`:**
- `0708cb5` initial doc snapshot
- `33cccf5` Fase 1 bootstrap (53 files)
- `5cb3f52` importMap sync
- `8a277a9` progress update Fase 1 done
- `35690bd` Fase 2 modeling (21 files)
- `736ab56` Fase 3 public frontend (54 files, +7206 −468)
- `bbd082f` Fase 4 translation workflow
- `b9710b8` Fase 5 deploy staging parrilla completo
- `13ea1fe` fix staging admin save 403 + layout restructure + env reload
- `e371a84` pós-MVP blog code-block-terminal + split URLs
- `3faf350` pós-MVP 5 Globals "Pages"

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

Estes ficam como **placeholders editáveis no admin Payload** (Globals) até receber valores reais:

- Número WhatsApp + mensagens default por CTA → `/admin/globals/site-settings`
- Manifesto Bitflix (parágrafo completo) → `/admin/globals/site-settings`
- Estratégia de migração da LP atual em `bitflix.com.br` → `/admin/globals/site-settings` (campo notas)
- Decisão sobre e-mail institucional → `/admin/globals/site-settings`
- Umami website ID (criar em `stats.bitflix.com.br/dashboard`) → `/admin/globals/site-settings`
- Refinamento de copy editorial (h1, pillars, CTAs) das 5 páginas → `/admin/globals/{home-page,produtos-page,servicos-page,sobre-page,contato-page}` (já populadas com conteúdo atual via seed; editar pra refinar)
- Bio Milton Bastos → ✓ atualizada via admin em 2026-04-30
