# bitflix-lp — Conventions and Local Standards

> Living document. Last updated: 2026-04-29 (após Fase 4).
> Base engineering standards: `~/.engineering-standards/STANDARDS.md`.
> Este arquivo cobre apenas o que é específico ao projeto.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5.15 (App Router) + React 19.2.5 — alvo original 16.2.4, downgrade 2026-04-29 (regressão Next 16 + React 19 quebra prerender; ver `.omc/progress/mvp.md` Decisões) |
| Runtime | Node 24.15.0 LTS |
| Database | PostgreSQL 17.5 (em VM externa `192.168.14.20`) |
| ORM | Drizzle 0.45.2 (Payload usa internamente também) |
| CMS | Payload 3.84.1 (instalado em `/app`) |
| Auth (admin) | Payload Users Collection (built-in) |
| Auth (público) | NÃO se aplica — site público read-only |
| Storage | MinIO (S3-compat) via `@payloadcms/storage-s3` |
| Cache | NÃO usar Redis no MVP |
| Queue | NÃO se aplica no MVP |
| DI Container | Awilix 12.0.5 (CLASSIC mode) — `src/container.ts` |
| UI | shadcn/ui preset Nova (Geist + Lucide) + Tailwind 4.2.4. Componentes instalados: `button`, `card`, `badge`, `separator`, `sheet`. |
| Data Fetching (server) | Payload Local API (`src/lib/payload.ts` singleton) |
| Data Fetching (client) | TanStack Query — **não instalado no MVP** (site público é Server Components-only). Adicionar quando aparecer feature client com refetch. |
| Forms | react-hook-form + `@hookform/resolvers/zod` — **não instalado no MVP** (sem forms client). Adicionar com primeira feature de form. |
| Validation | Zod 4.3.6 (schemas em `src/lib/validators/`) |
| Toasts | sonner — **não instalado no MVP** |
| State client | UI state local (`useState`). Sem Zustand no MVP. |
| Slides | reveal.js 5.2.1 + `@types/reveal.js` 5.2.1 |
| OG images | `@vercel/og` 0.6.5 (também usável via `next/og` que reexporta) |
| Analytics | Umami self-hosted (`stats.bitflix.com.br`), site_id via Global `SiteSettings.umami_website_id` |

---

## Toolchain quirks (aprendidos durante execução, 2026-04-29)

Cada item afeta como/onde escrever código no projeto. Não revisitar sem ler `.omc/progress/mvp.md` Decisões.

- **`"type": "module"`** ativo no `package.json`. Necessário pra `payload generate:types` e `payload run` em Node 24 (ESM strict, sem `require()` de ESM com top-level await).
- **Em `src/payload.config.ts` e `src/collections/*.ts`: imports relativos com extensão `.ts` explícita**. `tsx` interno do Payload CLI não lê `tsconfig.json paths`. Exemplo:
  ```ts
  // bom (em payload.config.ts/collections):
  import { Articles } from './collections/Articles.ts'
  import { slugify } from '../lib/slugify.ts'
  // ruim:
  import { Articles } from '@/collections/Articles'   // CLI quebra
  ```
