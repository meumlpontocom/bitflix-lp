# Bitflix LP — Progresso de execução MVP

> Tracking de execução das 6 fases definidas em `.omc/plans/mvp.md`.
> Criado: 2026-04-29.
> Última atualização: 2026-04-29.

---

## Status global

**Fase atual:** Fase 1 — Bootstrap
**Status overall:** `not-started`
**Próxima ação:** rodar pré-flight da Fase 1.1

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
| 1. Bootstrap | not-started | — | — |
| 2. Modeling | not-started | — | — |
| 3. Public frontend | not-started | — | — |
| 4. Translation workflow | not-started | — | — |
| 5. Deploy staging | not-started | — | — |
| 6. Deploy produção | not-started | — | — |

---

## Fase 1 — Bootstrap

### Pré-flight
- [ ] Node 24.15.0 confirmado — `not-started`
- [ ] pnpm 10.33.2 confirmado — `not-started`
- [ ] Docker + Compose v2 confirmados — `not-started`
- [ ] `gh` autenticado em `meumlpontocom` — `not-started`
- [ ] User no grupo `docker` — `not-started`

### 1.1 Git + GitHub
- [ ] `git init` — `not-started`
- [ ] `.gitignore` criado — `not-started`
- [ ] Repo `meumlpontocom/bitflix-lp` privado criado via `gh` — `not-started`
- [ ] Commit inicial snapshot docs + push `main` — `not-started`

### 1.2 Scaffold Next 16
- [ ] Backup temporário de `docs/`+`CLAUDE.md`+`typography-preview.html`+`.omc/` — `not-started`
- [ ] `create-next-app` rodado (Next 16.2.4) — `not-started`
- [ ] Arquivos restaurados — `not-started`
- [ ] Versões pinadas exatas no `package.json` — `not-started`
- [ ] `.nvmrc` 24.15.0 — `not-started`
- [ ] `engines` adicionado — `not-started`

### 1.3 Tailwind 4 + shadcn
- [ ] Tailwind 4 confirmado — `not-started`
- [ ] `@theme` Bitflix em `globals.css` — `not-started`
- [ ] `shadcn init` (new-york, neutral) — `not-started`

### 1.4 Geist
- [ ] `pnpm add geist` — `not-started`
- [ ] Imports + variáveis aplicados em `layout.tsx` — `not-started`

### 1.5 Payload 3.84.1
- [ ] Packages Payload instalados — `not-started`
- [ ] Estrutura `src/app/(payload)/` criada — `not-started`
- [ ] `src/payload.config.ts` mínimo — `not-started`
- [ ] `src/collections/Users.ts` — `not-started`
- [ ] `next.config.ts` com `withPayload()` — `not-started`
- [ ] Paths `@payload-config` no `tsconfig` — `not-started`

### 1.6 Estrutura de pastas
- [ ] Dirs `.gitkeep` criados — `not-started`
- [ ] `src/lib/formatters.ts` stub — `not-started`
- [ ] `src/errors/AppError.ts` stub — `not-started`
- [ ] `src/container.ts` stub Awilix — `not-started`
- [ ] `src/middleware.ts` stub — `not-started`

### 1.7 docker-compose parrilla
- [ ] `Dockerfile.dev` criado — `not-started`
- [ ] `docker-compose.yml` 4 services — `not-started`
- [ ] Healthchecks ajustados (postgres, minio) — `not-started`

### 1.8 Env
- [ ] `.env.example` commitado — `not-started`
- [ ] `.env` local com valores reais — `not-started`
- [ ] `chmod 0640 .env` — `not-started`

### 1.9 Scripts package.json
- [ ] Scripts dev/build/start/lint/tsc/payload/compose adicionados — `not-started`

### 1.10 First boot
- [ ] `docker compose up -d` executado — `not-started`
- [ ] Containers `healthy` confirmados — `not-started`
- [ ] Log Next ready — `not-started`
- [ ] Admin `localhost:3023/admin` + primeiro user criado — `not-started`
- [ ] Bucket MinIO confirmado — `not-started`

