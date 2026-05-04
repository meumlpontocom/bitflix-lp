# Bitflix LP — Progresso Catálogo Open Source

> Plano de origem: `.omc/plans/open-source-catalog.md`.
> Criado: 2026-05-03.

## Status global

**Status overall:** `in-progress`

Implementado nesta execução:

- Collections Payload `OpenSourceCatalogEntries` e `OpenSourceCatalogImports`.
- Registro das Collections em `src/payload.config.ts`.
- Tipos Payload regenerados em `src/payload-types.ts`.
- Migration versionada `src/migrations/20260504_004730.ts` + snapshot JSON.
- DTO/service do catálogo para o site público.
- Página fixa `/blog/catalogo-open-source`, dentro do blog, com busca/filtros server-side.
- Link do `/blog` para o catálogo.
- Script inicial `CATALOG_SOURCE_URL=<url> pnpm catalog:import` para descobrir links GitHub e registrar execução no Payload.
- Seed idempotente `pnpm exec payload run scripts/seed-ruflo-catalog-entry.ts` para publicar/atualizar o primeiro item validado do catálogo em qualquer ambiente.
- Renderização permanente do corpo de artigos via `.article-richtext`, com destaque real para headings Lexical.
- Geração de OG com fonte Geist explícita e URL versionada por `updatedAt` para preservar acentos/cedilhas e evitar cache antigo.

## Importante

- O script `catalog:import` ainda é uma etapa de descoberta. Ele não gera posts automaticamente.
- Cada projeto ainda precisa de post editorial substancial em PT-BR antes de aparecer no catálogo público.
- Posts do catálogo devem usar headings Lexical reais (`h2`/`h3`) e PT-BR com acentos/cedilhas em título, corpo, resumo e fonte.
- A página pública lista apenas entradas com `catalog_status = published`, `is_active != false` e `Article` relacionado publicado.
- LightRAG ainda não foi implementado nesta execução.
- Busca IA pública ainda não foi implementada nesta execução.

## Observação sobre migrations

O gerador `payload migrate:create` tentou incluir novamente os Globals de páginas
(`home_page_*`, `servicos_page_*`, etc.) porque `20260430_pages_globals.ts` é uma
migration manual sem snapshot JSON próprio. A migration `20260504_004730.ts` foi
revisada manualmente para conter apenas as tabelas novas do catálogo.

Não rodar `payload migrate` no DB dev atual sem cuidado: o dev usa `push: true` e
a tabela `payload_migrations` local registra apenas `dev`. Em produção, a
migration nova deve rodar na sequência normal do deploy, depois das migrations
anteriores versionadas.

## Próximos passos

1. Testar a página `/blog/catalogo-open-source` em staging após o app recarregar o schema.
2. Evoluir `catalog:import` para criar drafts de `Article` e `OpenSourceCatalogEntries`.
3. Definir o formato exato do relatório editorial por import.
4. Implementar indexação LightRAG offline depois que houver posts publicados.

## Itens catalogados manualmente

### 2026-05-04 — Ruflo

- Repo: `https://github.com/ruvnet/ruflo`
- Article: `/blog/ruflo-orquestracao-multiagente-para-claude-code`
- Catalog entry: `ruflo`
- Status Payload: `Article.status = published`, `catalog_status = published`
- Seed: `scripts/seed-ruflo-catalog-entry.ts` criado para reproduzir o post e a entrada em produção.
- Validação visual: headings destacados, bloco de código com botão Copiar, texto PT-BR acentuado e cover OG com `orquestração` correto.
- LightRAG: documento enviado em 2026-05-04, `track_id = insert_20260504_184651_de19aa2d`, `doc_id = doc-c6b018f4d8c5b316904f1a80cf86a667`
- Observacao LightRAG: MCP atual nao expõe `file_source`; documento entrou como `text_input.txt` e estava `pending` porque o pipeline estava ocupado com ingestao anterior.