- **Em `src/app/**`, `src/lib/**`, `src/components/**`, `src/hooks/**`, `src/services/**`, `src/dto/**`: alias `@/` continua válido**. Esses arquivos rodam via Next runtime (Webpack/Turbopack) que resolve `paths`.
- **`tsconfig.json` tem `allowImportingTsExtensions: true`** pra TS aceitar os imports `.ts` explícitos sem reclamar.
- **Migrations auto-push em dev**. Payload v3 + Postgres com `push: true` (default) sincroniza schema toda vez que `payload.config.ts` muda. Em prod (Fase 6), trocar pra `push: false` e rodar migrations versionadas.
- **Páginas `error.tsx`, `not-found.tsx`, `global-error.tsx`** todas têm `export const dynamic = 'force-dynamic'`. Mantém blindagem se Next 15 reintroduzir a regressão de prerender que fez Next 16 ser inviável (`useContext null` em `_global-error`/`_not-found`). Não remover sem testar build.
- **Geist via `next/font/google`** (não pelo package `geist`). Package `geist 1.7.0` instalado mas não em uso — pode remover quando confirmar.
- **`importMap.js` em `src/app/(payload)/admin/`** é regenerado por Payload em dev/build. Sempre committar a versão final pra evitar diff sujo. Lint já ignora.
- **shadcn preset `nova`** (Geist + Lucide) inicializado em `components.json`. Add components com `pnpm dlx shadcn@latest add <nome>` dentro do container. shadcn pode injetar entradas duplicadas em `globals.css` (ex: `--font-sans: var(--font-sans)`); reapontar manualmente pra `var(--font-geist-sans)`.
- **Site público em `src/app/(site)/`** (não `(public)/`). Layout `(site)/layout.tsx` busca `Navigation` + `SiteSettings` via Payload Local API e injeta em header/footer/Umami.
- **VMs obrigatórios** em `src/dto/{article,product,author,site}.ts`. Server Components consomem só VMs. Services em `src/services/*.service.ts` retornam VMs (`toArticleVM`, `toProductVM`, etc), nunca entities Payload diretas.
- **Cover image fallback**: `coverUrl = /og/[slug]` quando `cover_image_override` e `cover_image` ambos vazios. Componentes `Image` usam `unoptimized={url.startsWith('/og/')}` pra não re-otimizar PNG já gerado pelo `next/og`.
- **Repositories Payload-based** (Fase 4): `src/repositories/*.repository.ts` consomem `Payload Local API` (`payload.find/create/update`). Sem Drizzle direto no MVP. Quando precisar Drizzle (agregação, query custom), criar arquivo em `src/repositories/` ou `src/lib/db/` — checklist 1 garante.
- **Awilix CLASSIC params individuais**: construtores recebem cada dep como param nomeado (`private readonly articlesRepository: ArticlesRepository`), não objeto `Deps`. Coordinator UC com 6 deps tem 6 params.

---

## Domain Entities

- `Article`: post do blog (importado/adaptado de EN ou compilado de texto PT-BR). Tem corpo Lexical, slides opcionais, source de origem citada, disclaimer IA.
- `Slides`: array de blocks dentro do Article (`slides_blocks`). Renderizado via reveal.js em `/blog/[slug]/slides`.
- `Category`: taxonomia de blog. Criada dinamicamente pela skill `/blog-import` quando necessário.
- `Tag`: taxonomia secundária (5-10 por artigo, livre).
- `Author`: autor do post. MVP: único = `milton-bastos`.
- `Product`: SaaS Bitflix exibido no site (vitrine). 4 inicial (meuml, postflix, marketflix, kronikor).
- `User` (Payload built-in): admin do CMS.
- `Media` (Payload built-in): uploads de imagem (cover override, logos de produtos, screenshots).

Globals:
- `SiteSettings`: hero default, manifesto, WhatsApp number, bio Milton.
- `Navigation`: header + footer links.

---

## Database Schema

- **Schema name:** `public` (default Payload). Sem multi-tenancy → sem schema dedicado.
- **Append-only tables:** `article_imports_log` (auditoria de imports — quando, source_url, agent, status). NUNCA UPDATE/DELETE nessa tabela.
- **Critical constraints:** `articles.slug` UNIQUE; `articles.status IN ('draft', 'review', 'published')` via CHECK; `categories.slug` UNIQUE; `products.slug` UNIQUE.
- **Soft-delete policy:** Articles têm `is_active: boolean`. Outras Collections do MVP usam delete real (volume baixo, baixo risco). Reavaliar quando blog crescer.
- **IDs**: UUID v7 (helper centralizado em `src/lib/utils/uuid.ts`).
- **Timestamps**: TIMESTAMPTZ sempre. Campos padrão `created_at`, `updated_at`. `published_at` em Article (nullable até publicar).

---

## Folder Structure

Reflete realidade pós Fases 3+4 (2026-04-29). Atualizar quando criar nova subarea.

