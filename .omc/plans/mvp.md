# Bitflix LP — Plano de Implementação MVP

> Plano de execução completo cobrindo as 6 fases do MVP (bootstrap → produção).
> Criado: 2026-04-29.
> Estimativa total: 10-15 dias úteis.
> Pré-requisito: leitura prévia de `CLAUDE.md`, `docs/CONVENTIONS.md`, `docs/PROJECT_SPEC.md`, `docs/INFRA.md`.

Este documento é o **contrato único** pra todo o MVP. Sessões futuras consultam aqui pra saber o que vem depois. Progresso de execução fica em `.omc/progress/mvp.md`.

---

## Visão geral das fases

| # | Fase | Estimativa | Bloqueador anterior |
|---|------|------------|---------------------|
| 1 | Bootstrap | 1-2 dias | — |
| 2 | Modeling (Collections + Globals) | 1-2 dias | Fase 1 |
| 3 | Public frontend | 3-4 dias | Fase 2 |
| 4 | Translation workflow (skill `/blog-import`) | 3-5 dias | Fase 2 (mínimo) |
| 5 | Deploy staging parrilla | 1 dia | Fase 1 |
| 6 | Deploy produção tomahawk | 1 dia | Sinal explícito do usuário |

Fases 3 e 4 podem rodar paralelas após Fase 2. Fase 5 pode rodar logo após Fase 1 pra liberar URL pública staging cedo.

---

## Fase 1 — Bootstrap

### Objetivo
Sair do greenfield (só docs) até primeira boot com Next 16 + Payload 3 + Postgres + MinIO funcionando em docker-compose na parrilla, admin Payload acessível em `localhost:3023/admin`.

### Pré-flight
- Node 24.15.0 (`node -v`)
- pnpm 10.33.2 (`pnpm -v`)
- Docker + Compose v2 (`docker -v && docker compose version`)
- `gh` autenticado em `meumlpontocom` (`gh auth status`)
- User no grupo `docker` (manual: `sudo usermod -aG docker $USER && newgrp docker`)

### Passos

#### 1.1 Git + GitHub
- `git init` na raiz
- `.gitignore` com: `node_modules/`, `.next/`, `out/`, `.env`, `.env.local`, `.env.*.local`, `*.log`, `.DS_Store`, `coverage/`, `.turbo/`, `dist/`, `build/`, `.payload/`
- `gh repo create meumlpontocom/bitflix-lp --private --source=. --remote=origin`
- Commit inicial só com `docs/` + `CLAUDE.md` + `typography-preview.html` + `.omc/` (snapshot "estado documentação")
- Push pra `main`

#### 1.2 Scaffold Next 16
- Mover `docs/`, `CLAUDE.md`, `typography-preview.html`, `.omc/` pra `/tmp/bitflix-backup/` temporariamente (create-next-app exige dir vazio)
- `pnpm create next-app@16.2.4 . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`
- Restaurar arquivos backupeados de volta
- Pinar versões exatas no `package.json` (substituir `^` por valores fixos):
  - `next: "16.2.4"`, `react: "19.2.5"`, `react-dom: "19.2.5"`
  - `typescript: "5.9.3"`, `tailwindcss: "4.2.4"`
- `.nvmrc` com `24.15.0`
- `engines` no `package.json`: `{ "node": ">=24.15.0", "pnpm": ">=10.33.2" }`

#### 1.3 Tailwind 4 + shadcn
- Confirmar Tailwind 4 (sem config file, `@import "tailwindcss"` em `globals.css`)
- Tema Bitflix em `src/app/globals.css` via `@theme`:
  ```css
  @theme {
    --color-bitflix-50: #00a0a0;
    --color-bitflix-500: #008090;
    --color-bitflix-700: #006070;
    --color-bitflix-800: #005060;
    --color-bitflix-900: #003030;
    --color-bitflix-text: #2d2d2d;
    --color-bitflix-cream: #f8ead7;
    --color-bitflix-cream-light: #fbf1e1;
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
  }
  ```
- `pnpm dlx shadcn@latest init` — style `new-york`, base color `neutral`, CSS variables `yes`
- NÃO instalar componentes shadcn ainda (Fase 3 instala sob demanda)

