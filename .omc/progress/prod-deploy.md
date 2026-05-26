# Bitflix LP — Progresso de execução Deploy Produção

> Tracking de execução do plano `.omc/plans/prod-deploy.md`.
> Criado: 2026-04-30.
> Plano de origem: `.omc/plans/prod-deploy.md` + runbook completo em `docs/INFRA.md` seção 8.

---

## Status global

**Status overall:** `done` (produção ativa em apex + www + cms + minio.cms).
**Próxima ação:** nenhuma pendente. Batch `Dev tools & AI agents maio/2026` publicado em staging + prod (2026-05-26). Demais trabalhos são evolução normal do produto/conteúdo.
**Antes de começar nova sessão:** ler `AGENTS.md`, `docs/INFRA.md` seção 8 e este arquivo "Decisões durante execução".

**URLs ativas:**
- `https://cms.bitflix.com.br/admin` → 200 Payload admin TLS
- `https://minio.cms.bitflix.com.br` → 200 MinIO console TLS
- `https://cms.bitflix.com.br/blog` → 404 (middleware bloqueia)
- `https://bitflix.com.br` → 200 site público TLS
- `https://www.bitflix.com.br` → 200/redirect para site público TLS

| Status | Significado |
|--------|-------------|
| not-started | Não iniciado |
| in-progress | Em execução |
| blocked | Bloqueado |
| done | Concluído + verificado |

### Resumo por passo

| Passo | Descrição | Status |
|-------|-----------|--------|
| 8.1 | DNS Cloudflare A records (cms/www/minio.cms) | done |
| 8.2 | Postgres VM 192.168.14.20 — DB+user criados | done |
| 8.3 | Tomahawk: validar Docker + Compose + git + grupo docker (zero instalação) | done |
| 8.4 | Clonar repo em /application/bitflix-lp | done |
| 8.5 | Configurar .env.production (secrets via openssl rand) | done |
| 8.6 | Subir compose prod (build + up) — 3 fixes intermediários | done |
| 8.7 | Seed + restore manual de Users/Authors/Globals do staging | done |
| 8.8 | nginx vhosts + certbot (cms + minio.cms) | done |
| 8.9 | systemd autostart compose | done |
| 8.10 | Cutover DNS apex (`@` + cert apex/www) | done |
| 8.11 | Acceptance criteria | done |

---

## Contexto e decisões

### Staging 2026-05-26 — Curadoria Bitflix Dev tools & AI agents maio/2026 (35 publicados direto)

- **Script:** `scripts/seed-open-source-batch-2026-05-dev-tools.ts` (curadoria própria Bitflix, sem fonte externa rastreada). Foco temático: dev tools, coding agents, CLIs, infra, segurança e AI tooling (AI Engineering Coach, AIPointer, rmux, Photo-agents, Zerostack, Terax, OpenSquilla, OpenPets, Lance, DroidDesk, SmallCode, zerolang, files-sdk, Concord, LUKSbox, pgGraph, claude-p, Codeindex, md2html etc.).
- **Modo:** publica direto (`Article.status='published'` + `published_at` + `OpenSourceCatalogEntry.catalog_status='published'`), parity weekly-31/batch open-source 2026-05. User pediu publicação direta (sem revisão no admin) nesta rodada.
- **Run staging:** `docker exec bitflix-lp-app pnpm exec payload run scripts/seed-open-source-batch-2026-05-dev-tools.ts` → 35/35 ✓. Sleep 900ms entre repos. Metadata GitHub via API pública (sem token = limite 60 req/h, suficiente).
- **Verificação staging (psql):** import `Curadoria Bitflix — Dev tools & AI agents maio/2026` status=`done`, 35 entries (todas `catalog_status='published'`), 35 articles linkados todos `status='published'`.
- **Migration:** nenhuma — script usa só Payload Local API sobre collections existentes (articles, open-source-catalog-entries, open-source-catalog-imports). Sem mudança de schema.
- **revalidatePath:** desnecessário — `(site)/*` usa `dynamic='force-dynamic'` (memória `feedback_site_pages_dynamic`).
- **Deploy prod 2026-05-26:** DONE. SSH `tomahawk` → `git pull --ff-only origin main` (cc6e8f1) em `/application/bitflix-lp` como `meuml` → `docker cp scripts/seed-open-source-batch-2026-05-dev-tools.ts bitflix-lp-prod-app:/app/scripts/` → `docker exec bitflix-lp-prod-app pnpm exec payload run scripts/seed-open-source-batch-2026-05-dev-tools.ts`. Sem rebuild, sem migration. 35/35 ✓, importId=5.
- **Verificação prod:** API `https://cms.bitflix.com.br/api/open-source-catalog-imports?where[source_name][equals]=...` → `status=done`, `repos_found_count=35`, `repos_imported_count=35`. Smokes HTTPS 200: `/blog/rmux-...`, `/blog/luksbox-...`, `/blog/ymawky-...`, `/blog/catalogo-open-source`.