### Acceptance criteria Fase 1
- [ ] `docker compose up -d` healthy total — `not-started`
- [ ] Redirect `create-first-user` funcional — `not-started`
- [ ] Login Payload OK — `not-started`
- [ ] `pnpm build` passa — `not-started`
- [ ] `pnpm tsc --noEmit` zero erros — `not-started`
- [ ] `pnpm lint` zero warnings críticos — `not-started`
- [ ] Commit + push final em `main` — `not-started`

---

## Fase 2 — Modeling

### 2.1 Collections
- [ ] `Authors.ts` — `not-started`
- [ ] `Categories.ts` — `not-started`
- [ ] `Tags.ts` — `not-started`
- [ ] `Articles.ts` (schema completo + hooks) — `not-started`
- [ ] `Products.ts` — `not-started`
- [ ] `Media.ts` (com S3 storage) — `not-started`
- [ ] `Users.ts` ampliado com `role` — `not-started`

### 2.2 Globals
- [ ] `SiteSettings.ts` — `not-started`
- [ ] `Navigation.ts` — `not-started`

### 2.3 Storage S3 (MinIO)
- [ ] `s3Storage` plugin configurado em `payload.config.ts` — `not-started`

### 2.4 Lexical config
- [ ] Features habilitadas (heading, blockquote, code, link, lists, upload, HR) — `not-started`

### 2.5 `article_imports_log`
- [ ] Tabela append-only criada (migration ou Collection com lock) — `not-started`

### 2.6 Migrations
- [ ] `payload migrate:create initial` gerado — `not-started`
- [ ] `payload migrate` aplicado — `not-started`
- [ ] `payload generate:types` regenerado — `not-started`

### 2.7 Seed mínimo
- [ ] `scripts/seed-minimal.ts` cria Author + 4 Products + SiteSettings — `not-started`
- [ ] Seed executado com sucesso — `not-started`

### Acceptance criteria Fase 2
- [ ] Todas Collections + Globals visíveis no admin — `not-started`
- [ ] Migration zero-to-up sem erro — `not-started`
- [ ] Upload Media chega no MinIO bucket — `not-started`
- [ ] Tipos TS gerados em `src/payload-types.ts` — `not-started`
- [ ] Seed executado — `not-started`
- [ ] `pnpm tsc --noEmit` passa — `not-started`
- [ ] Commit + push — `not-started`

---

## Fase 3 — Public frontend

### 3.1 Layout base
- [ ] `src/app/(site)/layout.tsx` (header/footer) — `not-started`
- [ ] Middleware hostname routing final — `not-started`
- [ ] Componentes shadcn base instalados — `not-started`

### 3.2 Home `/`
- [ ] Hero + manifesto + CTAs — `not-started`
- [ ] Seção diferencial — `not-started`
- [ ] Vitrine produtos — `not-started`
- [ ] Trilho custom resumido — `not-started`
- [ ] Últimos 4 posts — `not-started`
- [ ] CTA WhatsApp final — `not-started`

### 3.3 `/produtos`
- [ ] Grid 4 SaaS cards detalhados — `not-started`

### 3.4 `/servicos`
- [ ] Trilho custom completo — `not-started`

### 3.5 `/sobre`
- [ ] Manifesto + bio Milton — `not-started`

### 3.6 `/contato`
- [ ] WhatsApp + e-mail opcional — `not-started`

### 3.7 Blog `/blog`
- [ ] Listing paginado — `not-started`
- [ ] Filtros categoria/tag/busca — `not-started`

### 3.8 Article `/blog/[slug]`
- [ ] Render Lexical — `not-started`
- [ ] Bloco fonte original — `not-started`
- [ ] Disclaimer IA — `not-started`
- [ ] Tag `[Bitflix Take]` condicional — `not-started`
- [ ] Link slides condicional — `not-started`

### 3.9 Slides `/blog/[slug]/slides`
- [ ] reveal.js v5 instalado e wrapper criado — `not-started`
- [ ] Tema Bitflix — `not-started`
- [ ] Atalhos teclado funcionais — `not-started`
- [ ] Export PDF testado — `not-started`

### 3.10 OG images `/og/[slug]`
- [ ] `@vercel/og` instalado e route criada — `not-started`
- [ ] Output 1200x630 PNG válido — `not-started`