#### 1.4 Geist
- `pnpm add geist`
- `src/app/layout.tsx` importa `GeistSans` + `GeistMono` de `geist/font/sans` + `geist/font/mono`
- Aplicar `${GeistSans.variable} ${GeistMono.variable}` no `<html>`

#### 1.5 Payload 3.84.1
- `pnpm add payload@3.84.1 @payloadcms/next@3.84.1 @payloadcms/db-postgres@3.84.1 @payloadcms/storage-s3@3.84.1 @payloadcms/richtext-lexical@3.84.1`
- Estruturar `src/app/(payload)/`:
  - `admin/[[...segments]]/page.tsx`
  - `admin/[[...segments]]/not-found.tsx`
  - `api/[...slug]/route.ts`
  Seguir template oficial Payload v3 + Next App Router
- `src/payload.config.ts` mínimo:
  - `serverURL` por env, `secret` por env
  - `db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`
  - `editor: lexicalEditor()`
  - `admin: { user: 'users' }`
  - `collections: [Users]`
  - `upload` apontando pra MinIO via `s3Storage`
- `src/collections/Users.ts` (auth-enabled, role admin)
- `next.config.ts` com `withPayload()` wrapper
- `tsconfig.json`: paths `@payload-config` apontando pra `src/payload.config.ts`

#### 1.6 Estrutura de pastas
Criar dirs com `.gitkeep`:
```
src/
  collections/.gitkeep
  globals/.gitkeep
  components/.gitkeep
  lib/db/.gitkeep
  lib/validators/.gitkeep
  repositories/.gitkeep
  facades/.gitkeep
  use-cases/.gitkeep
  providers/.gitkeep
  hooks/.gitkeep
  services/.gitkeep
  dto/.gitkeep
```
Stubs:
- `src/lib/formatters.ts` com `formatBRL`, `formatBRDate`, `formatBRTime`
- `src/errors/AppError.ts` com 4 subclasses (NotFound/Conflict/Forbidden/Validation)
- `src/container.ts` Awilix CLASSIC vazio mas tipado
- `src/middleware.ts` stub que apenas exporta `config.matcher` (lógica hostname vai na Fase 3)

#### 1.7 docker-compose parrilla
`Dockerfile.dev` na raiz:
```dockerfile
FROM node:24.15-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
```

`docker-compose.yml`:
- Network `bitflix-lp-net`
- `bitflix-lp-postgres`: postgres:17, healthcheck `pg_isready`, volume `bitflix_lp_pg_data`, sem porta exposta
- `bitflix-lp-minio`: minio/minio:RELEASE.2025-09-07T16-13-09Z, healthcheck via `mc ready` ou wget pra `/minio/health/live`, volume `bitflix_lp_minio_data`, sem porta exposta
- `bitflix-lp-mc-init`: minio/mc, depends_on minio healthy, cria bucket `bitflix-lp-staging-media` + access key dedicada via `mc admin user add`
- `bitflix-lp-app`: build `.`, depends_on postgres+minio healthy, bind mount `.:/app` com `node_modules`/`.next` em volumes anônimos, expõe `127.0.0.1:3023:3000`

#### 1.8 Env
`.env.example` (commitado):
```
NODE_ENV=development
DATABASE_URI=postgres://bitflix_lp:CHANGEME@bitflix-lp-postgres:5432/bitflix_lp
PAYLOAD_SECRET=CHANGEME_use_openssl_rand_hex_32
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3023
POSTGRES_PASSWORD=CHANGEME
MINIO_ROOT_USER=minio_root
MINIO_ROOT_PASSWORD=CHANGEME_minio_root_password
S3_ENDPOINT=http://bitflix-lp-minio:9000
S3_ACCESS_KEY=bitflix_lp_app
S3_SECRET_KEY=CHANGEME_s3_app_key
S3_BUCKET=bitflix-lp-staging-media
S3_REGION=us-east-1
BLOG_IMPORT_TOKEN=CHANGEME_strong_token
UMAMI_WEBSITE_ID=
UMAMI_SCRIPT_URL=https://stats.bitflix.com.br/script.js
LLM_API_KEY=
```
`.env` local (NÃO commitar) com valores reais (gerar com `openssl rand -hex 32`). Permissões `0640`.