### Deploy 2026-05-11 — Curadoria Bitflix Claude skills & agent tooling maio/2026 (35 drafts)

- **Commit em produção:** `9528367` (`feat: seed open source batch 2026-05 Claude skills (35 drafts)`). Script criado com `status: 'draft'` e `catalog_status: 'draft'` a pedido explícito do usuário pra revisão no admin antes de publicar.
- **Deploy:** `git pull --ff-only origin main` em `/application/bitflix-lp` como `meuml` (via SSH `tomahawk`). Sem rebuild de imagem nessa rodada — script foi copiado pro container rodando via `docker compose ... cp scripts/seed-open-source-batch-2026-05-claude-skills.ts bitflix-lp-prod-app:/app/scripts/...`. Atalho válido pq script é puro Payload Local API e não depende de mudança de schema/migration.
- **Migration:** nenhuma migration nova; nenhum rebuild.
- **Conteúdo:** `docker compose ... exec -T bitflix-lp-prod-app pnpm exec payload run scripts/seed-open-source-batch-2026-05-claude-skills.ts` criou 35 articles em status `draft` + 35 entries com `catalog_status: 'draft'`, lote `Curadoria Bitflix — Claude skills & agent tooling maio/2026`. Foco temático: Claude Code skills, agent tooling, AI dev primitives (claude-video, WRITING.md, cloudflare/skills, design-council, GodModeSkill etc.).
- **Fluxo GitHub:** mesmo pattern dos batches anteriores. Sleep 900ms entre repos. 35/35 ✓ no log.
- **Smokes públicos:** `https://bitflix.com.br` → 200, `https://cms.bitflix.com.br/admin` → 200, `/blog/catalogo-open-source` → 200. Drafts NÃO aparecem em `/catalogo-open-source` público (filtrado por `catalog_status: 'published'`) — vão aparecer só após revisão + publish.
- **Publicação 2026-05-11 (segunda rodada):** user pediu publicar todos os 35 drafts. Criado `scripts/publish-batch-claude-skills.ts` (commit `04a5eeb`) que finda o import record por `source_name`, lista 35 entries via `discovery_batch_id` e faz update direto: `Article.status='published'` + `Article.published_at=now` + `OpenSourceCatalogEntry.catalog_status='published'`. Sem `revalidatePath` pois `(site)/*` usa `dynamic='force-dynamic'` (memória `feedback_site_pages_dynamic`).
- **Run da publicação:** `docker compose cp` + `pnpm exec payload run scripts/publish-batch-claude-skills.ts` → 35/35 ✓. Import id=4, entries=35, todas published.
- **Smokes pós-publish:** `/blog/claude-video-...` → 200, `/blog/godmodeskill-...` → 200, `/blog/writing-md-...` → 200, `/blog/cloudflare-skills-...` → 200, `/blog/catalogo-open-source` → 200 com slugs novos renderizados.

### Deploy 2026-05-11 — Curadoria Bitflix open source maio/2026 (35 projetos)

