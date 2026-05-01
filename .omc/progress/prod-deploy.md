# Bitflix LP — Progresso de execução Deploy Produção

> Tracking de execução do plano `.omc/plans/prod-deploy.md`.
> Criado: 2026-04-30.
> Plano de origem: `.omc/plans/prod-deploy.md` + runbook completo em `docs/INFRA.md` seção 8.

---

## Status global

**Status overall:** `in-progress` (compose prod up + admin acessível via TLS; falta cutover DNS apex)
**Próxima ação:** user faz cutover apex no Cloudflare quando estiver pronto pra desligar LP antiga (passo 8.10).
**Antes de começar nova sessão:** ler CLAUDE.md "Toolchain quirks" + `docs/INFRA.md` seção 8 + este arquivo "Decisões durante execução".

**URLs ativas:**
- `https://cms.bitflix.com.br/admin` → 200 Payload admin TLS
- `https://minio.cms.bitflix.com.br` → 200 MinIO console TLS
- `https://cms.bitflix.com.br/blog` → 404 (middleware bloqueia)
- `bitflix.com.br` apex → ainda LP antiga (cutover deferred)

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
| 8.10 | Cutover DNS apex (`@` + cert apex/www) | not-started (deferred — LP antiga continua) |
| 8.11 | Acceptance criteria | partial (cutover apex pendente) |

---

## Contexto e decisões

### Arquitetura prod (decidida 2026-04-30)

- **App + MinIO** em mesmo `docker-compose.prod.yml` no tomahawk
- **Postgres externo** na VM `192.168.14.20:6432` (porta diferente do default 5432)
- **MinIO console** acessível em `minio.cms.bitflix.com.br` (proxy nginx → 127.0.0.1:9001)
- **systemd unit oneshot** dispara compose no boot (mesmo padrão staging)
- **DNS apex por último** — cutover só após app+cert prontos pra evitar downtime da LP atual

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
- **Decisão:** DNS records `cms` + `www` + `minio.cms` criados primeiro; apex `@` só depois do app + cert prontos.
- **Motivo:** apex hoje aponta pra LP draft AI em outra hospedagem. Trocar antes do tomahawk estar pronto = LP cai 0% disponível durante setup. Cutover último passo minimiza janela.
- **How to apply:** runbook seção 8.10 explícito sobre ordem.

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
- **Sintoma:** após restore de Globals do staging, admin mostrava textos refinados mas `cms.bitflix.com.br/admin` páginas de site (e teoricamente `bitflix.com.br` após cutover) continuariam com defaults do seed.
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
- [ ] **Cloudflare: cutover A record apex `@` → `184.171.240.212`** (deferred — LP antiga continua rodando até user decidir desligar) — passo 8.10
- [ ] **Tomahawk: certbot pra apex + www** (após cutover DNS) — passo 8.10
- [ ] Apagar `/tmp/restore-prod-globals.sql` em parrilla + tomahawk (contém hash senha admin)
- [ ] Smoke test final + acceptance criteria — passo 8.11

---

## Como retomar em sessão futura

1. Ler `CLAUDE.md` (estado atual + toolchain quirks)
2. Ler `docs/INFRA.md` seção 8 (runbook copy-paste)
3. Ler este arquivo (estado dos passos)
4. Verificar último passo `not-started` ou `in-progress`
5. Se user já rodou parte do runbook: validar via `curl` (Claude tem acesso HTTPS público)
6. Atualizar este arquivo (status + timestamp + bloqueios), commit, push