#### 1.9 Scripts package.json
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "tsc": "tsc --noEmit",
  "payload": "payload",
  "payload:migrate": "payload migrate",
  "payload:migrate:create": "payload migrate:create",
  "payload:types": "payload generate:types",
  "compose:up": "docker compose up -d",
  "compose:down": "docker compose down",
  "compose:logs": "docker compose logs -f bitflix-lp-app"
}
```

#### 1.10 First boot
- `cp .env.example .env` e preencher
- `docker compose up -d`
- Aguardar healthchecks (`docker compose ps`)
- `docker compose logs -f bitflix-lp-app` até Next ready
- Acessar `http://localhost:3023/admin` → criar primeiro user (Milton)
- Verificar bucket: `docker compose exec bitflix-lp-minio mc ls local/bitflix-lp-staging-media`

### Acceptance criteria Fase 1
- [ ] `docker compose up -d` sobe sem erro, todos containers `healthy`
- [ ] `http://localhost:3023/admin` redireciona pra `/admin/create-first-user` na primeira visita
- [ ] User criado, login funciona, dashboard Payload abre
- [ ] `pnpm build` passa sem erro
- [ ] `pnpm tsc --noEmit` zero erros
- [ ] `pnpm lint` zero warnings críticos
- [ ] Commit + push final pra `main`

---

## Fase 2 — Modeling (Collections + Globals)

### Objetivo
Modelar todas Collections e Globals do MVP no Payload, gerar tipos, migrar DB, configurar storage S3 → MinIO funcional (upload de Media testável via admin).

### Passos

#### 2.1 Collections
Criar em `src/collections/`:

**Authors.ts** — single-source `milton-bastos`:
- `name` (text, required)
- `slug` (text, unique, gerado de `name`)
- `bio` (textarea, ~3-4 linhas)
- `avatar` (upload → Media, opcional)
- `email` (text, opcional)
- `social` (group): `twitter`, `linkedin`, `github` opcionais

**Categories.ts** — taxonomia dinâmica (criadas pela skill `/blog-import`):
- `name` (text, required)
- `slug` (text, unique)
- `description` (textarea, opcional)
- `is_active` (checkbox, default true)

**Tags.ts** — idem categorias mas mais leves:
- `name` (text, required)
- `slug` (text, unique)
- `is_active` (checkbox, default true)

**Articles.ts** — schema completo (ver `docs/PROJECT_SPEC.md` seção 8):
- `title`, `slug` (unique), `excerpt`
- `body_lexical` (richText `lexicalEditor`)
- `cover_image` (upload Media, opcional — quando vazio, OG dinâmico assume)
- `cover_image_override` (upload Media, opcional)
- `source` (group): `original_title`, `original_author`, `original_site`, `original_url`, `original_published_at`, `license_note`
- `categories` (relationship m2m → Categories)
- `tags` (relationship m2m → Tags)
- `author` (relationship → Authors, default lookup `slug=milton-bastos`)
- `language_origin` (select: `en`, `pt-br`, `other`)
- `has_slides` (checkbox)
- `slides_blocks` (array de blocks):
  - `slide_title` (text)
  - `slide_content` (richText simples)
  - `slide_image` (upload Media, opcional)
  - `speaker_notes` (textarea, opcional)
- `disclaimer_variant` (select: `ai-translated`, `ai-adapted-from-text`, `original`)
- `is_bitflix_take` (checkbox)
- `status` (select: `draft`, `review`, `published`, default `draft`)
- `published_at` (date, nullable)
- `is_active` (checkbox, default true) — soft delete
- `created_via` (select: `manual`, `blog-import-skill`, default `manual`)
- Hooks: `beforeChange` slugify automático, `afterChange` log em `article_imports_log` se `created_via === 'blog-import-skill'`