### 3.11 RSS `/blog/feed.xml`
- [ ] Feed XML 2.0 últimos 30 — `not-started`
- [ ] Validador W3C OK — `not-started`

### 3.12 Páginas erro
- [ ] `not-found.tsx` — `not-started`
- [ ] `error.tsx` — `not-started`
- [ ] `global-error.tsx` — `not-started`

### 3.13 ViewModel layer
- [ ] `dto/article.ts` + toArticleVM — `not-started`
- [ ] `dto/product.ts` + toProductVM — `not-started`
- [ ] `dto/author.ts` + toAuthorVM — `not-started`

### 3.14 Sitemap + robots
- [ ] `sitemap.ts` — `not-started`
- [ ] `robots.ts` — `not-started`

### 3.15 Umami
- [ ] Componente `umami.tsx` injetando script só em prod — `not-started`

### Acceptance criteria Fase 3
- [ ] Todas 10 rotas funcionam — `not-started`
- [ ] Lighthouse mobile ≥ 90 perf/a11y/SEO — `not-started`
- [ ] OG dinâmico < 500ms — `not-started`
- [ ] RSS valida W3C — `not-started`
- [ ] Slides nav + atalhos + export PDF OK — `not-started`
- [ ] Middleware bloqueia/libera por hostname — `not-started`
- [ ] Umami só em prod — `not-started`
- [ ] `pnpm build` + `pnpm tsc --noEmit` passam — `not-started`
- [ ] Commit + push — `not-started`

---

## Fase 4 — Translation workflow

### 4.1 Endpoint POST `/api/blog-import`
- [ ] Route handler criado — `not-started`
- [ ] Auth Bearer token validado — `not-started`
- [ ] Zod schema body — `not-started`
- [ ] Camadas Route → Facade → Coordinator UC → Repos — `not-started`

### 4.2 Pipeline interno (skill local)
- [ ] Fetch + extract URL HTML — `not-started`
- [ ] LLM call adapta voz Bitflix → JSON estruturado — `not-started`
- [ ] Markdown → Lexical converter — `not-started`
- [ ] Match/criação categorias e tags — `not-started`
- [ ] POST pra endpoint — `not-started`
- [ ] Geração slides condicional — `not-started`

### 4.3 Skill arquivo
- [ ] `~/.claude/skills/blog-import/SKILL.md` criado — `not-started`

### 4.4 Comando `/blog-publish <slug>`
- [ ] Skill `blog-publish/SKILL.md` criado — `not-started`
- [ ] Promove draft → published + revalida — `not-started`

### 4.5 Tabela log
- [ ] Cada import bem-sucedido grava em `article_imports_log` — `not-started`

### Acceptance criteria Fase 4
- [ ] URL EN → article_id em <30s — `not-started`
- [ ] Texto PT-BR cru → article_id — `not-started`
- [ ] Article gerado com voz Bitflix + fonte + disclaimer — `not-started`
- [ ] Slides 8-12 blocks quando solicitado — `not-started`
- [ ] Log persistido — `not-started`
- [ ] Token inválido → 401 — `not-started`
- [ ] Body inválido → 400 — `not-started`
- [ ] Commit + push — `not-started`

---

## Fase 5 — Deploy staging parrilla

### 5.1 DNS Cloudflare
- [ ] A record `staging.bitflix.com.br` — `not-started`
- [ ] A record `staging.cms.bitflix.com.br` — `not-started`
- [ ] A record `staging.minio.bitflix.com.br` (opcional) — `not-started`

### 5.2 nginx vhosts
- [ ] vhost `staging.bitflix.com.br` — `not-started`
- [ ] vhost `staging.cms.bitflix.com.br` — `not-started`
- [ ] `nginx -t && systemctl reload nginx` — `not-started`

### 5.3 Certbot
- [ ] Cert emitido `--nginx -d staging.bitflix.com.br -d staging.cms.bitflix.com.br` — `not-started`
- [ ] `certbot renew --dry-run` OK — `not-started`

### 5.4 Compose autostart
- [ ] systemd unit `bitflix-lp-staging.service` — `not-started`
- [ ] `enable --now` — `not-started`
- [ ] Reboot test (parrilla volta sozinho com app up) — `not-started`

