# Bitflix LP — Infraestrutura, Ambientes e Deploy

> Servidores, deploy, redes, secrets.
> Última atualização: 2026-04-29.

---

## 1. Visão geral

Dois ambientes:

| Ambiente | Host | Localização |
|----------|------|-------------|
| **Dev/Staging** | `parrilla` | máquina local do user (Linux) |
| **Produção** | `tomahawk` | servidor dedicado Bitflix |

DB e MinIO de produção rodam em VM separada no mesmo servidor físico do tomahawk.
DB e MinIO de staging rodam em containers no docker-compose da parrilla.

---

## 2. Parrilla (dev/staging)

### Hardware/OS
- Ubuntu 24.04.4 LTS, kernel 6.17.
- Hostname: `parrilla2`.
- 16 vCPU, 30GB RAM, 591GB free (32% usado).
- IP público fixo: `45.182.133.84`.
- nginx 1.24.0 + certbot 2.9.0 já instalados e gerenciando vários sites.

### Stack já em uso
- Docker 29.1.3 + Compose v2.40.3.
- Node 24.15.0 + pnpm 10.32.0 globais (alinha com versões alvo do projeto).
- Vários containers (postgres, redis) de outros projetos. Convenção: cada projeto = compose dedicado, naming `<projeto>-<servico>`.
- nginx com vhosts: `marketflix-dev`, `portal`, `systennis-dev`, `wyms.bitflix.com.br`, etc.

### Portas livres confirmadas
- App Next/Payload staging: `3023` (local bind, internal-only).
- MinIO staging: portas internas ao compose (não expor ao host parrilla).
- Postgres staging: interno ao compose (não expor ao host).

### docker-compose (a criar em `/home/bitflix/claude_projetos/bitflix_lp/docker-compose.yml`)
- Network `bitflix-lp-net`.
- Service `bitflix-lp-postgres`: image `postgres:17`, volume `bitflix_lp_pg_data`. Sem expose ao host.
- Service `bitflix-lp-minio`: image `minio/minio:RELEASE.2025-09-07T16-13-09Z`, volume `bitflix_lp_minio_data`. API e console em portas internas.
- Service `bitflix-lp-mc-init`: one-shot que roda `mc mb` para criar bucket `bitflix-lp-staging-media` + cria access key dedicada na primeira subida.
- Service `bitflix-lp-app`: imagem custom (Node 24 + pnpm 10) rodando Next dev mode. Source bind-mounted de `/home/bitflix/claude_projetos/bitflix_lp/`. Expõe `127.0.0.1:3023`.

### nginx vhosts (parrilla)
- `staging.bitflix.com.br` → proxy_pass `http://127.0.0.1:3023` (site público staging)
- `staging.cms.bitflix.com.br` → proxy_pass `http://127.0.0.1:3023` (admin staging — middleware Next roteia por hostname)
- `staging.minio.bitflix.com.br` → proxy_pass console MinIO interno do compose

Cada vhost com Let's Encrypt via certbot. Cloudflare apenas DNS A apontando para `45.182.133.84`.

### User docker
Adicionar user atual ao grupo docker:
```bash
sudo usermod -aG docker $USER && newgrp docker
```

---

## 3. Tomahawk (produção)

### Hardware/OS
- Ubuntu 24.04.4 LTS.
- Hostname: `tomahawk`.
- 4 vCPU, 31GB RAM, 38GB disk (57% usado, 17GB livres — apertado para crescimento; expandir partição se blog crescer).
- Vários sites coabitam (app2.meuml.com, app.systennis.com.br, app.marketflix.ai, postflix.ai, qualjogador.com.br, fonsequinha.com.br, n8n.bitflix.com.br, agentes.bitflix.com.br, etc).

### Acesso
- SSH via senha de root (atual).
- **Para CI/CD futuro**: criar chave SSH dedicada no user `meuml`, sem senha, com sudo específico apenas para `systemctl restart bitflix-lp`. Não usar root pra deploy automatizado.