**Products.ts** — vitrine SaaS:
- `name`, `slug`, `tagline`, `description` (rich text)
- `domain` (text, ex `meuml.com`)
- `cta_url` (text, default = `https://${domain}`)
- `status` (select: `producao`, `recem-lancado`, `em-desenvolvimento`)
- `logo` (upload Media)
- `featured` (checkbox) — destacar na home
- `display_order` (number)

**Media.ts** — upload genérico, S3 storage:
- `alt` (text, required)
- `caption` (text, opcional)
- Storage adapter `s3Storage` apontando bucket MinIO

**Users.ts** — já criado na Fase 1.5; ampliar com `role` (select: `admin`, `editor`).

#### 2.2 Globals
Criar em `src/globals/`:

**SiteSettings.ts**:
- `manifesto` (rich text, ~4-6 linhas hero da home + `/sobre`)
- `whatsapp_number` (text, ex `+5551999999999`)
- `whatsapp_messages` (group):
  - `default` (text)
  - `from_saas_card` (text)
  - `from_custom_cta` (text)
  - `from_blog_footer` (text)
- `email_institutional` (text, opcional)
- `umami_website_id` (text)
- `migration_strategy` (textarea, livre — usar enquanto LP atual não foi cortada)

**Navigation.ts**:
- `main_menu` (array): `{ label, href, external (checkbox) }`
- `footer_links` (array same shape)

#### 2.3 Storage S3 (MinIO)
- `s3Storage` plugin no `payload.config.ts`:
  ```ts
  s3Storage({
    collections: { media: true },
    bucket: process.env.S3_BUCKET!,
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    },
  })
  ```

#### 2.4 Lexical config
- `editor: lexicalEditor({ features: ({ rootFeatures }) => [...rootFeatures, BlocksFeature(...), HTMLConverterFeature({})] })`
- Habilitar features: heading H2-H4, blockquote, code block, link, lists, upload (inline media), HR

#### 2.5 Tabela auxiliar `article_imports_log`
Append-only, criada via migration manual SQL ou via Payload Collection com lock de update:
- `id` UUID v7
- `article_id` UUID (FK Articles)
- `source_url` text
- `import_method` text (`url` | `text-paste`)
- `triggered_at` timestamptz
- `triggered_by` text (token id)
- `llm_summary` text
- `created_at` timestamptz default now()
- Sem `updated_at`, sem soft delete (immutable)

#### 2.6 Migrations
- `pnpm payload migrate:create initial` gera migration inicial com todas tabelas
- `pnpm payload migrate` aplica
- `pnpm payload generate:types` regenera tipos

#### 2.7 Seed mínimo
Script `scripts/seed-minimal.ts`:
- Cria Author `milton-bastos` (placeholder bio)
- Cria 4 Products (meuml, postflix, marketflix, kronikor) com placeholders
- Inicializa SiteSettings global com placeholders editáveis

### Acceptance criteria Fase 2
- [ ] Todas Collections + Globals visíveis no admin Payload
- [ ] Migration aplica do zero (subir compose limpo, rodar migrate, sem erro)
- [ ] Upload de Media via admin chega no MinIO (verificar bucket via `mc ls`)
- [ ] Tipos TS gerados em `src/payload-types.ts` cobrem 100% das collections
- [ ] Author `milton-bastos` + 4 Products + SiteSettings criados pelo seed
- [ ] `pnpm tsc --noEmit` passa
- [ ] Commit + push

---

## Fase 3 — Public frontend

### Objetivo
Site público (`bitflix.com.br`) renderizando todas páginas listadas no `docs/PROJECT_SPEC.md` seção 5, consumindo dados do Payload via Local API (Server Components).

### Passos

#### 3.1 Layout base
- `src/app/(site)/layout.tsx` — header (nav lendo Globals.Navigation), footer (links + Umami script só em prod), aplica fonte Geist
- `src/app/(site)/page.tsx` — home
- Middleware `src/middleware.ts` final: roteamento por hostname (`cms.bitflix.com.br` → só `/admin/*` + `/api/payload/*`; `bitflix.com.br` → bloqueia esses paths)
- Componentes shadcn instalados sob demanda: `button`, `card`, `badge`, `separator`, `dropdown-menu`, `sheet` (mobile menu)

