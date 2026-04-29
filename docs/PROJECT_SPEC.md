# Bitflix LP — Product, Brand & Editorial Spec

> Decisões de produto, identidade visual e estratégia editorial.
> Última atualização: 2026-04-29.

---

## 1. Posicionamento e diferencial

Bitflix posiciona-se como dev house que **constrói software para entregar IA ao cliente final**, em oposição ao mainstream "usamos IA pra desenvolver software". A IA é o produto entregue, não ferramenta interna de produtividade.

**Por quê**: diferenciação contra agências e consultorias que apenas adotaram Copilot/Cursor internamente. Bitflix entrega capacidade de IA embarcada nos produtos do cliente.

**Como aplicar em copy**: enquadrar entregas como "IA chegando no cliente final do cliente", "IA embarcada no produto", "IA como recurso do software entregue". NUNCA como "produtividade interna do dev".

---

## 2. Estrutura de ofertas

Dois trilhos comerciais distintos, com CTAs separados no site:

1. **SaaS** — alvo principal pequenas empresas (volume, ticket baixo, escalável). Também disponível para médias/grandes.
2. **Projetos personalizados sob demanda** — exclusivo para médias/grandes empresas.

Blog não segmenta por trilho — é canal de autoridade independente que atinge audiência ampla (devs, empresários, curiosos IA).

---

## 3. Inventário de produtos próprios (em 2026-04-29)

| Produto | Status | Domínio |
|---------|--------|---------|
| meuml | Produção | meuml.com |
| postflix | Produção | postflix.ai |
| marketflix | Recém-lançado | marketflix.ai |
| kronikor | Em desenvolvimento | kronikor.com |

**Tratamento no site bitflix.com.br**:
- Cada produto = card resumo na home + entrada em `/produtos`.
- CTA "saiba mais" redireciona ao **domínio próprio** do SaaS.
- NÃO duplicar conteúdo de venda dentro de bitflix.com.br (canonical hell + manutenção dupla).
- Bitflix.com.br = institucional + portfólio, NÃO vitrine de venda.

**Cases de clientes custom**: NÃO exibir no site (NDA / propriedade do cliente). Se aparecer, usar genéricos ("indústria X", "varejo Y"), NUNCA citar nome.

---

## 4. Identidade visual

### Logo
- Arquivos oficiais: `/home/bitflix/Downloads/logo_bitflix(2).zip`
  - `IconLogoBitFlix-New-jul-2018.png` (832x858 RGBA, ícone só)
  - `LogoBitFlix-New-2018.png` (670x206, wordmark + ícone)
- Wordmark "bitflix" lowercase + ícone circular com barras de gráfico ascendente.
- Estilo: geometric sans rounded, friendly-tech.
- **Restrição**: PNG com fundo transparente só funciona sobre fundo BRANCO. Outras cores ficam ruins. Para hero/seções escuras, precisaria gerar variante alternativa monocromática branca (não usado no MVP — site é light).

### Paleta extraída
- `#003030` teal quase-preto (contorno do ícone)
- `#005060` teal escuro
- `#006070` teal médio-escuro
- `#008090` teal médio (accent principal)
- `#00a0a0` teal claro (hover/destaque)
- `#2d2d2d` cinza escuro (cor do "bit" no wordmark — usado em texto)

### Direção visual MVP
- **Light mode primário, sem dark mode**.
- Fundo principal: branco (`#FFFFFF`) ou off-white (`#FAFAFA`).
- Fundo alternativo (seções de quebra): bege creme quente (~`#F8EAD7`–`#FBF1E1`). Referência visual: site Vanna AI.
- Textura sutil: grid de pontos finos sobre o bege para densidade visual.
- Texto: cinza escuro `#2d2d2d` (nunca preto puro).
- Cards: fundo branco, border 1px `#E5E5E5`, soft shadow (`0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)`), border-radius 12-16px.
- CTAs primários: pílulas teal preenchidas (`#008090`), texto branco, hover escurece para `#003030`.
- CTAs secundários: borda teal, texto teal, fundo transparente, hover preenche.

