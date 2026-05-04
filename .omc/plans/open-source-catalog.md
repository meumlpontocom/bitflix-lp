# Bitflix LP — Plano Catálogo Open Source IA/DevTools

> Plano para criar um catálogo editorial de projetos open source relevantes para IA,
> desenvolvimento de software, agents, MCPs, automação e produtividade técnica.
> Criado: 2026-05-03.
> Estado: Fase 1 executada parcialmente em 2026-05-03 após aprovação explícita.
> Progresso detalhado em `.omc/progress/open-source-catalog.md`.

---

## 1. Objetivo

Criar dentro do blog Bitflix uma página fixa de catálogo/índice de projetos open
source com curadoria editorial em PT-BR. A fonte inicial de descoberta pode ser
páginas como Github Awesome, vídeos, newsletters ou listas públicas; cada projeto
catalogado deve virar um post novo no blog atual, com conteúdo original da
Bitflix, baseado principalmente em dados públicos dos repositórios e
documentação oficial dos projetos.

O usuário poderá pedir algo como:

```text
insira projetos no catálogo: https://githubawesome.com/github-trending-weekly-30/
```

O agente deve extrair todos os repositórios da página, enriquecer cada projeto
com dados públicos do GitHub, gerar posts didáticos e completos em PT-BR e salvar
drafts no Payload CMS para revisão/publicação. A página fixa do catálogo apenas
organiza e aponta para esses posts.

---

## 2. Princípios editoriais e legais

- **Não republicar conteúdo pago**: usar Github Awesome como fonte de descoberta
  de links, não como texto republicável.
- **Conteúdo Bitflix original**: resumo, análise, tags, casos de uso, prós/contras
  e recomendações devem ser gerados a partir de README/docs públicos e leitura
  editorial própria.
- **Atribuição transparente**: quando a lista vier do Github Awesome, registrar
  `discovery_source_url` e exibir, quando adequado, "Descoberto via Github
  Awesome" sem copiar o corpo do conteúdo.
- **Links para fontes primárias**: cada projeto deve apontar para o repositório,
  documentação oficial, site do projeto e licença quando disponíveis.
- **Sem promessa de auditoria**: o catálogo não recomenda uso em produção sem
  avaliação técnica; incluir microcopy de cautela para projetos experimentais.

---

## 3. Escopo MVP

### Inclui

- Reuso da Collection atual `Articles` para cada projeto catalogado virar um
  post normal do blog.
- Nova Collection Payload `OpenSourceCatalogEntries` para metadados estruturados
  do catálogo e vínculo com o post `Article`.
- Nova Collection Payload `OpenSourceCatalogImports` para registrar fontes,
  execuções e status de importação.
- Página fixa pública dentro do blog, por exemplo `/blog/catalogo-open-source`.
- Cards do catálogo apontando para posts em `/blog/[slug]`, não para uma rota de
  detalhe separada.
- Filtros por categoria, tipo, linguagem, licença, tags e status editorial.
- Importador manual executado por agente/Codex, não por usuário público.
- Enriquecimento via GitHub API ou fallback HTML/README público.
- Geração de post PT-BR original, útil e suficientemente completo por projeto.
- Salvamento inicial como `draft`/`review`, nunca publicação automática.

### Não inclui no MVP

- Busca IA em produção.
- Agente autônomo rodando em background.
- Scraping recorrente agendado.
- Login público ou área de assinantes.
- Ranking automático de "melhor projeto".
- Garantia de segurança/licença de cada repo.

---

## 4. Fases

### Fase 1 — Modelagem Payload

Usar `Articles` como superfície editorial pública e criar Collections auxiliares
para catalogação/importação.

#### `Articles` como posts do catálogo

Cada projeto importado gera um `Article` novo, simples, no blog atual.

Regras:

- O post deve ser longo o bastante para ser útil; não criar posts pequenos com
  apenas resumo superficial.