#### 3.2 Home `/`
- Hero: fundo bege creme + dot grid + logo full color centralizada + manifesto (lê SiteSettings.manifesto) + CTAs (SaaS / Custom / WhatsApp)
- Seção diferencial: "IA chegando no cliente final" (3 pillars cards)
- Vitrine produtos: 4 cards com `cta_url` linkando externo
- Trilho custom resumido: chamada pra `/servicos`
- Últimos 4 posts blog (Lista de Articles publicados, ordenados por `published_at` desc)
- CTA WhatsApp final

#### 3.3 `/produtos`
- Grid 4 SaaS, cards detalhados com tagline + description + status badge + CTA externo

#### 3.4 `/servicos`
- Trilho custom: tipos de projeto, processo, stack, CTA orçamento WhatsApp

#### 3.5 `/sobre`
- Quem é Bitflix + manifesto + bio Milton (lê Author `milton-bastos`)

#### 3.6 `/contato`
- Texto curto + botão WhatsApp + e-mail (opcional via SiteSettings.email_institutional)

#### 3.7 Blog `/blog`
- Listing paginado (9 por página)
- Filtros: categoria (?cat=slug), tag (?tag=slug), busca textual (?q=)
- Server Component lê via Payload Local API
- Cada card: cover (OG dinâmico ou override), título, excerpt, autor, data BR, categoria badge

#### 3.8 Article `/blog/[slug]`
- Renderiza body Lexical via `@payloadcms/richtext-lexical/react` (RichText component)
- Hero: cover + título + meta (autor, data, categoria, tags)
- Bottom: bloco "Fonte original" (lê group `source`), disclaimer IA (varia por `disclaimer_variant`)
- Tag `[Bitflix Take]` se `is_bitflix_take`
- Link "Ver slides" se `has_slides`

#### 3.9 Slides `/blog/[slug]/slides`
- Client Component wrapper de reveal.js v5
- `pnpm add reveal.js`
- `src/components/blog/slide-deck.tsx` recebe `slides_blocks` JSON
- Tema custom CSS aplicando paleta Bitflix
- Suporte fullscreen (F), overview (ESC), speaker (S), `?print-pdf`

#### 3.10 OG images `/og/[slug]`
- `src/app/og/[slug]/route.ts` usando `@vercel/og` (`pnpm add @vercel/og`)
- Output 1200x630 PNG
- Layout: gradient teal Bitflix + dot grid + título Geist Bold + categoria badge + logo canto
- Cache `public, max-age=3600, s-maxage=86400`

#### 3.11 RSS `/blog/feed.xml`
- `src/app/blog/feed.xml/route.ts`
- Últimos 30 articles publicados, XML 2.0 com `<title>`, `<link>`, `<description>` (excerpt), `<pubDate>`, `<author>`, `<category>`
- Cache 1h

#### 3.12 Páginas de erro
- `src/app/not-found.tsx` (404 público)
- `src/app/error.tsx` (boundary genérico 500)
- `src/app/global-error.tsx` (root error boundary)

#### 3.13 ViewModel layer
Pra cada entity Payload usada na UI, criar VM em `src/dto/`:
- `src/dto/article.ts` — `ArticleViewModel` + função `toArticleVM(article: Article): ArticleViewModel`
- `src/dto/product.ts` idem
- `src/dto/author.ts` idem
UI nunca importa entity Payload — só VM.

#### 3.14 Sitemap + robots
- `src/app/sitemap.ts` (Next 16 sitemap helper) lista home + páginas estáticas + todos articles published
- `src/app/robots.ts` permite tudo, aponta sitemap

#### 3.15 Umami
- `src/components/analytics/umami.tsx` — client component injetando `<script async defer data-website-id={UMAMI_WEBSITE_ID} src={UMAMI_SCRIPT_URL}>` apenas se `process.env.NODE_ENV === 'production'` E `UMAMI_WEBSITE_ID` definido
- Incluir no `layout.tsx`