### Convenções existentes (replicar)
- **Path apps**: `/application/<projeto>/` (padrão dos apps mais novos como marketflix). Bitflix-lp vai em `/application/bitflix-lp/`.
- **User**: `meuml` (uid 1000) é o único user não-root; todos os apps rodam sob ele.
- **Service**: `<projeto>.service` (systemd). Sem PM2 (apesar de existir em alguns apps antigos — projeto novo segue systemd direto).
- **Reverse proxy**: nginx 1.24.0 com vhosts em `/etc/nginx/sites-available/` linkados em `sites-enabled/`.
- **TLS**: certbot 5.5.0 emite cert por hostname. Renovação automática.
- **DNS**: Cloudflare (A records, sem proxy CDN).
- **Logs**: journald (`journalctl -u bitflix-lp`).
- **Node multi-versão**: Node 20 atual via NVM em `/root/.nvm`. Para bitflix-lp: instalar Node 24 LTS via NVM no user `meuml`. `.nvmrc` no repo trava versão.
- **pnpm**: instalar globalmente (não existe hoje no tomahawk).

### DB + MinIO em VM externa (192.168.14.20, mesmo servidor físico)
- **Postgres 17.5** rodando, vários DBs de outros projetos. Criar DB `bitflix_lp` + user `bitflix_lp` com senha forte (sob demanda quando começar deploy prod).
- **MinIO** rodando, expõe externamente via `minio.bitflix.com.br`. Criar bucket `bitflix-lp-media` + access key/secret dedicados (escopo só ao bucket) sob demanda.

### Subdomínios prod
- `bitflix.com.br` + `www.bitflix.com.br` → site público (porta interna `3060`)
- `cms.bitflix.com.br` → admin Payload (mesmo container, middleware Next roteia)

### Migração DNS apex
- Hoje `bitflix.com.br` aponta para LP draft AI em outra hospedagem.
- DNS via Cloudflare (sem proxy/CDN); repointar A record para tomahawk IP é trivial.
- Subdomínios já apontando para tomahawk: `agentes.`, `hd4k.`, `minio.`, `n8n.`, `pereira.`, `painel.minio.`, `stats.`.
- Estratégia de cutover (ainda a definir com user): redirect 301 da LP atual? Substituição direta? A definir.

---

## 4. Cloudflare DNS

- **Apenas DNS** (sem proxy/CDN).
- A records:
  - `bitflix.com.br` → IP do tomahawk (hoje aponta pra outro lugar; cutover pendente)
  - `www.bitflix.com.br` → IP do tomahawk
  - `cms.bitflix.com.br` → IP do tomahawk
  - `staging.bitflix.com.br` → `45.182.133.84` (parrilla)
  - `staging.cms.bitflix.com.br` → `45.182.133.84`
  - `staging.minio.bitflix.com.br` → `45.182.133.84`
- **Cloudflare Access**: desligado no MVP. Pode ativar depois se bot scanning incomodar.

---

## 5. Backups

- **Postgres prod (em 192.168.14.20)**: dump diário existente cobre o DB.
- **MinIO prod**: SEM backup configurado. **TODO**: adicionar `mc mirror` cron pra outro endpoint quando estabilizar (uploads do admin sem backup viram órfãos em desastre).
- **Código**: GitHub `meumlpontocom/bitflix-lp` privado.
- **Staging**: não precisa backup (descartável; user pode resetar a qualquer momento).

---

## 6. Secrets

Strategy: **`.env` simples**.
- `.env.example` versionado no repo com placeholders descritivos.
- `.env` NUNCA commitado (já no `.gitignore`).
- Permissões `0640`, owner `meuml:meuml`.
- Cópia manual para cada ambiente:
  - Staging (parrilla): `/home/bitflix/claude_projetos/bitflix_lp/.env` (ou `.env.local` para Next).
  - Prod (tomahawk): `/application/bitflix-lp/.env.production`.
- Sem Doppler/Infisical no MVP.

Lista de env vars em `docs/CONVENTIONS.md` seção "Operational Configuration".

---