- **Commit em produção:** `6434875` (`feat: open source batch 2026-05 publica direto (parity weekly-31)`). Commit anterior `109122a` (criou script como draft) foi promovido a published direto antes do deploy.
- **Deploy:** `git pull --ff-only origin main` em `/application/bitflix-lp` como `meuml` (via SSH `tomahawk`) + `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bitflix-lp-prod-app`.
- **Migration:** nenhuma migration nova; build rodou `pnpm payload migrate` (Done).
- **Build:** `next build` concluído com sucesso; imagem `bitflix-lp-prod-bitflix-lp-prod-app` recriada (sha `80b97cd535`), container `bitflix-lp-prod-app` recriado. Next.js Ready em 1131ms.
- **Conteúdo:** `docker compose ... exec -T bitflix-lp-prod-app pnpm exec payload run scripts/seed-open-source-batch-2026-05.ts` criou 35 artigos publicados + 35 entradas publicadas do catálogo, lote `Curadoria Bitflix de open source — maio/2026` (curadoria própria sem fonte externa rastreada).
- **Fluxo GitHub:** script processa um repositório por vez (mesma pattern dos weekly-30/31): metadata GitHub → upsert Article → upsert OpenSourceCatalogEntry → update import record. Sleep 900ms entre repos.
- **Validação CMS/API:** `https://cms.bitflix.com.br/api/open-source-catalog-imports?where[source_name][equals]=Curadoria Bitflix de open source — maio/2026` retornou `status=done`, `repos_found_count=35`, `repos_imported_count=35`.
- **Smokes públicos:** `https://bitflix.com.br` → 200, `https://cms.bitflix.com.br/admin` → 200, `/blog/catalogo-open-source` → 200, `/blog/janitorr-faxina-automatizada-do-servidor-jellyfin-antes-do-disco-encher` → 200, `/blog/matcha-cliente-de-e-mail-completo-direto-no-terminal` → 200, `/blog/twenty-crm-open-source-para-sair-do-salesforce-sem-renovacao-cara` → 200, `/blog/questarr-sonarr-e-radarr-mas-para-a-sua-biblioteca-de-jogos` → 200, `/og/janitorr-...?v=prod` → 200.
- **Render verificado:** `/blog/catalogo-open-source` renderiza cards dos novos slugs (Questarr, Snacks, Telepage etc.) com tags (games, igdb, prowlarr, ffmpeg, telegram) clicáveis.
- **LightRAG:** desabilitado por custo desde 2026-05-11 (per memória global). Sem ingestão para LightRAG nesta rodada.
- **Dev origin:** batch foi criado primeiro em dev como draft (commit `109122a`) e publicado via loop POST `/api/blog-publish` + flip manual de `catalog_status` (limitação documentada em memória `feedback_blog_publish_scope`). Script foi promovido a "published direto" antes do deploy prod para parity com weekly-30/31.

### Deploy 2026-05-04 — Github Awesome weekly #30

- **Commit em produção:** `39f215e` (`feat: seed github awesome weekly catalog`).
- **Deploy:** `git pull --ff-only origin main` em `/application/bitflix-lp` como `meuml` + `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bitflix-lp-prod-app`.
- **Migration:** nenhuma migration nova; `pnpm payload migrate` no build retornou `Done`.
- **Build:** `next build` concluído com sucesso; imagem `bitflix-lp-prod-bitflix-lp-prod-app` recriada e container `bitflix-lp-prod-app` reiniciado.
- **Conteúdo:** `docker compose ... exec -T bitflix-lp-prod-app pnpm exec payload run scripts/seed-githubawesome-weekly-30-catalog.ts` criou/atualizou 35 artigos publicados e 35 entradas publicadas do catálogo, lote `Github Awesome weekly #30`.
- **Validação CMS/API:** `https://cms.bitflix.com.br/api/open-source-catalog-entries?limit=1` retornou `totalDocs: 36`; `discovery_batch_id.status = done`; `repos_found_count = 35`; `repos_imported_count = 35`.
- **Smokes públicos:** `/blog/catalogo-open-source` → 200, `/blog/3dsvg-transforme-svgs-2d-em-componentes-3d-interativos` → 200, `/blog/sciwrite-skill-de-edicao-cientifica-baseada-em-writing-in-the-sciences` → 200, `/og/3dsvg-transforme-svgs-2d-em-componentes-3d-interativos?v=prod` → 200 PNG.
- **Render verificado:** artigo 3dsvg em produção com headings `<h2>`, fonte original, disclaimer editorial e code block terminal-style com botão `Copiar`.