- O texto deve absorver bem README, docs e exemplos do repositório original.
- O tom deve funcionar para dois públicos ao mesmo tempo:
  - iniciantes, com explicações didáticas e contexto;
  - profissionais experientes, com detalhes práticos, limitações e critérios de
    decisão.
- O post deve ser original, não uma tradução literal do README.
- O post deve conter links oficiais, principalmente o repositório.
- O post deve entrar como `draft` ou `review`; publicação só depois de revisão.

Estrutura editorial sugerida para cada post:

- O que é o projeto.
- Que problema resolve.
- Como funciona em alto nível.
- Quando faz sentido usar.
- Exemplos de uso realistas.
- Para quem é útil.
- Pontos fortes.
- Limitações e riscos.
- Como começar a explorar.
- Links oficiais e licença.
- Conclusão Bitflix: por que entrou no catálogo.

#### `OpenSourceCatalogEntries`

Campos sugeridos:

- `title` — nome humano do projeto.
- `slug` — único.
- `article` — relacionamento obrigatório com `Articles`.
- `repository_url` — URL canônica do GitHub/GitLab/etc.
- `repository_owner` / `repository_name`.
- `homepage_url`.
- `docs_url`.
- `description_original` — descrição curta do GitHub.
- `summary_pt_br` — resumo editorial Bitflix.
- `what_it_does` — para que serve.
- `when_to_use` — quando é útil.
- `when_not_to_use` — limitações/cautelas.
- `target_users` — devs, founders, equipes de produto, infra, dados, etc.
- `project_type` — enum inicial:
  - `ai-agent`
  - `mcp`
  - `llm-app`
  - `developer-tool`
  - `automation`
  - `data-ai`
  - `frontend`
  - `backend`
  - `infra`
  - `security`
  - `learning`
  - `other`
- `categories` — relacionamento com `Categories` ou Collection própria.
- `tags` — relacionamento com `Tags` ou tags específicas do catálogo.
- `github_topics` — array text.
- `primary_language`.
- `license`.
- `stars`.
- `forks`.
- `open_issues`.
- `last_pushed_at`.
- `last_checked_at`.
- `readme_excerpt` — trecho curto/sanitizado, só se necessário.
- `source_links` — array de links oficiais consultados.
- `discovery_source_url`.
- `discovery_source_name` — ex: `Github Awesome`.
- `discovery_batch_id` — relação com import.
- `catalog_status` — `draft`, `review`, `published`, `archived`.
- `is_featured`.
- `is_active`.

#### `OpenSourceCatalogImports`

Campos sugeridos:

- `source_url`.
- `source_name`.
- `requested_by`.
- `status` — `pending`, `running`, `done`, `partial`, `failed`.
- `repos_found_count`.
- `repos_imported_count`.
- `repos_skipped_count`.
- `errors` — array append-only.
- `started_at`.
- `finished_at`.
- `notes`.

Critérios:

- `repository_url` deve ser único.
- Cada `OpenSourceCatalogEntries.article` aponta para um post real em
  `Articles`.
- O status público efetivo depende do post estar `published` e da entrada estar
  ativa/publicada.
- Import reexecutado deve atualizar snapshot e manter conteúdo editorial se já
  houver revisão humana.
- Mudança de schema exige `pnpm payload migrate:create` antes de deploy prod.

### Fase 2 — Importador manual

Criar script local, por exemplo:

```bash
CATALOG_SOURCE_URL=https://githubawesome.com/github-trending-weekly-30/ pnpm catalog:import
```

Fluxo:

1. Receber URL fonte.
2. Se a página exigir login/código, agente faz login manual assistido pelo user.
3. Extrair todos os links de repositórios.
4. Deduplicar URLs.
5. Buscar metadados via GitHub API.
6. Baixar README e, se disponível, docs principais, exemplos e links oficiais.
7. Gerar um post `Article` em PT-BR, didático e completo.
8. Criar/atualizar `OpenSourceCatalogEntries` vinculado ao post.
9. Registrar resultado em `OpenSourceCatalogImports`.