## 7. Deploy staging parrilla (Fase 5) — runbook

Artefatos prontos em `infra/staging/`:
- `staging.bitflix.com.br.conf` — vhost site público
- `staging.cms.bitflix.com.br.conf` — vhost admin Payload
- `bitflix-lp-staging.service` — systemd unit autostart compose

### 7.1 DNS Cloudflare (manual no painel)

Criar dois A records (DNS only, sem proxy/CDN):

| Tipo | Nome | Conteúdo | Proxy |
|------|------|----------|-------|
| A | `staging.bitflix.com.br` | `45.182.133.84` | DNS only |
| A | `staging.cms.bitflix.com.br` | `45.182.133.84` | DNS only |

Validar (esperar até 5 min de propagação):
```bash
dig +short staging.bitflix.com.br A @1.1.1.1     # → 45.182.133.84
dig +short staging.cms.bitflix.com.br A @1.1.1.1 # → 45.182.133.84
```

### 7.2 nginx vhosts + certbot

Rodar como root (ou com `sudo`) na parrilla. Os arquivos em `infra/staging/*.conf` são HTTP-only — `certbot --nginx` injeta o bloco 443 (SSL) automaticamente após emitir cert.

```bash
cd /home/bitflix/claude_projetos/bitflix_lp

# 1) Instala vhosts HTTP-only e habilita
sudo cp infra/staging/staging.bitflix.com.br.conf /etc/nginx/sites-available/
sudo cp infra/staging/staging.cms.bitflix.com.br.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/staging.bitflix.com.br.conf     /etc/nginx/sites-enabled/staging.bitflix.com.br
sudo ln -sf /etc/nginx/sites-available/staging.cms.bitflix.com.br.conf /etc/nginx/sites-enabled/staging.cms.bitflix.com.br

# 2) Testa + reload (com vhosts HTTP-only nginx -t deve passar)
sudo nginx -t
sudo systemctl reload nginx

# 3) Emite cert e deixa certbot injetar SSL nas vhosts (modo --nginx, NÃO certonly)
sudo certbot --nginx \
  -d staging.bitflix.com.br \
  -d staging.cms.bitflix.com.br \
  --non-interactive --agree-tos --redirect \
  -m miltonbastos@gmail.com

# 4) Verifica que vhosts foram atualizados com bloco 443 + redirect
sudo nginx -t
sudo systemctl reload nginx

# 5) Renovação automática (já ativa via certbot.timer)
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

> ⚠️ **Após editar `.env`**, sempre `docker compose up -d --force-recreate bitflix-lp-app`. `docker compose restart` NÃO recarrega env vars (mantém vars antigas do compose initial). Confirmar com `docker compose exec -T bitflix-lp-app printenv PAYLOAD_PUBLIC_SERVER_URL`. Bug que causou 403 em todos os saves do admin em 2026-04-29.

### 7.3 systemd autostart compose

```bash
sudo cp infra/staging/bitflix-lp-staging.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable bitflix-lp-staging.service