### Deploy 2026-05-04 — Github Awesome weekly #31

- **Commit em produção:** `823b2a9` (`feat: seed github awesome weekly 31 catalog`).
- **Deploy:** `git pull --ff-only origin main` em `/application/bitflix-lp` como `meuml` + `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bitflix-lp-prod-app`.
- **Migration:** nenhuma migration nova; `pnpm payload migrate` no build retornou `Done`.
- **Build:** `next build` concluído com sucesso; imagem `bitflix-lp-prod-bitflix-lp-prod-app` recriada e container `bitflix-lp-prod-app` reiniciado.
- **Conteúdo:** `docker compose ... exec -T bitflix-lp-prod-app pnpm exec payload run scripts/seed-githubawesome-weekly-31-catalog.ts` criou/atualizou 35 artigos publicados e 35 entradas publicadas do catálogo, lote `Github Awesome weekly #31`.
- **Fluxo GitHub:** script processa um repositório por vez: consulta metadados GitHub, cria/atualiza post e entrada do catálogo, atualiza o import record e só depois avança para o próximo item.
- **Validação CMS/API:** `https://cms.bitflix.com.br/api/open-source-catalog-entries?limit=1&depth=0` retornou `totalDocs: 71`; filtro `discovery_source_name = Github Awesome weekly #31` retornou `totalDocs: 35`; `discovery_batch_id.status = done`; `repos_found_count = 35`; `repos_imported_count = 35`.
- **Smokes públicos:** `/blog/catalogo-open-source` → 200, `/blog/chromex-assistente-codex-no-side-panel-do-chrome` → 200, `/blog/club-3090-receitas-para-servir-llms-grandes-em-rtx-3090` → 200, `/og/chromex-assistente-codex-no-side-panel-do-chrome?v=prod` → 200 PNG.
- **Render verificado:** artigo chromex em produção com headings `<h2>`, fonte original, disclaimer editorial e code block terminal-style com botão `Copiar`.
- **LightRAG:** indexação enviada via REST `/documents/text` com `file_source = bitflix-lp/catalogo-open-source/githubawesome-weekly-31.md`; track `insert_20260504_221727_220be021`; status `processed`.

### Deploy 2026-05-04 — Catálogo open source + Ruflo

- **Commit em produção:** `43a5abe` (`feat: add open source catalog`).
- **Deploy:** `git pull --ff-only origin main` em `/application/bitflix-lp` + `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bitflix-lp-prod-app`.
- **Migration:** `20260504_004730` aplicada durante o build (`Migrated: 20260504_004730 (106ms)`).
- **Build:** `next build` concluído com sucesso; rota nova `/blog/catalogo-open-source` aparece como dinâmica.
- **Conteúdo:** `docker compose ... exec -T bitflix-lp-prod-app pnpm exec payload run scripts/seed-ruflo-catalog-entry.ts` criou/atualizou `Article.slug = ruflo-orquestracao-multiagente-para-claude-code` e `OpenSourceCatalogEntry.slug = ruflo`.
- **Smokes públicos e internos:** `/blog/catalogo-open-source` → 200, `/blog/ruflo-orquestracao-multiagente-para-claude-code` → 200, `/og/ruflo-orquestracao-multiagente-para-claude-code?v=prod` → 200 PNG.
- **Admin:** `https://cms.bitflix.com.br/admin` → 200.

### Correção de documentação 2026-05-04 — Apex já ativo

- **Correção:** documentação anterior ainda dizia que o cutover apex estava pendente. Esse estado estava desatualizado.
- **Evidência atual:** `dig +short bitflix.com.br A @1.1.1.1` → `184.171.240.212`; `dig +short www.bitflix.com.br A @1.1.1.1` → `184.171.240.212`.
- **Smokes públicos:** `https://bitflix.com.br` → 200, `https://bitflix.com.br/blog/catalogo-open-source` → 200, `https://bitflix.com.br/blog/ruflo-orquestracao-multiagente-para-claude-code` → 200.
- **Decisão operacional:** não tratar `8.10` como pendente em sessões futuras.