Regras:

- Não salvar o HTML completo da fonte paga.
- Não copiar texto do Github Awesome para campos editoriais.
- Não sobrescrever campos editoriais revisados manualmente sem flag explícita.
- Não publicar automaticamente posts gerados.
- Não gerar post curto por pressa; se não houver material suficiente no repo,
  marcar como pendência de pesquisa em vez de publicar conteúdo fraco.
- Rate limit GitHub: usar `GITHUB_TOKEN` opcional em `.env`.

### Fase 3 — Página pública do catálogo

Criar uma página fixa dentro do blog, rota recomendada:

```text
/blog/catalogo-open-source
```

Características:

- Header simples com proposta: curadoria Bitflix de open source para IA e dev.
- Busca textual simples no Payload no MVP.
- Filtros por:
  - tipo de projeto;
  - linguagem;
  - tags;
  - licença;
  - atualizado recentemente;
  - destaque Bitflix.
- Cards densos, úteis para comparação, sem estilo de landing page.
- Cada card mostra nome, resumo curto, tipo, tags, stars, linguagem, licença e
  link para o post do blog em `/blog/[slug]`.
- A página não é um post; é uma rota fixa dentro do blog.
- Não criar `/catalogo-open-source/[slug]` no MVP. O detalhe é o próprio post.

### Fase 4 — Review editorial e publicação

Fluxo recomendado:

1. Importador cria todos como `draft`.
2. Agente gera relatório de import com lista de projetos e possíveis problemas.
3. User aprova publicação em lote ou por categoria.
4. Agente muda `status` para `published`.
5. Revalidar índice/detalhes, se o projeto usar cache no futuro.

Critérios de qualidade editorial:

- PT-BR claro.
- Não soar como tradução literal de README.
- Explicar uso prático.
- Ser útil para iniciantes e profissionais experientes.
- Ter conteúdo substancial, com contexto e exemplos, não apenas resumo curto.
- Explicar termos técnicos quando necessário sem diluir demais para leitores
  avançados.
- Separar hype de utilidade real.
- Apontar riscos: projeto abandonado, licença restritiva, pouca adoção, docs
  ruins, setup complexo.

### Fase 5 — LightRAG local

Indexar cada projeto no LightRAG com um documento por projeto.

Conteúdo sugerido por documento:

- Nome.
- Repo URL.
- Post completo gerado no blog.
- Resumo.
- README sanitizado/resumido.
- Categorias e tags.
- Casos de uso.
- Quando usar/não usar.
- Skills/MCPs/agents relacionados.
- Links oficiais.

Metadata:

- `project_id`.
- `article_id`.
- `article_slug`.
- `slug`.
- `repository_url`.
- `project_type`.
- `primary_language`.
- `license`.
- `stars`.
- `last_checked_at`.

Primeiro uso:

- Indexação offline acionada após import.
- Sem expor busca IA no site ainda.
- Usar LightRAG para ajudar o agente/editor a encontrar projetos quando o user
  pedir por intenção, exemplo: "skills para economizar token".

### Fase 6 — Busca IA pública

Criar endpoint privado/server-side:

```text
POST /api/open-source-catalog/search
```

Input:

- `query`.
- filtros opcionais.

Output:

- lista de projetos relevantes;
- explicação curta por projeto;
- links para os posts internos do blog.

Arquitetura:

- Site chama endpoint Next.
- Endpoint consulta LightRAG local.
- Resultado cru do LightRAG é reconciliado com Payload para retornar só projetos
  com `Article` publicado e entrada ativa.
- Se LightRAG estiver indisponível, fallback para busca textual Payload.

Guardrails:

- Não retornar projetos não publicados.
- Não inventar projetos.
- Responder com "não encontrei" quando a evidência for fraca.
- Logar queries sem dados pessoais.

---

## 5. UX sugerida

Nome da seção:

- `/blog/catalogo-open-source`
- Título público: `Catálogo Open Source para IA e Software`