### Acceptance criteria Fase 3
- [ ] Todas 10 rotas listadas em `docs/PROJECT_SPEC.md` seção 5 funcionam
- [ ] Lighthouse mobile score ≥ 90 em performance, accessibility, SEO
- [ ] OG dinâmico gera PNG 1200x630 em <500ms
- [ ] RSS valida em `https://validator.w3.org/feed/`
- [ ] Slides reveal.js navegam com setas + atalhos + export PDF
- [ ] Middleware bloqueia `/admin/*` em hostname `bitflix.com.br` e libera em `cms.bitflix.com.br`
- [ ] Umami só carrega em prod
- [ ] `pnpm build` + `pnpm tsc --noEmit` passam
- [ ] Commit + push

---

## Fase 4 — Translation workflow (skill `/blog-import`)

### Objetivo
Skill local Claude Code que aceita URL ou texto PT-BR, produz Article + (opcional) Slides em status `draft` no Payload, com adaptação editorial Bitflix.

### Passos

#### 4.1 Endpoint POST `/api/blog-import`
- `src/app/api/blog-import/route.ts`
- Auth: header `Authorization: Bearer <BLOG_IMPORT_TOKEN>` (compara com env)
- Body Zod schema (`src/lib/validators/blogImport.ts`):
  ```ts
  z.object({
    mode: z.enum(['url', 'text']),
    source_url: z.string().url().optional(),
    text_content: z.string().optional(),
    language_origin: z.enum(['en', 'pt-br', 'other']).default('en'),
    generate_slides: z.boolean().default(false),
  })
  ```
- Camadas: route → `BlogImportFacade.create(input)` → `CreateArticleFromImportCoordinator` → `[CreateArticleUC, CreateImportLogUC]` → repos
- Retorna `{ article_id, slug, admin_url, status: 'draft' }`

#### 4.2 Pipeline interno
Skill local (cliente) faz:
1. Se `mode=url`: fetch HTML + extrair texto principal (Readability ou jina.ai/r/)
2. LLM call (Claude API via env `LLM_API_KEY`):
   - Prompt sistema com voz Bitflix + manifesto + obrigatoriedade de citação fonte
   - Output: JSON `{ title, excerpt, body_md, suggested_categories: string[], suggested_tags: string[], language_origin, is_bitflix_take, source: {...} }`
3. Converter `body_md` markdown → Lexical JSON (`@payloadcms/richtext-lexical` HTMLConverter ou MD2Lexical custom)
4. Match categorias existentes (busca por slug); criar novas se não houver match (status `pending_approval` + `is_active=false` até user aprovar no admin) OU criar diretamente ativas com flag separado — decidir na execução conforme ergonomia
5. Idem tags
6. POST pra `/api/blog-import` com payload final
7. Se `generate_slides=true`: segunda LLM call gera array de 8-12 slides resumindo o artigo, cada slide com `title`, `content_md`, `speaker_notes`; converter MD→Lexical; popular `slides_blocks`

#### 4.3 Skill arquivo
- Localização: `~/.claude/skills/blog-import/SKILL.md`
- Trigger: usuário digita `/blog-import <url-ou-paste>`
- Skill orquestra os 7 passos acima usando Bash/Write/Read conforme necessário

#### 4.4 Comando `/blog-publish <slug>`
- Skill `~/.claude/skills/blog-publish/SKILL.md`
- Aceita slug, faz PATCH no admin Payload (autenticado via cookie session OU via Local API server-side script)
- Muda `status: draft → published`, seta `published_at = now()`
- Roda revalidação Next se necessário (`revalidatePath('/blog')`)

#### 4.5 Tabela `article_imports_log`
- Cada chamada bem-sucedida registra entrada (já modelado na Fase 2.5)

### Acceptance criteria Fase 4
- [ ] POST `/api/blog-import` aceita URL EN, retorna article_id em <30s
- [ ] POST `/api/blog-import` aceita texto PT-BR cru, retorna article_id
- [ ] Article gerado tem: título adaptado, excerpt ~200 char, body Lexical válido, source preenchido com link clicável, disclaimer correto, categorias/tags sugeridas
- [ ] Slides geram quando flag ligada (8-12 blocks)
- [ ] `article_imports_log` tem entrada por chamada
- [ ] Token inválido retorna 401
- [ ] Body inválido retorna 400 com mensagem ValidationError
- [ ] Commit + push

