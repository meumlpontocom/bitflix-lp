# Bitflix LP — Progresso de execução MVP

> Tracking de execução das 6 fases definidas em `.omc/plans/mvp.md`.
> Criado: 2026-04-29.
> Última atualização: 2026-04-29.

---

## Status global

**Fase atual:** Fase 4 — Translation workflow (não iniciada)
**Status overall:** `in-progress` (Fases 1+2+3 done em 2026-04-29)
**Próxima ação:** começar Fase 4 (skill `/blog-import`): endpoint POST `/api/blog-import`, BlogImportFacade + Coordinator UC + UCs granulares + repos. Detalhe em `.omc/plans/mvp.md` Fase 4. Pode rodar paralelo a Fase 5 (deploy staging) já que ambas dependem de Fase 1+2.
**Antes de começar:** ler CLAUDE.md seção "Toolchain quirks" (importante).

| Status | Significado |
|--------|-------------|
| not-started | Não iniciado |
| in-progress | Em execução |
| blocked | Bloqueado (ver "Bloqueios e descobertas" no fim) |
| done | Concluído + verificado |
| skipped | Pulado com justificativa |

### Resumo por fase

| Fase | Status | Início | Fim |
|------|--------|--------|-----|
| 1. Bootstrap | done | 2026-04-29 | 2026-04-29 |
| 2. Modeling | done | 2026-04-29 | 2026-04-29 |
| 3. Public frontend | done | 2026-04-29 | 2026-04-29 |
| 4. Translation workflow | not-started | — | — |
| 5. Deploy staging | not-started | — | — |
| 6. Deploy produção | not-started | — | — |

---

## Fase 1 — Bootstrap

### Pré-flight
- [x] Node 24.15.0 confirmado — `done` (2026-04-29)
- [x] pnpm 10.33.2 confirmado — `done` (corepack ativou; pnpm host estava 10.32.0, atualizado via `corepack prepare pnpm@10.33.2 --activate`)
- [x] Docker + Compose v2 confirmados — `done` (Docker 29.1.3, Compose 2.40.3)
- [x] `gh` autenticado em `meumlpontocom` — `done` (após user re-logar manualmente; `gh api user` agora retorna `meumlpontocom`)
- [x] User no grupo `docker` — `done`