```
src/
  app/
    (site)/                                  # site público (Server Components por default)
      layout.tsx                             # header + main + footer + Umami
      page.tsx                               # home
      produtos/page.tsx
      servicos/page.tsx
      sobre/page.tsx
      contato/page.tsx
      blog/
        page.tsx                             # listing + filtros + paginação
        [slug]/page.tsx                      # article detail (Lexical render + source + disclaimer)
        [slug]/slides/page.tsx               # reveal.js client wrapper
        [slug]/slides/slides.css
    (payload)/                               # admin Payload (auto-gerado)
      admin/[[...segments]]/page.tsx
      admin/importMap.js
      api/[...slug]/route.ts
      api/graphql/route.ts
      api/graphql-playground/route.ts
    api/
      blog-import/route.ts                   # POST cria Article draft (auth Bearer)
      blog-publish/route.ts                  # POST promove draft → published + revalidatePath
    blog/feed.xml/route.ts                   # RSS feed
    og/[slug]/route.tsx                      # OG image dinâmica (next/og, runtime nodejs)
    sitemap.ts                               # Next sitemap helper
    robots.ts                                # Next robots helper
    layout.tsx                               # root: html + body + fontes Geist
    error.tsx / not-found.tsx / global-error.tsx
    globals.css                              # Tailwind 4 + tokens shadcn + paleta Bitflix
  middleware.ts                              # roteamento por hostname (cms.* vs site público)
  collections/                               # Payload Collections (imports relativos com .ts)
    Users.ts Authors.ts Articles.ts Categories.ts Tags.ts Products.ts Media.ts ArticleImportsLog.ts
  globals/
    SiteSettings.ts
    Navigation.ts
  facades/
    blog/
      blog-import.facade.ts                  # cria Article draft (parseOrThrow + AppError)
      publish-article.facade.ts              # promove draft → published + revalidatePath
  use-cases/
    blog/
      ensure-category.use-case.ts
      ensure-tag.use-case.ts
      create-article.use-case.ts
      create-import-log.use-case.ts
      publish-article.use-case.ts
      create-article-from-import.coordinator.use-case.ts   # orquestra ensure+create+log
  repositories/                              # Payload Local API based (sem Drizzle direto no MVP)
    articles.repository.ts
    authors.repository.ts
    categories.repository.ts
    tags.repository.ts
    article-imports-log.repository.ts
  services/                                  # wrappers Payload p/ Server Components do site
    articles.service.ts
    authors.service.ts
    categories.service.ts
    products.service.ts
    site.service.ts
  components/
    ui/                                      # shadcn (button, card, badge, separator, sheet)
    layout/
      site-header.tsx                        # sticky + sheet mobile
      site-footer.tsx
    blog/
      article-card.tsx
      article-meta.tsx
      article-source.tsx
      disclaimer.tsx
      category-filter.tsx
      pagination.tsx
      slide-deck.tsx                         # client component reveal.js wrapper
    products/
      product-card.tsx
    cta/
      whatsapp-button.tsx
    decor/
      dot-grid.tsx
    lexical/
      render-lexical.tsx                     # @payloadcms/richtext-lexical/react wrapper
    analytics/
      umami.tsx
  dto/                                       # ViewModels (UI nunca consome Article entity Payload)
    article.ts product.ts author.ts site.ts
  lib/
    payload.ts                               # getPayload singleton helper
    formatters.ts                            # BR (R$, datas, horários)
    slugify.ts
    utils.ts                                 # cn() (tailwind-merge + clsx)
    whatsapp.ts                              # buildWhatsAppUrl helper
    auth/
      blog-import-token.ts                   # verify Bearer + constant-time + fingerprint
    constants/
      routes.ts
      query-keys.ts
    validators/                              # Zod schemas centralizados
      parseOrThrow.ts
      blog-import.ts
    db/                                      # (vazio MVP — Drizzle direto não usado ainda)
  errors/
    AppError.ts                              # AppError + NotFound/Conflict/Forbidden/Validation
  hooks/                                     # (vazio MVP — TanStack Query hooks futuros)
  providers/                                 # (vazio MVP — LLM/extractor providers futuros)
  container.ts                               # Awilix CLASSIC
  middleware.ts
  payload.config.ts
  payload-types.ts                           # auto-gerado por payload generate:types
  migrations/                                # snapshots versionados (auto-push em dev)
docs/
  CONVENTIONS.md PROJECT_SPEC.md INFRA.md
.omc/
  plans/mvp.md                               # contrato das 6 fases
  progress/mvp.md                            # estado de execução + decisões + bloqueios
scripts/
  seed-minimal.ts                            # `pnpm seed`
```