### Hero
- Fundo bege com dot grid + logo full color centralizada.
- Seções intercaladas branco/bege ao longo da página.
- Footer bege.
- Blog listing branco. Article body branco (legibilidade).

### Tipografia
- **Heading + body**: Geist Sans (Vercel/Google Fonts).
- **Mono (code blocks, números monoespaçados em métricas)**: Geist Mono.
- Self-host via `next/font` para zero CLS, zero fetch externo, type-safe.
- Tailwind config: `fontFamily.sans = ['var(--font-geist-sans)', ...]`, `fontFamily.mono = ['var(--font-geist-mono)', ...]`.

Preview tipográfico: `typography-preview.html` na raiz (gerado durante grill, mostrava 5 opções; vencedora foi B = Geist).

---

## 5. Mapa de páginas (MVP)

| Page | Descrição |
|------|-----------|
| `/` | Hero (manifesto) + diferencial + vitrine produtos cards + trilho custom resumido + últimos posts blog + CTA WhatsApp. |
| `/produtos` | Grid dos 4 SaaS. Cards detalhados, cada um com CTA externo para o domínio próprio. |
| `/servicos` | Trilho custom (mid/large): tipos de projeto, processo, stack, CTA orçamento via WhatsApp. |
| `/sobre` | Quem é Bitflix + manifesto IA-pro-cliente + bio Milton. Sem foto. |
| `/blog` | Listing com filtros (categoria, tag), busca opcional. |
| `/blog/[slug]` | Artigo individual: cover, título, body Lexical renderizado, bottom de fonte original (link clicável), disclaimer IA. |
| `/blog/[slug]/slides` | Versão slides (reveal.js), atalhos teclado, fullscreen, export PDF nativo. |
| `/contato` | Texto curto + botão WhatsApp + e-mail (futuro). Sem form. |
| `/blog/feed.xml` | RSS feed automático (últimos 30 posts). |
| `/og/[slug]` | OG image dinâmica (1200x630). |
| `404`, `500` | Error pages. |

Fora do MVP (fase 2): newsletter, cases públicos com cliente, carreiras, multilíngue EN, comentários no blog.

---

## 6. Cover image dos artigos

**Pipeline default**: composição tipográfica gerada server-side via `@vercel/og` em `/og/[slug]/route.ts`.
- Output PNG 1200x630.
- Layout: gradient teal Bitflix + dot grid sutil, título do artigo em Geist Bold, categoria como badge teal, logo Bitflix no canto.
- Identidade unificada do blog (todos os cards do listing parecem da mesma marca).

**Override pontual**: campo `cover_image_override` no Article schema permite upload manual de imagem AI (Flux/Imagen/DALL-E) ou foto quando o artigo pedir ilustração temática específica. Sobrescreve o OG dinâmico.

---

## 7. Estratégia editorial do blog

### Entrada de conteúdo
Skill `/blog-import` aceita dois modos:
- **URL**: artigo EN (ou outro idioma) → fetch + extract + traduzir + adaptar + formatar.
- **Texto PT-BR**: usuário cola direto → compila + formata + adapta voz Bitflix + gera slides.

Fonte é livre (qualquer tipo: blog lab, Substack, paper, news, post LinkedIn, transcrição).

### Voz e adaptação
- NÃO é tradução fiel — é **adaptação editorial**:
  - Reescreve intro/outro com voz Bitflix.
  - Adiciona contexto BR quando útil (cases nacionais, regulação local).
  - Aplica viés do manifesto: "IA chegando ao cliente final".
  - Marca artigos com adaptação forte com tag `[Bitflix Take]`.

### Tamanho
Sem mínimo nem máximo. Skill respeita o que o conteúdo pede — corta gordura, mantém substância.

### Cadência
Livre. Sem rotina fixa. Publica quando faz sentido.

