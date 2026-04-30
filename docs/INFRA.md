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

## 8. Deploy prod (plano dedicado em `.omc/plans/prod-deploy.md`)

Plano provisório:
1. Criar user `deploy` (ou usar `meuml`) com chave SSH dedicada, sem senha.
2. GitHub Actions workflow: on push to `main`, faz SSH para tomahawk, `git pull` em `/application/bitflix-lp`, `pnpm install`, `pnpm build`, `systemctl restart bitflix-lp`.
3. systemd unit `/etc/systemd/system/bitflix-lp.service`:
   ```ini
   [Service]
   Type=simple
   User=meuml
   WorkingDirectory=/application/bitflix-lp
   EnvironmentFile=/application/bitflix-lp/.env.production
   ExecStart=/home/meuml/.nvm/versions/node/v24.15.0/bin/node node_modules/.bin/next start -p 3060
   Restart=always
   RestartSec=5
   ```
4. nginx vhosts prod (`bitflix.com.br`, `www.bitflix.com.br`, `cms.bitflix.com.br`) com proxy_pass para `http://127.0.0.1:3060` + cert via certbot.
5. Cutover DNS Cloudflare apex.

Detalhes completos do deploy em `.omc/plans/prod-deploy.md`.