---

## Fase 5 — Deploy staging parrilla

### Objetivo
Site staging acessível publicamente em `staging.bitflix.com.br` + `staging.cms.bitflix.com.br` com TLS válido.

### Passos

#### 5.1 DNS Cloudflare
- A record `staging.bitflix.com.br` → `45.182.133.84`
- A record `staging.cms.bitflix.com.br` → `45.182.133.84`
- A record `staging.minio.bitflix.com.br` → `45.182.133.84` (opcional, só se quiser console MinIO público)
- Sem proxy/CDN (DNS only)

#### 5.2 nginx vhosts
- `/etc/nginx/sites-available/staging.bitflix.com.br`:
  ```nginx
  server {
    listen 80;
    server_name staging.bitflix.com.br;
    location / { proxy_pass http://127.0.0.1:3023; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
  }
  ```
- Idem `staging.cms.bitflix.com.br` → mesmo upstream (middleware Next decide)
- `ln -s sites-available/X sites-enabled/X`
- `nginx -t && systemctl reload nginx`

#### 5.3 Certbot
- `certbot --nginx -d staging.bitflix.com.br -d staging.cms.bitflix.com.br --non-interactive --agree-tos -m miltonbastos@gmail.com`
- Renovação automática já ativa (`certbot renew --dry-run`)

#### 5.4 Compose autostart
- `systemd` unit `bitflix-lp-staging.service`:
  ```ini
  [Unit]
  Description=Bitflix LP staging compose
  Requires=docker.service
  After=docker.service

  [Service]
  Type=oneshot
  RemainAfterExit=yes
  WorkingDirectory=/home/bitflix/claude_projetos/bitflix_lp
  ExecStart=/usr/bin/docker compose up -d
  ExecStop=/usr/bin/docker compose down

  [Install]
  WantedBy=multi-user.target
  ```
- `systemctl enable --now bitflix-lp-staging`

### Acceptance criteria Fase 5
- [ ] `https://staging.bitflix.com.br` retorna home com TLS válido
- [ ] `https://staging.cms.bitflix.com.br/admin` mostra Payload admin
- [ ] `https://staging.bitflix.com.br/admin` retorna 404 (middleware bloqueou)
- [ ] Compose sobe automaticamente após reboot da parrilla
- [ ] Cert renova automático

---

## Fase 6 — Deploy produção tomahawk

### Objetivo
Site prod acessível em `bitflix.com.br` + `cms.bitflix.com.br` com TLS, rodando bare-metal via systemd no tomahawk.

**ATENÇÃO**: requer sinal explícito do usuário pra começar (envolve cutover DNS apex + decisão de migração da LP atual).

### Pré-requisitos pendentes (input do usuário)
- Estratégia de migração: substituição direta vs redirect 301 da LP atual
- WhatsApp number + mensagens default por CTA preenchidos no Payload
- Bio Milton + manifesto preenchidos
- Umami website ID criado em `stats.bitflix.com.br/dashboard`
- E-mail institucional decidido (ou pular)

### Passos

#### 6.1 Provisionar tomahawk
- SSH como root, criar dir `/application/bitflix-lp/` owner `meuml:meuml`
- Como `meuml`: `nvm install 24.15.0 && nvm use 24.15.0 && nvm alias default 24.15.0`
- `npm install -g pnpm@10.33.2`
- Clonar repo: `cd /application && git clone git@github.com:meumlpontocom/bitflix-lp.git`

#### 6.2 DB + MinIO em VM `192.168.14.20`
- Conectar Postgres 17.5 da VM (pelo network interno do servidor físico)
- Criar DB + user: `CREATE DATABASE bitflix_lp; CREATE USER bitflix_lp WITH PASSWORD 'STRONG_RANDOM'; GRANT ALL ON DATABASE bitflix_lp TO bitflix_lp;`
- MinIO da VM: criar bucket `bitflix-lp-media` + access key dedicada com policy escopada ao bucket (read+write apenas)