# Testar (não precisa rebootar; compose já tá up)
sudo systemctl status bitflix-lp-staging.service
```

### 7.4 Smoke test pós-deploy

```bash
curl -I https://staging.bitflix.com.br                    # 200, TLS válido
curl -I https://staging.cms.bitflix.com.br/admin          # 200/302, admin Payload
curl -I https://staging.bitflix.com.br/admin              # 404 (middleware bloqueia)
curl -I https://staging.cms.bitflix.com.br/blog           # 404 (middleware bloqueia)
```

Acceptance Fase 5 completa quando os 4 testes passarem + reboot da parrilla traz compose up automático.

---

## 8. Deploy prod tomahawk — runbook

Arquitetura prod: app + MinIO em compose (`docker-compose.prod.yml`), Postgres externo (`192.168.14.20:6432`), nginx + certbot no host, systemd autostart compose.

Artefatos prontos no repo:
- `Dockerfile.prod` — multi-stage build (deps → builder → runner)
- `docker-compose.prod.yml` — services `bitflix-lp-prod-{minio,mc-init,app}`
- `infra/prod/bitflix.com.br.conf` — vhost site público (apex + www)
- `infra/prod/cms.bitflix.com.br.conf` — vhost admin Payload
- `infra/prod/minio.cms.bitflix.com.br.conf` — vhost MinIO console
- `infra/prod/bitflix-lp-prod.service` — systemd unit autostart compose
- `.env.production.example` — template

### 8.1 DNS Cloudflare (manual no painel)

Criar A records (DNS only, sem proxy/CDN). Apex `@` por último (cutover final):

| Tipo | Nome | Conteúdo | Proxy | Quando |
|------|------|----------|-------|--------|
| A | `cms` | `184.171.240.212` | DNS only | AGORA |
| A | `www` | `184.171.240.212` | DNS only | AGORA |
| A | `minio.cms` | `184.171.240.212` | DNS only | AGORA |
| A | `@` (apex `bitflix.com.br`) | `184.171.240.212` | DNS only | DEPOIS — passo 8.10 |

Validar (esperar até 5 min de propagação):
```bash
dig +short cms.bitflix.com.br A @1.1.1.1
dig +short www.bitflix.com.br A @1.1.1.1
dig +short minio.cms.bitflix.com.br A @1.1.1.1
# Todos devem retornar 184.171.240.212
```

### 8.2 Provisionar Postgres na VM 192.168.14.20

Conectar como superuser e criar DB+user. Senha forte gerada externamente (`openssl rand -hex 24`).

```sql
-- psql -h 192.168.14.20 -p 6432 -U postgres
CREATE DATABASE bitflix_lp_prod
  WITH ENCODING = 'UTF8'
       LC_COLLATE = 'C.UTF-8'
       LC_CTYPE = 'C.UTF-8'
       TEMPLATE = template0;

CREATE USER bitflix_lp_prod WITH PASSWORD '<HEX_GERADO>';

GRANT ALL PRIVILEGES ON DATABASE bitflix_lp_prod TO bitflix_lp_prod;

\c bitflix_lp_prod
GRANT ALL ON SCHEMA public TO bitflix_lp_prod;
ALTER SCHEMA public OWNER TO bitflix_lp_prod;
\q
```

`pg_hba.conf` da VM precisa permitir conexão do tomahawk (`184.171.240.212`):
```
host bitflix_lp_prod bitflix_lp_prod 184.171.240.212/32 scram-sha-256
```
Após editar: `sudo systemctl reload postgresql` na VM.

Validar do tomahawk:
```bash
PGPASSWORD='<HEX>' psql -h 192.168.14.20 -p 6432 -U bitflix_lp_prod -d bitflix_lp_prod -c '\dt'
# Deve listar 0 tabelas sem erro de auth.
```

### 8.3 Tomahawk: usuário, Node, pnpm

Como root no tomahawk:
```bash
# Path padrão dos apps
mkdir -p /application
chown meuml:meuml /application
```

Como `meuml`:
```bash
# Node 24 LTS via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 24.15.0
nvm alias default 24.15.0
nvm use 24.15.0

# pnpm 10.33.2 via corepack (vem com Node 24)
corepack enable
corepack prepare pnpm@10.33.2 --activate