### Arquitetura prod (decidida 2026-04-30)

- **App + MinIO** em mesmo `docker-compose.prod.yml` no tomahawk
- **Postgres externo** na VM `192.168.14.20:6432` (porta diferente do default 5432)
- **MinIO console** acessível em `minio.cms.bitflix.com.br` (proxy nginx → 127.0.0.1:9001)
- **systemd unit oneshot** dispara compose no boot (mesmo padrão staging)
- **DNS apex ativo** — `bitflix.com.br` e `www.bitflix.com.br` apontam para `184.171.240.212`

### Inputs do user (recebidos 2026-04-30)

- Tomahawk IP: `184.171.240.212`
- DB host: `192.168.14.20:6432` (porta 6432, provavelmente PgBouncer)
- DB name: `bitflix_lp_prod`
- DB user: `bitflix_lp_prod`
- DB password: `00d5499b066c2b0c3ee1b5e398fbd57a1cdca695c2457ff0` (já no .env.production.example pré-populado)
- pg_hba VM: liberado pra `184.171.240.212`
- DNS strategy: substituição direta apex (não redirect 301)
- MinIO em container (não na VM externa)
- MinIO subdomínio: `minio.cms.bitflix.com.br`
- Email pulado (sem MX/SPF/DKIM)
- Umami website ID: já criado e preenchido no staging — user copia pra prod

### Artefatos gerados em 2026-04-30

| Arquivo | Função |
|---------|--------|
| `Dockerfile.prod` | Multi-stage build (deps → builder → runner). Build precisa DATABASE_URI+PAYLOAD_SECRET via build-args (generateStaticParams hita DB) |
| `docker-compose.prod.yml` | 3 services: app, minio, mc-init. Network `bitflix-lp-prod-net`. Volume `bitflix_lp_prod_minio_data`. Container_names com sufixo `-prod-` |
| `.env.production.example` | Template com DB URI já pré-preenchido + placeholders pros secrets gerados via `openssl rand` |
| `infra/prod/bitflix.com.br.conf` | nginx vhost site público (apex + www) → 127.0.0.1:3060 |
| `infra/prod/cms.bitflix.com.br.conf` | nginx vhost admin Payload → 127.0.0.1:3060 (mesmo container, middleware Next roteia) |
| `infra/prod/minio.cms.bitflix.com.br.conf` | nginx vhost MinIO console → 127.0.0.1:9001 (proxy_buffering off + chunked off pro WebSocket do console) |
| `infra/prod/bitflix-lp-prod.service` | systemd oneshot compose autostart |
| `next.config.ts` | Adicionado `minio.cms.bitflix.com.br` em remotePatterns (defensivo; URLs reais de mídia passam por Payload) |
| `docs/INFRA.md` seção 8 | Runbook completo copy-paste 8.1 → 8.12 |

---

## Decisões durante geração de artefatos

### 2026-04-30 — Build dentro do container (precisa DB no build)
- **Decisão:** Dockerfile.prod recebe DATABASE_URI+PAYLOAD_SECRET via ARG e roda `pnpm build` durante a imagem.
- **Motivo:** `generateStaticParams` em `src/app/(site)/blog/[slug]/page.tsx` hita Payload Local API → Postgres. Build sem DB acessível falha. Container bridge consegue alcançar VM 192.168.14.20 via host routing (mesmo servidor físico).
- **Alternativa considerada:** wrapper try/catch em `getAllPublishedArticleSlugs` retornando `[]` — descartado por silenciar erros legítimos.
- **How to apply:** docker-compose.prod.yml passa args via `build.args.DATABASE_URI: ${DATABASE_URI}`. Compose lê do `--env-file .env.production`.