### Acceptance criteria Fase 5
- [ ] `https://staging.bitflix.com.br` home com TLS — `not-started`
- [ ] `https://staging.cms.bitflix.com.br/admin` Payload com TLS — `not-started`
- [ ] `https://staging.bitflix.com.br/admin` 404 — `not-started`
- [ ] Compose autostart OK — `not-started`
- [ ] Cert renova automático — `not-started`

---

## Fase 6 — Deploy produção tomahawk

> ATENÇÃO: requer sinal explícito do usuário antes de iniciar (cutover DNS apex).

### Pré-requisitos pendentes (input do usuário)
- [ ] Estratégia migração LP atual decidida — `not-started`
- [ ] WhatsApp number + mensagens preenchidos no Payload staging — `not-started`
- [ ] Bio Milton + manifesto preenchidos — `not-started`
- [ ] Umami website ID criado para `bitflix.com.br` — `not-started`
- [ ] E-mail institucional decidido — `not-started`

### 6.1 Provisionar tomahawk
- [ ] Dir `/application/bitflix-lp/` criado owner `meuml:meuml` — `not-started`
- [ ] Node 24.15.0 via NVM no user `meuml` — `not-started`
- [ ] pnpm 10.33.2 global — `not-started`
- [ ] Repo clonado — `not-started`

### 6.2 DB + MinIO em VM 192.168.14.20
- [ ] DB `bitflix_lp` + user criados — `not-started`
- [ ] Bucket `bitflix-lp-media` + access key dedicada criados — `not-started`

### 6.3 `.env.production`
- [ ] Arquivo criado, `0640`, `meuml:meuml` — `not-started`

### 6.4 Build e migrations
- [ ] `pnpm install --frozen-lockfile` — `not-started`
- [ ] `pnpm build` — `not-started`
- [ ] `pnpm payload migrate` — `not-started`
- [ ] Seed executado — `not-started`

### 6.5 systemd unit
- [ ] `/etc/systemd/system/bitflix-lp.service` criado — `not-started`
- [ ] `enable --now` — `not-started`
- [ ] `journalctl -u bitflix-lp` mostra log limpo — `not-started`

### 6.6 nginx vhosts prod
- [ ] vhost `bitflix.com.br` + `www` — `not-started`
- [ ] vhost `cms.bitflix.com.br` — `not-started`
- [ ] `nginx -t && systemctl reload nginx` — `not-started`

### 6.7 Certbot prod
- [ ] Cert emitido apex + www + cms — `not-started`

### 6.8 Cutover DNS apex
- [ ] AGUARDA SINAL DO USUÁRIO — `not-started`
- [ ] A record `bitflix.com.br` repointado pra tomahawk — `not-started`
- [ ] Validação smoke test produção — `not-started`

### Acceptance criteria Fase 6
- [ ] `https://bitflix.com.br` home TLS válido — `not-started`
- [ ] `https://cms.bitflix.com.br/admin` Payload TLS — `not-started`
- [ ] `https://bitflix.com.br/admin` 404 — `not-started`
- [ ] Service auto-start após reboot — `not-started`
- [ ] `journalctl -u bitflix-lp` operacional — `not-started`
- [ ] TODO backup MinIO documentado em pendência — `not-started`

---

## Decisões tomadas durante execução

> Registrar aqui qualquer escolha não óbvia feita durante o MVP (versão exata de package, override de default, troca de approach). Cada entrada: data + fase + decisão + justificativa.

_(vazio)_

---

## Bloqueios e descobertas

> Registrar aqui qualquer obstáculo encontrado, sua causa e como foi resolvido. Inclui: incompatibilidades de versão, conflitos de porta, comportamentos inesperados de scaffold.

_(vazio)_

---

## Ações manuais do usuário pendentes

> Lista cumulativa de ações que SÓ o usuário pode fazer (login interativo, criação de conta, input de credencial). Marcar feito conforme acontecem.

- [ ] `gh auth login` em conta `meumlpontocom` (se não tiver) — Fase 1
- [ ] User no grupo `docker` na parrilla — Fase 1
- [ ] Criar primeiro user Milton no admin Payload via browser — Fase 1
- [ ] Gerar `PAYLOAD_SECRET` com `openssl rand -hex 32` — Fase 1
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