Tom:

- Curadoria prática, sem hype.
- Foco em "o que dá para construir com isso".
- Adequado ao posicionamento Bitflix: IA chegando ao produto/cliente final.

Categorias iniciais:

- Agents e frameworks de agentes.
- MCPs e integrações.
- Ferramentas para economizar tokens/contexto.
- DevTools com IA.
- Observabilidade e avaliação de LLMs.
- RAG, GraphRAG e busca semântica.
- UI/UX para apps de IA.
- Infra para deploy de apps IA.

---

## 6. Comandos e scripts previstos

Adicionar scripts quando implementar:

```json
{
  "catalog:import": "payload run scripts/import-open-source-catalog.ts",
  "catalog:index-lightrag": "payload run scripts/index-open-source-lightrag.ts",
  "catalog:refresh": "payload run scripts/refresh-open-source-projects.ts"
}
```

Variáveis opcionais:

```env
GITHUB_TOKEN=
LIGHTRAG_BASE_URL=http://localhost:9621
LIGHTRAG_API_KEY=
```

---

## 7. Riscos

| Risco | Mitigação |
|-------|-----------|
| Conteúdo pago republicado sem querer | Usar página paga apenas para links; gerar análise original via fontes públicas |
| Rate limit GitHub | `GITHUB_TOKEN`, cache e import em lotes |
| Projetos abandonados | Salvar `last_pushed_at` e sinalizar obsolescência |
| Alucinação no resumo | Gerar a partir de README/docs, salvar fontes consultadas e revisar antes de publicar |
| LightRAG retornar item não publicado | Reconciliar sempre com Payload e filtrar posts `Article` publicados e entradas ativas |
| Schema muda e prod quebra | `payload migrate:create` obrigatório após Collections/Globals |
| Busca pública ficar lenta | MVP usa busca textual; LightRAG público só depois de medir latência |

---

## 8. Acceptance criteria

### MVP

- [ ] Collections criadas e visíveis no Payload admin.
- [ ] Migration versionada criada.
- [ ] Importador recebe uma URL fonte e encontra todos os repositórios da página.
- [ ] Projetos são criados/atualizados sem duplicar `repository_url`.
- [ ] Cada projeto importado gera um post `Article` em PT-BR, original,
  didático e substancial.
- [ ] Cada entrada do catálogo aponta para um post real em `/blog/[slug]`.
- [ ] Índice `/blog/catalogo-open-source` lista apenas projetos com post
  publicado e entrada ativa.
- [ ] Não existe rota de detalhe própria no MVP; o detalhe é o post do blog.
- [ ] `pnpm tsc --noEmit`, `pnpm lint` e checklist project-specific passam.

### LightRAG

- [ ] Cada post publicado do catálogo pode ser indexado no LightRAG.
- [ ] Query local "skills para economizar token" retorna projetos relevantes se
  houver evidência nos documentos.
- [ ] Resultado do LightRAG é reconciliado com Payload antes de qualquer exibição.

---

## 9. Decisões pendentes

- Nome final da rota dentro do blog: `/blog/catalogo-open-source`,
  `/blog/open-source` ou `/blog/ferramentas`.
- Usar `Categories`/`Tags` existentes ou criar taxonomia separada para catálogo.
- Como marcar visualmente que um `Article` pertence ao catálogo.
- Se o importador deve ficar só local/Codex ou virar endpoint autenticado.
- Frequência de refresh dos metadados GitHub.
- Se o Github Awesome deve aparecer como fonte visível em cada item ou só no log
  editorial.

---

## 10. Próxima ação recomendada

Executar apenas a Fase 1 depois de aprovação:

1. Criar Collections Payload.
2. Criar migration.
3. Criar seed mínimo de categorias.
4. Criar página fixa `/blog/catalogo-open-source` vazia com estado inicial.

Depois disso, validar o primeiro import real com uma página Github Awesome em
staging antes de publicar qualquer item em produção.