---

## Routes Map

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Home institucional + vitrine produtos + últimos posts | público |
| `/produtos` | Cards dos SaaS Bitflix (CTA externo pra cada domínio próprio) | público |
| `/servicos` | Trilho de projetos custom (mid/large) | público |
| `/sobre` | Manifesto + bio Milton | público |
| `/contato` | CTA WhatsApp (sem form) | público |
| `/blog` | Listing + filtros (categoria, tag) | público |
| `/blog/[slug]` | Artigo individual + bottom de fonte + disclaimer IA | público |
| `/blog/[slug]/slides` | Versão slides do artigo (reveal.js) | público |
| `/blog/feed.xml` | RSS feed (últimos 30 posts) | público |
| `/og/[slug]` | OG image dinâmica (1200x630, Geist + paleta) | público (Next route handler) |
| `/admin/*` | Painel Payload | autenticado (Users) |
| `/api/payload/*` | API Payload built-in | autenticado |
| `/api/blog-import` | Endpoint custom para skill `/blog-import` criar Article em `draft` | token via header `Authorization: Bearer $BLOG_IMPORT_TOKEN` |
| `/api/blog-publish` | Endpoint custom para skill `/blog-publish` promover `draft → published` + revalidar paths | token via header `Authorization: Bearer $BLOG_IMPORT_TOKEN` |

**Regra**: roteamento por hostname via `middleware.ts`:
- `staging.bitflix.com.br` / `bitflix.com.br` → site público; bloqueia `/admin/*` e `/api/payload/*` (rewrite 404).
- `staging.cms.bitflix.com.br` / `cms.bitflix.com.br` → permite só `/admin/*` e `/api/payload/*`; redireciona `/` para `/admin`.

---

## Multi-Tenancy

- **Model**: NÃO se aplica. Bitflix LP é single-tenant.
- **Override**: STANDARDS seção 11 e checklist `organizationId` (item da seção 13) NÃO são checados aqui.

---

## Project-Specific Overrides

Tudo que diverge do STANDARDS.md:

- **Multi-tenancy**: ausente — site institucional single-tenant.
- **Zustand store**: NÃO usar no MVP. Site público sem auth, admin é Payload puro. Reavaliar se aparecer feature client com state cross-component.
- **Monorepo `@<project>/shared`**: ausente — Zod schemas vivem em `src/lib/validators/` e são consumidos por server e client dentro do mesmo Next app.
- **TanStack Query keys**: centralizadas em `src/lib/constants/query-keys.ts` (já que não há monorepo shared).
- **NestJS Controllers**: substituídos por **Next API route handlers** em `src/app/api/<resource>/route.ts`. Permanece o princípio: route fina, valida com `parseOrThrow`, chama 1 facade.
- **`@Inject(DATABASE)`**: substituído por injection key Awilix (`db`, `payload`).
- **Apresentação de Articles**: ViewModel obrigatório (`ArticleViewModel`), nunca renderizar `Article` (Payload entity) direto em components. Justificativa: schema Payload tem campos administrativos (`_status`, `versions`) que não fazem sentido na UI.
- **Coordinator UC abre transação**: já é o padrão atual STANDARDS (2026-04-10), reforçado aqui — facades NUNCA recebem `db`. **MVP exception**: Fase 4 não usa `payload.db.beginTransaction` — operações `ensureCategory` → `ensureTag` → `createArticle` → `createImportLog` rodam sequencialmente, atômicas per-call. Risco aceito (artigo órfão se import-log falhar). Migrar pra tx Payload v3 quando volume justificar.
- **Auth no admin**: Payload Users Collection. Sem Auth.js/NextAuth.
- **Auth nos endpoints custom (`/api/blog-import`, `/api/blog-publish`)**: header `Authorization: Bearer $BLOG_IMPORT_TOKEN`. Comparison constant-time (`src/lib/auth/blog-import-token.ts`). Fingerprint (8 primeiros chars) salvo em `article_imports_log.triggered_by`.
- **Repositories Payload-based**: Fase 4 usa `payload.find/create/update` direto via `Payload Local API`. Drizzle direto fica reservado pra queries que escapam do shape Payload (ex: agregações, joins customizados) e devem viver em `src/repositories/` ou `src/lib/db/` (regra do checklist mantida).

