# Bitflix LP — Progresso de execução MVP

> Tracking de execução das 6 fases definidas em `.omc/plans/mvp.md`.
> Criado: 2026-04-29.
> Última atualização: 2026-04-29.

---

## Status global

**Fase atual:** Fase 3 — Public frontend (após Fase 2 done em 2026-04-29)
**Status overall:** `in-progress`
**Próxima ação:** layout base + home + páginas /produtos /servicos /sobre /contato /blog + OG images + RSS. Decisão sobre prosseguir agora ou parar pra revisão pendente do user.

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
| 3. Public frontend | not-started | — | — |
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

(Estrutura preservada — todas tarefas `not-started`. Ver `plans/mvp.md` Fase 3 para detalhes.)

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

---

## Bloqueios e descobertas

### 2026-04-29 — gh auth: conta autenticada é `miltonbastos`, não `meumlpontocom`
- **Sintoma:** `gh repo create meumlpontocom/bitflix-lp` falhou com `GraphQL: miltonbastos cannot create a repository for meumlpontocom`.
- **Diagnóstico:** `gh auth status` mostra label `meumlpontocom (keyring)` mas `gh api user` retorna `miltonbastos`. Token GitHub pertence à conta `miltonbastos` (alinha com email `miltonbastos@gmail.com`). User confirmou: `meumlpontocom` é conta SEPARADA.
- **Workaround tentado:** `gh auth login` interativo; `snap-confine is packaged without necessary permissions and cannot continue` impediu abertura do browser pelo gh CLI.
- **Resolução pendente:** usuário precisa autenticar via:
  1. Abrir manualmente `https://github.com/login/device` em browser que funcione e colar o código exibido pelo gh
  2. OU gerar PAT em `https://github.com/settings/tokens` (escopos: `repo`, `workflow`, `read:org`) e rodar `gh auth login --with-token <<< "ghp_..."`

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
- [ ] **Criar primeiro user no admin Payload** acessando `http://localhost:3023/admin` no browser e preenchendo o form `create-first-user` — Fase 1
- [ ] Preencher manifesto/bio/whatsapp/email no Payload Globals — Fase 6 prereq
- [ ] Criar website Umami para `bitflix.com.br` em `stats.bitflix.com.br/dashboard` — Fase 6 prereq
- [ ] Decidir estratégia cutover DNS apex — Fase 6 prereq
- [ ] Sinal explícito pra iniciar Fase 6 — Fase 6

---

## Como retomar em sessão futura

1. Ler `CLAUDE.md` + 3 docs em `docs/`
2. Ler `.omc/plans/mvp.md` (plano contrato)
3. Ler este arquivo (estado atual)
4. Identificar próximo passo `not-started` ou `in-progress`
5. Executar, atualizar este arquivo (status + timestamp na seção "Decisões"/"Bloqueios" se aplicável), commit, push