### 2026-04-30 — MinIO console em subdomínio próprio (não path-based)
- **Decisão:** `minio.cms.bitflix.com.br` proxa direto pro console MinIO (porta 9001), não pra S3 API (9000).
- **Motivo:** S3 API só consumida internamente pelo app via bridge network. Browser nunca acessa MinIO direto — Payload serve mídia via `/api/media/file/<filename>` (server-side stream).
- **Trade-off:** se algum dia precisar CDN externa lendo direto do bucket, vira o vhost pra 9000 e habilita anonymous read no bucket (`mc anonymous set download`).

### 2026-04-30 — Sem POSTGRES_* / sem service postgres em prod
- **Decisão:** docker-compose.prod.yml NÃO tem service postgres. Só app+minio+mc-init.
- **Motivo:** DB já existe na VM 192.168.14.20 (Postgres 17.5 com vários DBs de outros projetos). Replicar postgres em container = desperdício + conflito de backup strategy.
- **Risco:** se VM cair, app cai junto. Aceitável (VM tem backup diário próprio).

### 2026-04-30 — Apex (`@`) DNS por último
- **Decisão histórica:** DNS records `cms` + `www` + `minio.cms` foram criados primeiro; apex `@` ficou para depois do app + cert prontos.
- **Motivo na época:** apex ainda apontava para LP draft AI em outra hospedagem. Trocar antes do tomahawk estar pronto criaria downtime. Cutover último passo minimizava janela.
- **Estado atual:** cutover já foi feito; `bitflix.com.br` e `www.bitflix.com.br` apontam para `184.171.240.212`.

### 2026-04-30 — Compose project name `bitflix-lp-prod` (não `bitflix-lp`)
- **Decisão:** `name: bitflix-lp-prod` no compose + container_name `bitflix-lp-prod-*`.
- **Motivo:** evita conflito teórico se algum dia rodar staging na mesma máquina (ou se devops mover em emergência). Namespace claro.

---

## Bloqueios e descobertas durante execução

### 2026-04-30 — Build inicial falhou: 5 Globals novos sem migration snapshot
- **Sintoma:** `pnpm build` no Dockerfile dava `error: relation "contato_page" does not exist` (code 42P01) ao prerenderar `/contato`, `/sobre` etc.
- **Causa raiz:** schema inicial (`20260429_220628_initial.ts`) só cobre Fase 2 (8 collections + 2 globals iniciais). Os 5 page Globals novos pós-MVP (HomePage/ProdutosPage/ServicosPage/SobrePage/ContatoPage) foram adicionados em dev com `push: true` (auto-sync Drizzle) — nunca tiveram snapshot capturado. Em prod (push: false / migrate explícito), tabelas não existiam.
- **Tentativa fracassada:** `pnpm payload migrate:create --name pages_globals` exige TTY interativo (drizzle-kit prompt sobre rename detection). `yes ""` + heredoc + `script -q` não passam pelo raw mode do prompt.
- **Fix aplicado:** dump schema do staging via `pg_dump --schema-only -t home_page -t home_page_pillars ...` + `\d` pra cada tabela. Migration manual `src/migrations/20260430_pages_globals.ts` escrita à mão seguindo padrão do `20260429_220628_initial.ts`. Validada aplicando em DB scratch (`bitflix_lp_test_migration` → ambas migrations clean apply: 30ms+13ms).
- **Lição:** Toda mudança de schema em dev precisa `pnpm payload migrate:create` ANTES do deploy prod. Senão dev/staging usam push: true e prod quebra. Manter `migrate:create` na rotina de PR depois de toda mudança em collections/globals.

### 2026-04-30 — Build precisa migrate ANTES do next build
- **Sintoma:** Mesmo com fix anterior, build falhou em `/blog/feed.xml` com 42P01 em `articles`.
- **Causa raiz:** chicken-and-egg. Build prerenderiza várias rotas (sitemap, RSS, /blog list, etc) que hitam Payload Local API → Postgres. Mas migrations só rodavam APÓS build no runbook original (passo 8.7).
- **Fix:** mover `RUN pnpm payload migrate` pra ANTES de `RUN pnpm build` no `Dockerfile.prod`. Idempotente — re-runs viram no-op se snapshot já aplicado.
- **Bonus fix:** wrapper `getAllPublishedArticleSlugsForBuild` em `articles.service.ts` que silencia 42P01 e retorna `[]`. Defesa em profundidade caso build rode sem schema (deploy reset).