---

## Operational Configuration

### Portas (dev/staging em parrilla)
- App Next + Payload: `3023` (host bind), interno ao container.
- Postgres staging: interno ao docker network `bitflix-lp-net`, sem expose ao host (parrilla já tem outros postgres rodando).
- MinIO staging: interno ao network. Console exposto via nginx em `staging.minio.bitflix.com.br`.

### Portas (prod em tomahawk)
- App: `3060` (próxima livre depois de `3052`).
- Postgres + MinIO em VM externa (192.168.14.20): portas standard 5432, 9000.

### Required env vars (`.env.example` deve listar todas)
- `NODE_ENV`
- `DATABASE_URI` — Postgres connection string
- `PAYLOAD_SECRET` — chave HMAC interna Payload
- `PAYLOAD_PUBLIC_SERVER_URL` — URL pública do site/admin
- `S3_ENDPOINT` — MinIO endpoint
- `S3_ACCESS_KEY` / `S3_SECRET_KEY` — MinIO credentials (escopo só ao bucket)
- `S3_BUCKET` — `bitflix-lp-media` (prod) ou `bitflix-lp-staging-media` (staging)
- `S3_REGION` — `us-east-1` (default MinIO)
- `BLOG_IMPORT_TOKEN` — token estático que `/api/blog-import` e `/api/blog-publish` validam via header `Authorization: Bearer <token>` (constant-time comparison; primeiros 8 chars salvos como fingerprint em `article_imports_log.triggered_by`)
- `UMAMI_WEBSITE_ID` — só em prod (não tracking em staging). Lido via Global `SiteSettings.umami_website_id` em runtime, não env var.
- `UMAMI_SCRIPT_URL` — `https://stats.bitflix.com.br/script.js` (default; pode ser sobrescrito por env)
- `LLM_API_KEY` — Anthropic key para skill de adaptação (opcional). MVP atual: skill local roda no agente Claude Code (não consome env do server). Provider `anthropic-llm.provider.ts` futuro.

### Cache TTLs
- RSS feed (`/blog/feed.xml`): 1h (header `Cache-Control: public, max-age=3600, s-maxage=3600` + Next `revalidate=3600`)
- Article listing (`/blog`): 5min (`revalidate = 300`)
- Article individual (`/blog/[slug]`): ISR on-demand. `/api/blog-publish` chama `revalidatePath('/blog')`, `/blog/[slug]`, `/blog/feed.xml`, `/sitemap.xml`. `revalidate = 300` como fallback.
- OG image (`/og/[slug]`): `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400` + Next `revalidate = 3600`. Runtime `nodejs` (precisa Payload Local API).

### Rate limits
- `/api/blog-import`: 10/min por IP. In-memory `Map<ip, {count, resetAt}>` no módulo (`src/app/api/blog-import/route.ts`). Single-instance OK; multi-instance prod precisa migrar pra Redis ou nginx limit_req.
- `/api/blog-publish`: sem rate limit explícito (volume baixo — uma chamada por publicação). Auth Bearer já gate.

---

## External Integrations