# Validar
node --version   # v24.15.0
pnpm --version   # 10.33.2
docker --version # já instalado, validar versão
```

### 8.4 Clonar repo

Como `meuml`:
```bash
cd /application
git clone https://github.com/meumlpontocom/bitflix-lp.git
cd bitflix-lp
```

Se SSH key configurada: `git clone git@github.com:meumlpontocom/bitflix-lp.git`.

### 8.5 Configurar `.env.production`

```bash
cd /application/bitflix-lp
cp .env.production.example .env.production
chmod 0640 .env.production
chown meuml:meuml .env.production
```

Editar `.env.production` e preencher os secrets (`nano` ou editor de escolha):
```bash
# Gerar valores faltantes:
echo "PAYLOAD_SECRET=$(openssl rand -hex 32)"
echo "MINIO_ROOT_PASSWORD=$(openssl rand -hex 24)"
echo "S3_SECRET_KEY=$(openssl rand -hex 24)"
echo "BLOG_IMPORT_TOKEN=$(openssl rand -hex 32)"
```

Os campos:
- `DATABASE_URI` — pré-preenchido com placeholders; substituir pelo URI real (host/porta/senha)
- `PAYLOAD_SECRET` — `openssl rand -hex 32` (acima)
- `MINIO_ROOT_PASSWORD` — `openssl rand -hex 24` (acima); `MINIO_ROOT_USER` deixa `minio_root`
- `S3_SECRET_KEY` — `openssl rand -hex 24` (acima); `S3_ACCESS_KEY` deixa `bitflix_lp_app`
- `BLOG_IMPORT_TOKEN` — `openssl rand -hex 32` (acima)
- `UMAMI_WEBSITE_ID` — copiar do `stats.bitflix.com.br/dashboard` (criar website pra `bitflix.com.br` se ainda não existe)
- `LLM_API_KEY` — opcional (skill `/blog-import` no host claude usa, server prod não precisa)

### 8.6 Subir compose prod

```bash
cd /application/bitflix-lp

# Adicionar meuml ao grupo docker (se não estiver)
sudo usermod -aG docker meuml
newgrp docker

# Build + up. Pode levar 3-5 min na primeira vez (pnpm install + next build).
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# Logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f bitflix-lp-prod-app
```

Esperar log `Next.js 15.5.15 Ready in Xs` e `Started server on 0.0.0.0:3000`. Container deve aparecer healthy.

Validar:
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
# Esperar: bitflix-lp-prod-app + bitflix-lp-prod-minio com status "Up"
# bitflix-lp-prod-mc-init exited(0) (one-shot OK)

curl -I http://127.0.0.1:3060
# Esperar 200 com Server: Next.js
```

### 8.7 Migrations + seed

Container app já fez build (`pnpm build`). Em prod, schema é aplicado via `payload migrate` (não auto-push).

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T bitflix-lp-prod-app pnpm payload migrate
# Esperar: "Migration applied" (snapshot 20260429_220628_initial)

# Seed mínimo idempotente (Author Milton + 4 Products + Globals)
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T bitflix-lp-prod-app pnpm seed
```

### 8.8 nginx vhosts + certbot

Como root:
```bash
cd /application/bitflix-lp

# 1) Instala vhosts HTTP-only
sudo cp infra/prod/bitflix.com.br.conf       /etc/nginx/sites-available/
sudo cp infra/prod/cms.bitflix.com.br.conf   /etc/nginx/sites-available/
sudo cp infra/prod/minio.cms.bitflix.com.br.conf /etc/nginx/sites-available/

sudo ln -sf /etc/nginx/sites-available/bitflix.com.br.conf       /etc/nginx/sites-enabled/bitflix.com.br
sudo ln -sf /etc/nginx/sites-available/cms.bitflix.com.br.conf   /etc/nginx/sites-enabled/cms.bitflix.com.br
sudo ln -sf /etc/nginx/sites-available/minio.cms.bitflix.com.br.conf /etc/nginx/sites-enabled/minio.cms.bitflix.com.br

# 2) Testa + reload (HTTP-only deve passar)
sudo nginx -t
sudo systemctl reload nginx

# 3) Smoke HTTP antes do cert (ainda sem TLS)
curl -I -H "Host: cms.bitflix.com.br" http://127.0.0.1
curl -I -H "Host: minio.cms.bitflix.com.br" http://127.0.0.1
# Esperar 200/302/403 (não 404). cms deve responder Payload admin.

# 4) Emite certs Let's Encrypt + injeta SSL nos vhosts (modo --nginx)
# IMPORTANTE: NÃO incluir bitflix.com.br/www aqui ainda — apex DNS ainda aponta pra LP antiga.
sudo certbot --nginx \
  -d cms.bitflix.com.br \
  -d minio.cms.bitflix.com.br \
  --non-interactive --agree-tos --redirect \
  -m miltonbastos@gmail.com

