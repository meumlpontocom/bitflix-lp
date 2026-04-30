# Bitflix LP — Progresso de execução Deploy Produção

> Tracking de execução do plano `.omc/plans/prod-deploy.md`.
> Criado: 2026-04-30.
> Plano de origem: `.omc/plans/prod-deploy.md` + runbook completo em `docs/INFRA.md` seção 8.

---

## Status global

**Status overall:** `in-progress` (artefatos gerados, runbook na seção 8 de INFRA.md, aguardando execução manual no tomahawk pelo user)
**Próxima ação:** user executa runbook `docs/INFRA.md` seção 8.3 em diante (passos 8.1+8.2 já feitos paralelamente).
**Antes de começar nova sessão:** ler CLAUDE.md "Toolchain quirks" + `docs/INFRA.md` seção 8.

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
| 8.2 | Postgres VM 192.168.14.20 — DB+user criados | done (user rodou SQL) |
| 8.3 | Tomahawk: meuml + Node 24 + pnpm | not-started |
| 8.4 | Clonar repo em /application/bitflix-lp | not-started |
| 8.5 | Configurar .env.production | not-started |
| 8.6 | Subir compose prod (build + up) | not-started |
| 8.7 | Migrations + seed | not-started |
| 8.8 | nginx vhosts + certbot (cms + minio.cms) | not-started |
| 8.9 | systemd autostart compose | not-started |
| 8.10 | Cutover DNS apex (`@` + cert apex/www) | not-started |
| 8.11 | Acceptance criteria | not-started |

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

## Bloqueios e descobertas

(nenhum até agora — atualizar conforme execução)

---

## Ações manuais do usuário pendentes

- [x] DNS Cloudflare: `cms`, `www`, `minio.cms` apontando `184.171.240.212` — done 2026-04-30
- [x] Postgres VM: criar DB+user `bitflix_lp_prod` — done 2026-04-30 (user passou senha)
- [x] pg_hba VM: liberar `184.171.240.212` — done 2026-04-30 (user confirmou)
- [ ] Tomahawk: instalar Node 24 + pnpm 10 + git em user `meuml` — passo 8.3
- [ ] Tomahawk: clonar repo em `/application/bitflix-lp/` — passo 8.4
- [ ] Tomahawk: criar `.env.production` com secrets gerados — passo 8.5
- [ ] Tomahawk: `docker compose build + up` — passo 8.6
- [ ] Tomahawk: `payload migrate` + seed — passo 8.7
- [ ] Tomahawk: nginx + certbot pra `cms` + `minio.cms` — passo 8.8
- [ ] Tomahawk: enable systemd unit — passo 8.9
- [ ] Cloudflare: criar/editar A record apex `@` → `184.171.240.212` (CUTOVER) — passo 8.10
- [ ] Tomahawk: certbot pra apex + www — passo 8.10
- [ ] Smoke test final + acceptance criteria — passo 8.11

---

## Como retomar em sessão futura

1. Ler `CLAUDE.md` (estado atual + toolchain quirks)
2. Ler `docs/INFRA.md` seção 8 (runbook copy-paste)
3. Ler este arquivo (estado dos passos)
4. Verificar último passo `not-started` ou `in-progress`
5. Se user já rodou parte do runbook: validar via `curl` (Claude tem acesso HTTPS público)
6. Atualizar este arquivo (status + timestamp + bloqueios), commit, push