#### 6.3 `.env.production` em `/application/bitflix-lp/`
- Owner `meuml:meuml`, perms `0640`
- Valores: `DATABASE_URI` apontando VM, `S3_ENDPOINT=https://minio.bitflix.com.br`, `S3_BUCKET=bitflix-lp-media`, `PAYLOAD_PUBLIC_SERVER_URL=https://bitflix.com.br`, etc

#### 6.4 Build e migrations
- `cd /application/bitflix-lp && pnpm install --frozen-lockfile && pnpm build`
- `pnpm payload migrate` aplica schema no DB prod
- Seed mínimo: `pnpm tsx scripts/seed-minimal.ts` (mesmo seed da Fase 2)

#### 6.5 systemd unit
`/etc/systemd/system/bitflix-lp.service`:
```ini
[Unit]
Description=Bitflix LP production
After=network.target

[Service]
Type=simple
User=meuml
Group=meuml
WorkingDirectory=/application/bitflix-lp
EnvironmentFile=/application/bitflix-lp/.env.production
ExecStart=/home/meuml/.nvm/versions/node/v24.15.0/bin/node node_modules/.bin/next start -p 3060
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bitflix-lp

[Install]
WantedBy=multi-user.target
```
`systemctl daemon-reload && systemctl enable --now bitflix-lp`

#### 6.6 nginx vhosts prod
`/etc/nginx/sites-available/bitflix.com.br`:
```nginx
server {
  listen 80;
  server_name bitflix.com.br www.bitflix.com.br;
  location / { proxy_pass http://127.0.0.1:3060; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}
```
Idem `cms.bitflix.com.br` → mesmo upstream `127.0.0.1:3060`.
Symlink + `nginx -t && systemctl reload nginx`.

#### 6.7 Certbot prod
- `certbot --nginx -d bitflix.com.br -d www.bitflix.com.br -d cms.bitflix.com.br --non-interactive --agree-tos -m miltonbastos@gmail.com`

#### 6.8 Cutover DNS apex
- **AGUARDA SINAL DO USUÁRIO** com estratégia decidida
- Se substituição direta: trocar A record `bitflix.com.br` da LP antiga pra IP tomahawk; idem `www`
- Se redirect 301: deixar LP antiga, criar redirect server-level OU usar domínio temporário pra prod e tarefa separada

#### 6.9 CI/CD (opcional pós-MVP)
- GitHub Actions workflow `.github/workflows/deploy.yml`:
  - Trigger: push em `main`
  - Steps: SSH em tomahawk via deploy key (não root), `cd /application/bitflix-lp`, `git pull`, `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm payload migrate`, `sudo systemctl restart bitflix-lp`
- Sudoers entry pra user `meuml` permitir `systemctl restart bitflix-lp` sem senha
- Marcar como "futuro" — Fase 6 termina antes disso, deploy manual basta no MVP

### Acceptance criteria Fase 6
- [ ] `https://bitflix.com.br` retorna home com TLS válido
- [ ] `https://cms.bitflix.com.br/admin` mostra Payload admin com TLS
- [ ] `https://bitflix.com.br/admin` retorna 404
- [ ] Service `bitflix-lp` inicia automático após reboot
- [ ] Logs visíveis em `journalctl -u bitflix-lp -f`
- [ ] Migration aplicada
- [ ] Backup MinIO prod **TODO documentado** (não bloqueia release, mas registrar como pendência)

---

## Pendências transversais (registrar conforme aparecer)

- Backup MinIO prod (Fase 6+): adicionar `mc mirror` cron pra outro endpoint
- Newsletter (fora do MVP, fase 2 pós-launch)
- Multilíngue EN do site (fora do MVP)
- Comentários no blog (fora do MVP)

---

## Como continuar em sessão futura

1. Ler `CLAUDE.md` + 3 docs em `docs/`
2. Ler `.omc/plans/mvp.md` (este arquivo) — contexto completo do MVP
3. Ler `.omc/progress/mvp.md` — estado atual de execução
4. Identificar próximo passo `not-started` ou `in-progress` no progress file
5. Executar, atualizar progress file (status + timestamp), commit, push

Sessão nova nunca precisa adivinhar fase ou passo. Tudo está aqui.