sudo nginx -t
sudo systemctl reload nginx
```

Validar TLS dos 2 hostnames já apontando:
```bash
curl -I https://cms.bitflix.com.br/admin               # 200, admin Payload
curl -I https://minio.cms.bitflix.com.br               # 307 → /login (MinIO console)
curl -I https://cms.bitflix.com.br/blog                # 404 (middleware bloqueia)
```

### 8.9 systemd autostart compose

```bash
sudo cp infra/prod/bitflix-lp-prod.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable bitflix-lp-prod.service

# Validar (compose já está up; enable só ativa autostart no boot)
sudo systemctl status bitflix-lp-prod.service
```

> ⚠️ **Após editar `.env.production`**, sempre `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate bitflix-lp-prod-app`. `restart` NÃO recarrega env vars (mesmo bug do staging em 2026-04-29).

### 8.10 Cutover DNS apex

Quando passos 8.1–8.9 estiverem OK e admin/MinIO console acessíveis com TLS:

1. Cloudflare painel → criar A record:

   | Tipo | Nome | Conteúdo | Proxy |
   |------|------|----------|-------|
   | A | `@` | `184.171.240.212` | DNS only |

   (Se já existe apontando pra LP antiga: editar pra `184.171.240.212`.)

2. Aguardar propagação (Cloudflare TTL Auto = 5 min com DNS only):
   ```bash
   dig +short bitflix.com.br A @1.1.1.1
   # Deve retornar 184.171.240.212
   ```

3. Emitir cert pro apex + www:
   ```bash
   sudo certbot --nginx \
     -d bitflix.com.br -d www.bitflix.com.br \
     --non-interactive --agree-tos --redirect \
     -m miltonbastos@gmail.com

   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Smoke final:
   ```bash
   curl -I https://bitflix.com.br                  # 200
   curl -I https://www.bitflix.com.br              # 200 ou 301 → apex
   curl -I https://bitflix.com.br/admin            # 404 (middleware)
   curl -I https://bitflix.com.br/blog             # 200
   curl -I https://bitflix.com.br/sitemap.xml      # 200
   curl -I https://bitflix.com.br/blog/feed.xml    # 200
   curl -I https://cms.bitflix.com.br/blog         # 404 (middleware)
   curl -sI https://bitflix.com.br/og/test | head -5
   ```

5. Renovação automática de certs:
   ```bash
   sudo systemctl status certbot.timer
   sudo certbot renew --dry-run
   ```

### 8.11 Acceptance criteria

- [ ] DNS cms/www/minio.cms resolvem `184.171.240.212`
- [ ] DB `bitflix_lp_prod` acessível do tomahawk (`pg_hba` liberado)
- [ ] `docker compose ps` mostra app + minio Up + mc-init exit(0)
- [ ] `pnpm payload migrate` aplicou migrations
- [ ] `pnpm seed` rodou sem erro (4 Products + 7 Globals + Author Milton criados)
- [ ] `https://cms.bitflix.com.br/admin` → 200 + login funciona
- [ ] `https://minio.cms.bitflix.com.br` → console MinIO acessível
- [ ] systemd `bitflix-lp-prod.service` enabled
- [ ] DNS apex cutover OK
- [ ] `https://bitflix.com.br/blog/<slug>` renderiza artigo
- [ ] `https://bitflix.com.br/og/<slug>` retorna PNG
- [ ] `https://bitflix.com.br/blog/feed.xml` válido (W3C)

### 8.12 Operação dia-a-dia

```bash
# Logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f bitflix-lp-prod-app

# Reload após mudança em .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate bitflix-lp-prod-app

# Deploy nova versão (após git pull)
cd /application/bitflix-lp
git pull origin main
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build bitflix-lp-prod-app
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T bitflix-lp-prod-app pnpm payload migrate
```

CI/CD (futuro): GitHub Actions workflow em push pra `main` → SSH tomahawk → `git pull` + rebuild compose. Deploy manual basta no MVP.