### Autoria
- Todos os artigos assinados por **Milton Bastos**.
- Sem foto por enquanto (bio textual basta no `/sobre` e author block).
- Authors Collection com slot único `milton-bastos` no MVP.

### Citação de fonte (sempre obrigatória)
- Bottom de cada artigo: bloco "Fonte original" com título + autor + site + data + URL clicável.
- Campo `source` no Article schema: object com `original_title`, `original_author`, `original_site`, `original_url`, `original_published_at`, `license_note` opcional.

### Disclaimer de IA (transparência total)
- Footer do artigo: "Tradução e adaptação por Bitflix com assistência de IA, revisado por Milton Bastos."
- Ajustar por modo: "Compilação editorial Bitflix com assistência de IA" para artigos vindos de texto PT-BR.
- Campo `disclaimer_variant` no Article: enum `ai-translated`, `ai-adapted-from-text`, `original`.

### Taxonomia dinâmica
- **NÃO criar categorias seed**.
- Skill avalia conteúdo, sugere categoria existente (se houver match) ou propõe nova; user aprova no admin antes de publicar.
- Tags: 5–10 por artigo, geradas pela skill, livres, podem repetir entre artigos.

---

## 8. Article schema (Payload Collection)

Campos previstos:
- `title` (string, required)
- `slug` (string, unique, gerado a partir do title)
- `excerpt` (string, ~200 char)
- `body_lexical` (Lexical rich text JSON)
- `cover_image` (Media, default placeholder gerado dinamicamente via OG)
- `cover_image_override` (Media, opcional, sobrescreve cover dinâmico)
- `source` (group):
  - `original_title` (string)
  - `original_author` (string)
  - `original_site` (string)
  - `original_url` (string, URL)
  - `original_published_at` (date, opcional)
  - `license_note` (text, opcional)
- `categories` (relationship m2m → Categories)
- `tags` (relationship m2m → Tags)
- `author` (relationship → Authors, default = `milton-bastos`)
- `language_origin` (select: `en`, `pt-br`, `other`)
- `has_slides` (boolean)
- `slides_blocks` (array, blocks de slide):
  - `slide_title` (string)
  - `slide_content` (Lexical or markdown simples)
  - `slide_image` (Media, opcional)
  - `speaker_notes` (text, opcional)
- `disclaimer_variant` (select: `ai-translated`, `ai-adapted-from-text`, `original`)
- `is_bitflix_take` (boolean) — flag pra mostrar tag `[Bitflix Take]`
- `status` (select: `draft`, `review`, `published`, default `draft`)
- `published_at` (date, nullable)
- `is_active` (boolean, default true) — soft-delete
- `created_at`, `updated_at` (timestamps automáticos)
- `created_via` (select: `manual`, `blog-import-skill`) — auditoria

---

## 9. Slides render

- Lib: `reveal.js` ^5 (npm).
- Componente Next client wrapper em `src/components/blog/slide-deck.tsx`.
- Recebe array de slide blocks (JSON) do Payload e renderiza navegável.
- Tema custom CSS aplicando paleta Bitflix (teal accent, fundo creme bege, fonte Geist).
- Atalhos teclado: setas, fullscreen `F`, overview `ESC`, speaker view `S`.
- Export PDF: built-in Reveal.js (`?print-pdf`).

---

## 10. Inputs do usuário ainda pendentes

Estes ficam como **placeholders editáveis no admin Payload** (Globals) até receber valores reais:

- **WhatsApp number + mensagens default por CTA**.
- **Bio Milton Bastos** (3-4 linhas pra `/sobre` + author block).
- **Manifesto Bitflix** (parágrafo completo ~4-6 linhas, hero da home + intro `/sobre`).
- **Migração da LP atual** (estratégia: substituir direto, redirect, etc).
- **E-mail institucional** (se vai ter `contato@bitflix.com.br`).
- **Umami website ID** (criar em `stats.bitflix.com.br/dashboard` para `bitflix.com.br`).