- **Anthropic LLM** (futuro): `src/providers/anthropic-llm.provider.ts` implementa `LlmProvider` interface. Usado pela skill `/blog-import` para adaptar conteúdo.
- **Readability/Mozilla Readability** (futuro): extrair texto limpo de URLs no provider `readability-extractor.provider.ts`.
- **MinIO/S3**: `@payloadcms/storage-s3` adapter no `payload.config.ts`.
- **Umami**: script tag injetado em `app/layout.tsx` somente quando `NODE_ENV === 'production'` E `UMAMI_WEBSITE_ID` definido.

---

## Known Technical Debt

| Area | Violation | Plan |
|------|-----------|------|
| Fase 4 transações | Coordinator UC `CreateArticleFromImportCoordinatorUseCase` não abre `payload.db.beginTransaction`. Operações sequenciais atômicas per-call. Risco: artigo órfão sem `article_imports_log` se segundo passo falhar. | Migrar pra padrão Payload v3 (`req.transactionID` propagation) quando volume justificar. |
| Fase 4 rate limit | `/api/blog-import` rate limit em memória de processo (`Map<ip, {count, resetAt}>`). Multi-instance contorna. | Em prod multi-instance: nginx `limit_req` ou Redis. Single-instance tomahawk OK no MVP. |
| Fase 1 dep órfã | Package `geist@1.7.0` instalado mas não em uso (substituído por `next/font/google`). | Remover quando confirmar zero referências. |
| Fase 3 lighthouse | Score Lighthouse mobile não medido. | Validar quando primeiro artigo real for publicado. |
| Fase 4 LLM provider | Skill local roda LLM no agente Claude Code. Sem provider server-side. | Implementar `src/providers/anthropic-llm.provider.ts` se /api/blog-import precisar virar self-service (público com token). |

---

## Project-Specific Review Checklist

```bash
# 1. Drizzle só em repositories ou lib/db
grep -r 'from "drizzle-orm"' src/ | grep -v 'src/repositories\|src/lib/db'
# Expected: ZERO

# 2. parseOrThrow só em facades (não em use-cases nem repositories)
grep -rn "parseOrThrow" src/use-cases src/repositories
# Expected: ZERO

# 3. Use cases sem db.transaction (só coordinator UCs abrem)
grep -rn "db.transaction\|payload.db.transactions" src/use-cases | grep -v "coordinator"
# Expected: ZERO

# 4. Facades sem db nem transaction
grep -rn "private db\|this.db\|db.transaction" src/facades
# Expected: ZERO

# 5. ViewModel obrigatório nas pages
grep -rn "ArticleDto\|ProductDto" src/app
# Expected: ZERO direto em pages/components — sempre via VM

# 6. Sem fetch inline em useEffect
grep -rn "useEffect.*fetch" src/app src/components
# Expected: ZERO

# 7. <Link> sem prefetch={false} explícito
grep -rEn '<Link[^>]*href=' src/ | grep -v 'prefetch='
# Expected: ZERO (ou justificar UX-crítico inline)

# 8. organizationId NÃO deve aparecer (single-tenant)
grep -rn 'organizationId\|organization_id' src/
# Expected: ZERO

# 9. Sem store Zustand (override MVP)
grep -rn 'zustand' src/
# Expected: ZERO no MVP

# 10. Schemas Zod centralizados
grep -rn 'z.object\|z.string\|z.number' src/ | grep -v 'src/lib/validators'
# Expected: ZERO (todos em src/lib/validators)

# 11. Formatadores BR centralizados
grep -rn 'toLocaleString\|new Intl\.' src/
# Expected: ZERO (usar src/lib/formatters.ts)

# 12. Disclaimer IA em todo Article publicado
# (manual ou via component rendering — checar visualmente em /blog/[slug])
```

---

## How the Agent Should Use This File

1. Read STANDARDS.md primeiro (universal Bitflix).
2. Read este arquivo (project-specific) — overrides ganham de defaults.
3. Read PROJECT_SPEC.md (produto/marca/editorial) e INFRA.md (servidor/deploy) quando relevante.
4. Antes de codar: confirmar quais regras se aplicam (skip multi-tenancy aqui, p.ex.).
5. Após escrever: rodar checklist desta seção + seção 15 do STANDARDS.