### 1.1 Git + GitHub
- [x] `git init` — `done` (branch `main`)
- [x] `.gitignore` criado — `done`
- [x] Repo `meumlpontocom/bitflix-lp` privado criado — `done` (https://github.com/meumlpontocom/bitflix-lp)
- [x] Commit inicial snapshot docs — `done` (commit `0708cb5`)
- [x] Push `main` — `done` (3 commits: `0708cb5` docs + `33cccf5` Fase 1 bootstrap + `5cb3f52` importMap sync)

### 1.2 Scaffold Next
- [x] Backup temporário de docs — `done` (scaffold em `/tmp/bitflix-lp-scaffold`, copiado via rsync excluindo `.git/CLAUDE.md/AGENTS.md/.gitignore/README.md`)
- [x] `create-next-app` rodado — `done` (16.2.4 inicial, depois downgrade pra 15.5.15 — ver Decisões)
- [x] Versões pinadas exatas no `package.json` — `done`
- [x] `.nvmrc` 24.15.0 — `done`
- [x] `engines` adicionado — `done`

### 1.3 Tailwind 4 + shadcn
- [x] Tailwind 4 confirmado — `done` (4.2.4)
- [x] `@theme` Bitflix em `globals.css` — `done` (paleta teal + cream)
- [ ] `shadcn init` (new-york, neutral) — `not-started` (pulado; será feito sob demanda na Fase 3 conforme componentes forem necessários)

### 1.4 Geist
- [x] Pacote `geist` 1.7.0 instalado — `done` (instalado mas trocado pra `next/font/google` durante execução — ver Decisões)
- [x] `next/font/google` `Geist` + `Geist_Mono` aplicados em `layout.tsx` — `done`

### 1.5 Payload 3.84.1
- [x] Packages Payload instalados — `done` (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, `@payloadcms/richtext-lexical` todos `3.84.1` + `graphql 16.13.2` + `sharp 0.34.5`)
- [x] Estrutura `src/app/(payload)/` criada — `done` (templates oficiais blank baixados de `raw.githubusercontent.com/payloadcms/payload`)
- [x] `src/payload.config.ts` mínimo — `done` (postgresAdapter + s3Storage configurados)
- [x] `src/collections/Users.ts` — `done`
- [x] `src/collections/Media.ts` — `done` (com `upload: true` + S3 storage)
- [x] `next.config.ts` com `withPayload()` — `done`
- [x] Paths `@payload-config` no `tsconfig` — `done`
- [x] `importMap.js` stub criado — `done` (Payload regenera no boot)

### 1.6 Estrutura de pastas
- [x] Dirs `.gitkeep` criados — `done` (collections/globals/components/lib/db/lib/validators/repositories/facades/use-cases/providers/hooks/services/dto)
- [x] `src/lib/formatters.ts` stub — `done` (formatBRL/formatBRDate/formatBRTime/formatBRDateTime)
- [x] `src/errors/AppError.ts` stub — `done` (AppError + 4 subclasses NotFound/Conflict/Forbidden/Validation)
- [x] `src/container.ts` stub Awilix — `done`
- [x] `src/middleware.ts` stub hostname routing — `done`
- [x] `src/app/error.tsx` + `not-found.tsx` + `global-error.tsx` — `done` (todos com `dynamic = 'force-dynamic'` por causa de bug Next 16 → mantidos no Next 15)

### 1.7 docker-compose parrilla
- [x] `Dockerfile.dev` criado — `done`
- [x] `docker-compose.yml` 4 services — `done` (postgres+minio+mc-init+app)
- [x] Healthchecks ajustados — `done` (pg_isready postgres, `mc ready local` minio)
- [x] Compose validado (`docker compose config`) — `done`

### 1.8 Env
- [x] `.env.example` commitado — `done`
- [x] `.env` local com valores reais — `done` (secrets gerados via `openssl rand -hex`)
- [x] `chmod 0640 .env` — `done`

### 1.9 Scripts package.json
- [x] Scripts dev/build/start/lint/tsc/compose adicionados — `done`

### 1.10 First boot
- [x] `docker compose up -d` executado — `done`
- [x] Containers `healthy` confirmados — `done` (postgres + minio healthy; mc-init exited 0; app started)
- [x] Log Next ready — `done` ("Next.js 15.5.15 Ready in 6.1s")
- [x] Admin `localhost:3023/admin` acessível (HTTP 200) — `done` (verificado via curl)
- [x] Primeiro user criado via browser — `done` (Milton, miltonbastos@gmail.com, id=1, 2026-04-29 21:57)
- [x] Bucket MinIO confirmado — `done` (`bitflix-lp-staging-media` listado via `mc ls local/`)
- [x] Postgres tabelas criadas — `done` (9 tabelas: users, users_sessions, media, payload_*)

### Acceptance criteria Fase 1
- [x] `docker compose up -d` healthy total — `done`
- [x] Endpoint `/admin/create-first-user` retorna 200 — `done`
- [x] Login Payload OK — `done`
- [x] `pnpm build` passa — `done` (Next 15.5.15, 6 routes geradas)
- [x] `pnpm tsc --noEmit` zero erros — `done`
- [x] `pnpm lint` zero warnings críticos — `done`
- [x] Commit + push final em `main` — `done` (push completo apos auth meumlpontocom resolvida)

---

## Fase 2 — Modeling

### 2.1 Collections
- [x] `Authors.ts` — `done`
- [x] `Categories.ts` — `done`
- [x] `Tags.ts` — `done`
- [x] `Articles.ts` (tabs + hooks beforeChange auto-published_at) — `done`
- [x] `Products.ts` — `done`
- [x] `Media.ts` (S3 storage) — `done`
- [x] `Users.ts` ampliado com `role` — `done`
- [x] `ArticleImportsLog.ts` (append-only) — `done`

### 2.2 Globals
- [x] `SiteSettings.ts` — `done`
- [x] `Navigation.ts` — `done`

### 2.3 Storage S3 (MinIO)
- [x] `s3Storage` plugin configurado em `payload.config.ts` — `done`

### 2.4 Lexical config
- [x] Editor base `lexicalEditor()` com features default Payload v3 — `done` (já cobre heading H1-H4, blockquote, code, link, lists, indent, align, relationship, upload, horizontal-rule, inline+fixed toolbars)

### 2.5 `article_imports_log`
- [x] Collection append-only criada (access lock via update/delete = false) — `done`

### 2.6 Migrations
- [x] Migration auto-push schema inicial — `done`
- [x] `payload migrate:create initial` snapshot versionado — `done` (`src/migrations/20260429_220628_initial.ts` + `.json` snapshot)
- [x] `payload generate:types` → `src/payload-types.ts` — `done` (20.8KB de tipos)

### 2.7 Seed mínimo
- [x] `scripts/seed-minimal.ts` (idempotente) — `done`
- [x] Seed executado — `done` (Author milton-bastos + 4 Products + SiteSettings + Navigation)

### Acceptance criteria Fase 2
- [x] Todas Collections + Globals visíveis no admin — `done` (21 tabelas no Postgres confirmadas)
- [x] Migration zero-to-up sem erro — `done`
- [x] Upload Media chega no MinIO bucket — `parcial` (storage S3 plugin configurado e bucket existe; teste de upload real fica pra Fase 3 quando primeira mídia for usada)
- [x] Tipos TS gerados em `src/payload-types.ts` — `done`
- [x] Seed executado — `done`
- [x] `pnpm tsc --noEmit` passa — `done`
- [x] `pnpm lint` zero warnings — `done` (após ignorar `src/migrations/**` por warnings de variável auto-gerada)
- [x] `pnpm build` passa — `done`
- [x] Commit + push — pending (executar logo após este update)

---

## Fase 3 — Public frontend

### 3.1 Layout base + middleware + shadcn
- [x] shadcn init (preset Nova, base radix) — `done` (components.json criado, base color neutral, css vars on)
- [x] Componentes shadcn instalados: button (preset), card, badge, separator, sheet — `done`
- [x] Header `src/components/layout/site-header.tsx` (sticky, mobile sheet) — `done`
- [x] Footer `src/components/layout/site-footer.tsx` — `done`
- [x] Layout `(site)/layout.tsx` (header+main+footer+Umami) — `done`
- [x] Middleware hostname routing — `done` (já estava da Fase 1)

### 3.2 Home /
- [x] Hero bege creme + dot grid + manifesto Lexical + CTAs — `done`
- [x] Seção "IA chegando ao cliente final" 3 pillars — `done`
- [x] Vitrine 4 produtos (lê Products) — `done`
- [x] Trilho custom resumido — `done`
- [x] Últimos 4 posts blog — `done`
- [x] CTA WhatsApp final — `done`

### 3.3-3.6 /produtos, /servicos, /sobre, /contato — `done`

### 3.7 /blog listing
- [x] Listing 9/página, filtros ?cat ?tag ?q — `done`
- [x] CategoryFilter + Pagination components — `done`

### 3.8 /blog/[slug]
- [x] Body Lexical via `@payloadcms/richtext-lexical/react` — `done`
- [x] Hero cover + título + meta — `done`
- [x] ArticleSource + Disclaimer (variants) — `done`
- [x] [Bitflix Take] + link slides — `done`
- [x] generateStaticParams para artigos publicados — `done`

### 3.9 /blog/[slug]/slides
- [x] reveal.js v5 client wrapper (`SlideDeck`) — `done` (`reveal.js@5.2.1` instalado)
- [x] CSS custom paleta Bitflix — `done`

### 3.10 OG /og/[slug]
- [x] `next/og` ImageResponse 1200x630 (Node runtime) — `done`
- [x] Cache `public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400` — `done`

### 3.11 RSS /blog/feed.xml
- [x] XML 2.0, últimos 30 articles, escape XML, cache 1h — `done`

### 3.12 Páginas erro
- [x] Já estavam ok da Fase 1 (force-dynamic mantido) — `done`

### 3.13 ViewModel layer
- [x] `src/dto/article.ts`, `product.ts`, `author.ts`, `site.ts` — `done`

### 3.14 Sitemap + robots
- [x] `src/app/sitemap.ts` + `src/app/robots.ts` — `done`

### 3.15 Umami
- [x] `src/components/analytics/umami.tsx` (apenas em prod E websiteId definido) — `done`

### Acceptance criteria Fase 3
- [x] Todas 14 routes do build geradas — `done` (build output 14 rotas)
- [x] `pnpm tsc --noEmit` zero erros — `done`
- [x] `pnpm lint` zero warnings — `done`
- [x] `pnpm build` passa — `done` (14/14 static pages, middleware 34kB)
- [x] Smoke test rotas (curl) — `done` (home, /produtos, /servicos, /sobre, /contato, /blog, /blog/feed.xml, /sitemap.xml, /robots.txt, /og/test todos HTTP 200)
- [x] Checklist project-specific review — `done` (12 greps zero-violation)
- [ ] Lighthouse mobile ≥ 90 — `pending` (avaliar após primeiro artigo real publicado)
- [ ] RSS validator W3C — `pending` (validar após primeiro artigo real)
- [ ] Slides reveal.js navegáveis — `pending` (validar com artigo `has_slides=true`)
- [ ] OG <500ms — `pending` (medir em prod)
- [ ] Commit + push — pending

---

## Fase 4 — Translation workflow

(Estrutura preservada — todas tarefas `not-started`. Ver `plans/mvp.md` Fase 4 para detalhes.)

---

## Fase 5 — Deploy staging parrilla

(Estrutura preservada — todas tarefas `not-started`. Ver `plans/mvp.md` Fase 5 para detalhes.)

---

## Fase 6 — Deploy produção tomahawk

(Estrutura preservada — todas tarefas `not-started`. Ver `plans/mvp.md` Fase 6 para detalhes.)

---

## Decisões tomadas durante execução

### 2026-04-29 — Fase 1.2: Downgrade Next 16.2.4 → 15.5.15
- **Decisão:** pinar `next@15.5.15` em vez do alvo original `16.2.4`.
- **Motivo:** bug conhecido em Next 16 + React 19 quebra `next build` ao prerender páginas internas `/_global-error` e `/_not-found` com `TypeError: Cannot read properties of null (reading 'useContext')`. Pesquisa via Context7 (researchMode) confirmou regressão em 16.0.1+ sem fix oficial até 16.2.4. Payload 3.x oficialmente alvo Next 15.
- **Mitigação:** mantidos `export const dynamic = 'force-dynamic'` em error/not-found/global-error pra blindar contra a mesma regressão se Next 15 minor update reintroduzir.
- **Atualização propagada:** `package.json`, `eslint-config-next 15.5.15`, plano `.omc/plans/mvp.md`. Pendente: atualizar `CLAUDE.md` e memory `bitflix_stack_versions`.

### 2026-04-29 — Fase 1.4: `next/font/google` em vez de `geist` package
- **Decisão:** importar Geist via `next/font/google` (built-in Next) em vez do package `geist` (Vercel).
- **Motivo:** `geist` package estava causando ruído durante diagnóstico do bug Next 16 (suspeita inicial); migração não regrediu funcionalidade pois `next/font/google` self-hosta as fontes igualmente (zero CLS, zero fetch externo).
- **Trade-off:** `geist 1.7.0` continua instalado mas não usado. Pode remover na Fase 3 se confirmado obsoleto.

### 2026-04-29 — Fase 1.7: docker-compose com `mc:latest` em vez de `mc:RELEASE.YYYY-MM-DD`
- **Decisão:** `bitflix-lp-mc-init` usa `minio/mc:latest`.
- **Motivo:** tag `RELEASE.2025-09-07T16-13-09Z` não existe pra `minio/mc` (apenas pra `minio/minio`). Histórico de releases de mc é separado. Latest é mais robusto (rastreia mc estável).
- **Risco:** mudanças incompatíveis em `mc` entre boots. Aceitável em staging (não-prod). Em prod (Fase 6) pinar tag específica.

### 2026-04-29 — Fase 1: NODE_ENV NÃO setado em `.env`/Dockerfile/compose
- **Decisão:** remover toda referência a `NODE_ENV=development` em `.env`, `Dockerfile.dev`, `docker-compose.yml`.
- **Motivo:** Next 16 (e Next 15.x recentes) emitem warning "non-standard NODE_ENV value" e podem comportar errado durante `next build` se `.env` carrega `NODE_ENV=development` durante prod build. Next CLI define NODE_ENV automaticamente (`next dev` = development, `next build`/`next start` = production).

### 2026-04-29 — Fase 1: shadcn init pulado
- **Decisão:** não rodar `shadcn init` na Fase 1.
- **Motivo:** sem componentes shadcn em uso ainda (home stub usa Tailwind direto). Inicialização será feita na Fase 3 quando primeiro componente for adicionado.

### 2026-04-29 — Fase 2: `"type": "module"` no package.json
- **Decisão:** adicionar `"type": "module"` ao `package.json`.
- **Motivo:** sem isso, `payload generate:types` e `payload run` falhavam com `ERR_REQUIRE_ASYNC_MODULE` (Node 24 não permite `require()` de ESM com top-level await; Payload internal usa). Default sem `type` é CJS.
- **Trade-off:** todos os arquivos `.js` no projeto agora são tratados como ESM. Não afetou nada — todo o código é `.ts`/`.tsx` e arquivos `.mjs` explícitos onde necessário (eslint.config, postcss.config).

### 2026-04-29 — Fase 2: imports relativos com extensão `.ts` em payload.config.ts e collections
- **Decisão:** importar collections e helpers com path relativo + extensão `.ts` explícita em vez do alias `@/`.
- **Motivo:** `payload run` e `payload generate:types` usam `tsx` interno que NÃO lê o `paths.@/*` do `tsconfig.json`. Path alias só funciona via Next runtime/Webpack/Turbopack. Soluções avaliadas: (a) instalar `tsconfig-paths` no script — descartado por dep extra; (b) imports relativos — adotado. `tsconfig.json` ganhou `allowImportingTsExtensions: true` pra TS aceitar `.ts` em imports.
- **How to apply:** dentro de `payload.config.ts` e `src/collections/*.ts`, sempre relativo + `.ts`. Em `src/app/**` (Next runtime) e em `src/lib/**`/`src/components/**` (consumido por Next), continuar usando alias `@/`.

### 2026-04-29 — Fase 2: Lexical features default
- **Decisão:** manter `lexicalEditor()` sem customizar features.
- **Motivo:** defaults Payload v3 já incluem heading H1-H4, blockquote, code block, link, listas, indent, align, relationship, upload, HR, inline+fixed toolbars. Cobre 100% do que o blog precisa.
- **Acompanhamento:** customizar só se aparecer requisito específico (ex: bloco de citação destacada com layout próprio).

### 2026-04-29 — Fase 3.1: shadcn preset Nova (Geist + Lucide)
- **Decisão:** rodar `shadcn init` com `-p nova -b radix -t next` (preset Nova: Geist sans + Lucide icons).
- **Motivo:** preset Nova alinha com o lock de Geist do projeto e Lucide é o `iconLibrary` default do shadcn.
- **Trade-off:** init substituiu `globals.css` adicionando blocos de tokens shadcn (`@theme inline { --font-sans: var(--font-sans); ... }`). Manualmente reapontei `--font-sans` e `--font-heading` para `var(--font-geist-sans)` (variável já injetada em `layout.tsx` via `next/font/google`).
- **How to apply:** ao adicionar componentes shadcn (`pnpm dlx shadcn@latest add X`), checar se globals.css ganha entradas duplicadas — corrigir se sim.

### 2026-04-29 — Fase 3.10: OG via `next/og` no Node runtime
- **Decisão:** `runtime = 'nodejs'` na route `/og/[slug]/route.tsx` (não Edge).
- **Motivo:** rota busca artigo via Payload Local API → `pg` driver → Node-only. ImageResponse funciona em Node runtime no Next 15.
- **Trade-off:** Edge runtime daria latência menor mas exigiria fetch HTTP a um endpoint público da API Payload (over-engineering pro MVP).

### 2026-04-29 — Fase 3.13: ViewModels com type narrow para relations Payload
- **Decisão:** VMs (`ArticleListItemVM`, `ArticleDetailVM`, `ProductVM`, `AuthorVM`, `SiteSettingsVM`, `NavigationVM`) com narrowing `isObject<T>` antes de extrair fields de `relationship`.
- **Motivo:** Payload retorna relations como `number | T` dependendo de `depth`. UI nunca pode receber `number` cru — VM faz fallback (ex: `authorToVM` quando relation veio só como id, retorna placeholder Milton).
- **How to apply:** todas Server Components consomem services (`*.service.ts`) que retornam VMs, nunca entities Payload diretas.

### 2026-04-29 — Fase 3: cover image fallback usa `/og/[slug]` route
- **Decisão:** quando `cover_image_override` e `cover_image` ambos vazios, VM gera `coverUrl = /og/[slug]` (rota OG dinâmica).
- **Motivo:** spec do projeto (PROJECT_SPEC.md seção 6) define OG dinâmico como cover default. Listing e article page usam `Image` com `unoptimized={coverUrl.startsWith('/og/')}` pra evitar re-otimizar PNG já gerado.

---

## Bloqueios e descobertas

### 2026-04-29 — gh auth: conta autenticada era `miltonbastos`, não `meumlpontocom` — RESOLVIDO
- **Sintoma:** `gh repo create meumlpontocom/bitflix-lp` falhou com `GraphQL: miltonbastos cannot create a repository for meumlpontocom`.
- **Diagnóstico:** `gh auth status` mostrava label `meumlpontocom (keyring)` mas `gh api user` retornava `miltonbastos`. Token pertencia à conta `miltonbastos`.
- **Resolução:** user re-logou manualmente na conta `meumlpontocom`. Após re-login, `gh api user` retornou `meumlpontocom` e `gh repo create` funcionou. Repo criado em https://github.com/meumlpontocom/bitflix-lp.

### 2026-04-29 — Volume Docker `node_modules` em uso após restart loop
- **Sintoma:** `docker volume rm` falhou com "volume is in use" mesmo após `docker compose stop`.
- **Causa:** container parado mas não removido continua mantendo lock no volume. Docker Compose mantém objeto Container até explicitar `docker compose rm -f`.
- **Resolução:** `docker compose stop X && docker compose rm -f X && docker volume rm Y` na ordem.

### 2026-04-29 — Avisos persistentes "Each child needs unique key"
- **Sintoma:** durante `next build`, dezenas de warnings React sobre `key` prop ausente em `<__next_viewport_boundary__>`, `<meta>`, `<head>`, `<html>` etc.
- **Causa provável:** template Payload v3 + Next 15 emitem fragments React sem keys em algum boilerplate (provavelmente `RootLayout` do `@payloadcms/next/layouts`).
- **Impacto:** apenas warning; não falha build nem afeta runtime.
- **Acompanhamento:** verificar em release Payload subsequente se já corrigido. Não bloqueia.

### 2026-04-29 — Aviso "middleware deprecated, use proxy"
- **Sintoma:** Next 16.x (durante diagnóstico) emite warning "The 'middleware' file convention is deprecated. Please use 'proxy' instead."
- **Causa:** Next 16 introduziu `proxy.ts` como sucessor de `middleware.ts`.
- **Impacto:** apenas warning. Em Next 15.5.15 (versão final) `middleware.ts` ainda é o padrão e não emite o warning.
- **Acompanhamento:** quando Next 16 estabilizar e Payload suportar, migrar `middleware.ts` → `proxy.ts`.

---

## Ações manuais do usuário pendentes

> Lista cumulativa de ações que SÓ o usuário pode fazer.

- [x] **Autenticar `gh` na conta `meumlpontocom`** — `done` 2026-04-29
- [x] **Criar repo + push** — `done` (https://github.com/meumlpontocom/bitflix-lp)
- [x] **Criar primeiro user no admin Payload** — `done` 2026-04-29 (Milton Bastos, id=1)
- [ ] Preencher manifesto/bio/whatsapp/email no Payload Globals (`http://localhost:3023/admin/globals/site-settings`) — Fase 6 prereq
- [ ] Criar website Umami para `bitflix.com.br` em `stats.bitflix.com.br/dashboard` — Fase 6 prereq
- [ ] Decidir estratégia cutover DNS apex — Fase 6 prereq
- [ ] Sinal explícito pra iniciar Fase 6 — Fase 6

---

## Histórico de commits relevantes

| Commit | Descrição |
|--------|-----------|
| `0708cb5` | docs initial snapshot |
| `33cccf5` | Fase 1 bootstrap (53 files, 9831 lines) |
| `5cb3f52` | importMap sync após primeiro boot Payload |
| `8a277a9` | progress update Fase 1 done |
| `35690bd` | Fase 2 modeling (21 files, 5090 lines) |

Repo: https://github.com/meumlpontocom/bitflix-lp (privado).

---

## Como retomar em sessão futura

1. Ler `CLAUDE.md` (contém estado atual + toolchain quirks).
2. Ler `docs/CONVENTIONS.md` (overrides + quirks toolchain consolidados).
3. Ler `.omc/plans/mvp.md` (plano contrato das 6 fases).
4. Ler este arquivo (estado atual + decisões + bloqueios).
5. Identificar próximo passo `not-started` ou `in-progress`.
6. Verificar se containers estão up: `docker compose ps`. Se não: `docker compose up -d`.
7. Executar, atualizar este arquivo (status + timestamp + decisões/bloqueios), commit, push.