### 2026-04-30 — Site público mostrava conteúdo do seed mesmo após admin editado
- **Sintoma:** após restore de Globals do staging, admin mostrava textos refinados mas páginas públicas continuavam com defaults do seed.
- **Causa raiz:** páginas `(site)/*` viraram **static** no build (Server Components com `await getX()` mas sem indicador de dinamicidade). Next prerender + cacheado com `s-maxage=31536000` (1 ano).
- **Fix:** `export const dynamic = 'force-dynamic'` em todas as 7 pages do `(site)`: home, produtos, servicos, sobre, contato, blog list, blog/[slug]. Trade-off: perde static optimization mas edits no admin viram visíveis na próxima request.
- **Lição:** Site CMS-driven precisa pages dinâmicas por default. Sem admin webhook chamando `revalidatePath`, static render = conteúdo fossilizado.

### 2026-04-30 — `bitflix-lp_users` não foi copiado no primeiro restore
- **Sintoma:** ao acessar `/admin` em prod, redirect pra `create-first-user`. User Milton do staging não estava lá.
- **Causa:** primeiro dump do staging só pegou Authors/Globals — não a tabela `users` (login admin). Authors ≠ Users (Authors = bylines blog; Users = login).
- **Fix:** re-dump incluindo `-t users`. Restore SQL agora inclui hash bcrypt + salt do staging → login prod com mesma senha.

### 2026-04-30 — `restore-prod-globals.sql` contém hash de senha admin
- **Detalhe:** dump tem `users.hash` + `users.salt` (bcrypt). Não é plaintext mas **não pode ir pro repo público**.
- **Mitigação:** `.gitignore` adicionou pattern `restore-prod-globals.sql` + `*.restore.sql`. Arquivo só vive em `/tmp` (parrilla) + `/tmp` (tomahawk). Apagar após uso.

---

## Ações manuais do usuário pendentes

- [x] DNS Cloudflare: `cms`, `www`, `minio.cms` apontando `184.171.240.212` — done 2026-04-30
- [x] Postgres VM: criar DB+user `bitflix_lp_prod` — done 2026-04-30
- [x] pg_hba VM: liberar `184.171.240.212` — done 2026-04-30
- [x] Tomahawk: validar Docker + Compose + git + grupo docker — done 2026-04-30
- [x] Tomahawk: clonar repo em `/application/bitflix-lp/` — done 2026-04-30
- [x] Tomahawk: criar `.env.production` com secrets gerados — done 2026-04-30
- [x] Tomahawk: `docker compose build + up` — done 2026-04-30 (após 3 fixes: pages_globals migration + migrate-before-build + getAllPublishedArticleSlugsForBuild)
- [x] Tomahawk: seed + restore manual de Users/Authors/Globals do staging — done 2026-04-30
- [x] Tomahawk: nginx + certbot pra `cms` + `minio.cms` — done 2026-04-30
- [x] Tomahawk: enable systemd unit — done 2026-04-30 (reboot test deferred — design oneshot+RemainAfterExit já validado)
- [x] Tomahawk: marcar pages (site) como `dynamic = 'force-dynamic'` + rebuild — done 2026-04-30
- [x] **Cloudflare: cutover A record apex `@` → `184.171.240.212`** — done
- [x] **Tomahawk: certbot pra apex + www** — done
- [ ] Apagar `/tmp/restore-prod-globals.sql` em parrilla + tomahawk (contém hash senha admin)
- [ ] Smoke test final + acceptance criteria — passo 8.11

---

## Como retomar em sessão futura

1. Ler `CLAUDE.md` (estado atual + toolchain quirks)
2. Ler `docs/INFRA.md` seção 8 (runbook copy-paste)
3. Ler este arquivo (estado dos passos)
4. Verificar último passo `not-started` ou `in-progress`, mas lembrar que o cutover apex já está concluído
5. Se user já rodou parte do runbook: validar via `curl` (Codex tem acesso HTTPS público)
6. Atualizar este arquivo (status + timestamp + bloqueios), commit, push
