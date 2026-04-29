# bitflix-lp — Conventions and Local Standards

> Living document. Last updated: 2026-04-29.
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
| DI Container | Awilix (CLASSIC mode) — `src/container.ts` |
| UI | shadcn/ui (new-york) + Tailwind 4.2.4 |
| Data Fetching (server) | Payload Local API + native `fetch` |
| Data Fetching (client) | TanStack Query |
| Forms | react-hook-form + `@hookform/resolvers/zod` |
| Validation | Zod 4.3.6 (schemas em `src/lib/validators/`) |
| Toasts | sonner |
| State client | UI state local (`useState`). Sem Zustand no MVP. |
| Slides | reveal.js ^5 |
| OG images | `@vercel/og` |
| Analytics | Umami self-hosted (`stats.bitflix.com.br`) |

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

```
src/
  app/
    (public)/                    # site público (Server Components default)
      page.tsx                   # home (~10 linhas)
      produtos/page.tsx
      servicos/page.tsx
      sobre/page.tsx
      contato/page.tsx
      blog/
        page.tsx                 # listing
        [slug]/page.tsx
        [slug]/slides/page.tsx
        feed.xml/route.ts
        components/
    (payload)/                   # admin Payload (auto-gerado)
      admin/[[...segments]]/page.tsx
      api/[...slug]/route.ts
    api/
      blog-import/route.ts       # endpoint custom (CC skill)
      og/[slug]/route.ts         # OG image dinâmica
    layout.tsx
    providers.tsx
  middleware.ts                  # roteamento por hostname (cms.staging.* vs staging.*)
  collections/                   # Payload Collections (configs TS)
    Articles.ts
    Categories.ts
    Tags.ts
    Authors.ts
    Products.ts
    Users.ts
    Media.ts
  globals/
    SiteSettings.ts
    Navigation.ts
  facades/
    blog/
      blog-import.facade.ts
      list-articles.facade.ts
  use-cases/
    blog/
      fetch-source-content.use-case.ts
      adapt-content.use-case.ts
      markdown-to-lexical.use-case.ts
      generate-slides.use-case.ts
      create-article-coordinator.use-case.ts
      create-article.use-case.ts
      ensure-category.use-case.ts
      ensure-tags.use-case.ts
  repositories/
    articles.repository.ts
    categories.repository.ts
    tags.repository.ts
    authors.repository.ts
    products.repository.ts
  providers/
    contracts/
      llm.provider.ts
      content-extractor.provider.ts
    anthropic-llm.provider.ts
    readability-extractor.provider.ts
  services/
    blog-articles.service.ts     # frontend fetch wrapper
    products.service.ts
  hooks/
    use-articles.ts
    use-products.ts
  components/
    ui/                          # shadcn-generated
    layout/
      site-header.tsx
      site-footer.tsx
    blog/
      article-card.tsx
      slide-deck.tsx
  view-models/
    article-view-model.ts
    product-view-model.ts
  dto/
    index.ts                     # re-exports tipos das Collections
  lib/
    validators/                  # Zod schemas (compartilhados FE/BE neste mesmo app)
    formatters.ts                # BR formatting (R$, datas, números)
    constants/                   # routes, query keys, label maps
    utils/
      uuid.ts                    # uuid v7 helper
    db/                          # Drizzle direct (se necessário fora do Payload)
    errors/                      # AppError + subclasses
  store/                         # vazio MVP (sem auth público nem state global)
  container.ts                   # Awilix CLASSIC
  payload.config.ts
docs/
  CONVENTIONS.md
  PROJECT_SPEC.md
  INFRA.md
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
| `/api/blog-import` | Endpoint custom para skill CC importar artigo | token via header `X-Bitflix-Import-Token` |

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
- **Coordinator UC abre transação**: já é o padrão atual STANDARDS (2026-04-10), reforçado aqui — facades NUNCA recebem `db`.
- **Auth no admin**: Payload Users Collection. Sem Auth.js/NextAuth.

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
- `BLOG_IMPORT_TOKEN` — token estático que `/api/blog-import` valida no header
- `UMAMI_WEBSITE_ID` — só em prod (não tracking em staging)
- `UMAMI_SCRIPT_URL` — `https://stats.bitflix.com.br/script.js`
- `LLM_API_KEY` — Anthropic key para skill de adaptação (opcional, usado pelo provider)

### Cache TTLs
- RSS feed: 1h (revalidate)
- Article listing: 5min (revalidate)
- Article individual: ISR on-demand (`revalidatePath` quando publicar/atualizar via Payload hook `afterChange`)
- OG image: cache forever (filename inclui hash do título/timestamp)

### Rate limits
- `/api/blog-import`: 10/min por IP. Implementar via in-memory counter no MVP (única route protegida por token; volume real é o user puxando).

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
| _none yet — projeto novo_ | | |

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
