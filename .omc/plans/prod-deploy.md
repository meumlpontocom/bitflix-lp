# Bitflix LP — Plano de Deploy Produção

> Plano dedicado de deploy do site em produção (tomahawk).
> Extraído de `.omc/plans/mvp.md` em 2026-04-29 — separado do MVP staging.
> Estimativa: 1 dia útil (após pré-requisitos preenchidos e testes em staging finalizados).

---

## Contexto

MVP staging (`https://staging.bitflix.com.br` + `https://staging.cms.bitflix.com.br/admin`) concluído em 2026-04-29 (Fases 1-5 do `mvp.md`).

Este plano executa SOMENTE quando:
1. Usuário validou manualmente o staging (criar artigo via admin, importar via skill, navegar todas as rotas, conferir slides reveal.js, OG images, RSS).
2. Pré-requisitos abaixo estão preenchidos.
3. Sinal explícito do usuário pra iniciar deploy prod.

---

## Pré-requisitos pendentes (input do usuário)

- [ ] **Estratégia de migração** da LP atual em `bitflix.com.br`: substituição direta vs redirect 301
- [ ] **WhatsApp number + mensagens default por CTA** preenchidos em `cms.bitflix.com.br/admin/globals/site-settings` (no staging primeiro)
- [ ] **Bio Milton + manifesto Bitflix** preenchidos no admin
- [ ] **Umami website ID** criado em `stats.bitflix.com.br/dashboard` (apontando pra `bitflix.com.br`)
- [ ] **E-mail institucional** decidido (ou pular)
- [ ] **Testes em staging concluídos** com resultado satisfatório

---

## Passos

### 1. Provisionar tomahawk
- SSH como root, criar dir `/application/bitflix-lp/` owner `meuml:meuml`
- Como `meuml`: `nvm install 24.15.0 && nvm use 24.15.0 && nvm alias default 24.15.0`
- `npm install -g pnpm@10.33.2`
- Clonar repo: `cd /application && git clone git@github.com:meumlpontocom/bitflix-lp.git`

### 2. DB + MinIO em VM `192.168.14.20`
- Conectar Postgres 17.5 da VM (pelo network interno do servidor físico)
- Criar DB + user: `CREATE DATABASE bitflix_lp; CREATE USER bitflix_lp WITH PASSWORD 'STRONG_RANDOM'; GRANT ALL ON DATABASE bitflix_lp TO bitflix_lp;`
- MinIO da VM: criar bucket `bitflix-lp-media` + access key dedicada com policy escopada ao bucket (read+write apenas)

### 3. `.env.production` em `/application/bitflix-lp/`
- Owner `meuml:meuml`, perms `0640`
- Valores: `DATABASE_URI` apontando VM, `S3_ENDPOINT=https://minio.bitflix.com.br`, `S3_BUCKET=bitflix-lp-media`, `PAYLOAD_PUBLIC_SERVER_URL=https://bitflix.com.br`, `BLOG_IMPORT_TOKEN=<random forte>`, `UMAMI_WEBSITE_ID=<id real>`, `UMAMI_SCRIPT_URL=https://stats.bitflix.com.br/script.js`

### 4. Build e migrations
- `cd /application/bitflix-lp && pnpm install --frozen-lockfile && pnpm build`
- `pnpm payload migrate` aplica schema no DB prod (push: false em prod — sem auto-push)
- Seed mínimo: `pnpm tsx scripts/seed-minimal.ts` (idempotente)

### 5. systemd unit
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

### 6. nginx vhosts prod
`/etc/nginx/sites-available/bitflix.com.br`:
```nginx
server {
  listen 80;
  server_name bitflix.com.br www.bitflix.com.br;
  location / {
    proxy_pass http://127.0.0.1:3060;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
  }
}
```
Idem `cms.bitflix.com.br` → mesmo upstream `127.0.0.1:3060`. Middleware Next roteia por hostname.
Symlink em `sites-enabled/` + `nginx -t && systemctl reload nginx`.

### 7. Certbot prod
- `certbot --nginx -d bitflix.com.br -d www.bitflix.com.br -d cms.bitflix.com.br --non-interactive --agree-tos --redirect -m miltonbastos@gmail.com`

### 8. Cutover DNS apex
- **AGUARDA SINAL DO USUÁRIO** com estratégia decidida
- Se substituição direta: trocar A record `bitflix.com.br` da LP antiga pra IP tomahawk; idem `www`
- Se redirect 301: deixar LP antiga, criar redirect server-level OU usar domínio temporário pra prod e tarefa separada

### 9. CI/CD (opcional pós-MVP)
- GitHub Actions workflow `.github/workflows/deploy.yml`:
  - Trigger: push em `main`
  - Steps: SSH em tomahawk via deploy key (não root), `cd /application/bitflix-lp`, `git pull`, `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm payload migrate`, `sudo systemctl restart bitflix-lp`
- Sudoers entry pra user `meuml` permitir `systemctl restart bitflix-lp` sem senha
- Marcar como "futuro" — deploy manual basta no primeiro release

---

## Acceptance criteria

- [ ] `https://bitflix.com.br` retorna home com TLS válido
- [ ] `https://www.bitflix.com.br` redireciona pro apex (ou serve o mesmo conteúdo)
- [ ] `https://cms.bitflix.com.br/admin` mostra Payload admin com TLS
- [ ] `https://bitflix.com.br/admin` retorna 404 (middleware bloqueou)
- [ ] `https://cms.bitflix.com.br/blog` retorna 404 (middleware bloqueou)
- [ ] Service `bitflix-lp` inicia automático após reboot tomahawk
- [ ] Logs visíveis em `journalctl -u bitflix-lp -f`
- [ ] Migration aplicada (`pnpm payload migrate` zero-to-up sem erro)
- [ ] Seed executado (Author Milton + 4 Products + Globals)
- [ ] Backup MinIO prod **TODO documentado** (não bloqueia release, mas registrar como pendência transversal)

---

## Pendências transversais (registrar conforme aparecer)

- Backup MinIO prod: adicionar `mc mirror` cron pra outro endpoint
- Newsletter (fora do MVP, fase 2 pós-launch)
- Multilíngue EN do site (fora do MVP)
- Comentários no blog (fora do MVP)

---

## Como continuar em sessão futura

1. Confirmar pré-requisitos preenchidos (lista no topo)
2. Confirmar testes em staging concluídos
3. Confirmar sinal explícito do usuário pra deploy prod
4. Executar passos 1-8 em sequência (passo 9 = pós-MVP)
5. Validar acceptance criteria
6. Criar `.omc/progress/prod-deploy.md` com snapshot do que rodou
