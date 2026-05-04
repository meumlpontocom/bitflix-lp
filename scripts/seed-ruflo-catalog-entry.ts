/**
 * Seed idempotente do primeiro item do catálogo open source.
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-ruflo-catalog-entry.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { slugify } from '../src/lib/slugify.ts'
import type { Article, OpenSourceCatalogEntry } from '../src/payload-types.ts'

function text(value: string) {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: value,
    type: 'text',
    version: 1,
  }
}

function paragraph(value: string) {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  }
}

function heading(value: string) {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag: 'h2',
    type: 'heading',
    version: 1,
  }
}

function code(value: string, language = 'bash') {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    language,
    type: 'code',
    version: 1,
  }
}

const bodyLexical = {
  root: {
    children: [
      paragraph(
        'Ruflo é uma plataforma open source de orquestração multiagente pensada para levar o Claude Code além do uso individual. Em vez de depender de um único assistente respondendo comandos, a proposta é coordenar agentes especializados, memória persistente, plugins, workflows e comunicação entre máquinas para trabalhos de software mais longos e complexos.',
      ),
      paragraph(
        'Na prática, o projeto tenta transformar o ambiente de desenvolvimento em um sistema operacional para agentes: o usuário continua trabalhando no Claude Code, mas tarefas podem ser roteadas para swarms, agentes de teste, revisão, segurança, documentação, automação e memória. É por isso que o Ruflo entra no catálogo Bitflix como uma ferramenta relevante para equipes que estão explorando engenharia de software agêntica e coordenação de agentes em projetos reais.',
      ),

      heading('O que é o Ruflo'),
      paragraph(
        'O repositório descreve o Ruflo como uma plataforma de orquestração de agentes para Claude Code. Ele nasceu da linha Claude Flow e hoje se apresenta como uma camada com CLI, MCP, plugins nativos, agentes especializados, memória vetorial, workers de background, roteamento inteligente e suporte a provedores de LLM como Claude, GPT, Gemini, Cohere e modelos locais via Ollama.',
      ),
      paragraph(
        'O ponto central não é apenas chamar uma ferramenta MCP. A ambição é criar uma arquitetura em que agentes consigam colaborar: um roteador decide para onde vai cada tarefa, swarms dividem trabalho, memória registra padrões que deram certo, e plugins adicionam capacidades como auditoria de segurança, geração de testes, documentação, workflows, federação e observabilidade.',
      ),

      heading('Que problema ele tenta resolver'),
      paragraph(
        'Quem usa agentes de código no dia a dia encontra rapidamente três limites: o contexto some entre sessões, tarefas grandes precisam ser quebradas manualmente, e diferentes agentes ou ferramentas não compartilham memória nem coordenação. Ruflo ataca exatamente esse espaço.',
      ),
      paragraph(
        'Ele tenta dar ao Claude Code uma camada de coordenação para que trabalho longo vire fluxo, não apenas uma sequência de prompts soltos. Isso é especialmente relevante quando a equipe quer usar IA para tarefas que atravessam várias etapas: entender um codebase, planejar uma refatoração, escrever testes, revisar riscos, atualizar documentação e preservar aprendizado.',
      ),

      heading('Como funciona em alto nível'),
      paragraph(
        'A arquitetura descrita pelo projeto segue um fluxo simples de entender: o usuário interage pelo Claude Code, pela CLI ou por MCP; uma camada de roteamento decide como tratar a tarefa; swarms e agentes especializados executam partes do trabalho; memória e mecanismos de aprendizado registram resultados; provedores de LLM geram respostas e ações.',
      ),
      paragraph(
        'O README também fala em plugins nativos para Claude Code. Entre os exemplos estão ruflo-core, ruflo-swarm, ruflo-autopilot, ruflo-federation, ruflo-rag-memory, ruflo-knowledge-graph, ruflo-testgen, ruflo-browser, ruflo-security-audit, ruflo-docs, ruflo-observability e ruflo-cost-tracker.',
      ),
      paragraph(
        'Para um iniciante, pense nisso como uma loja de capacidades para agentes. Para um profissional experiente, o ponto interessante é a tentativa de modularizar preocupações que normalmente ficam espalhadas em scripts, prompts, automações locais e memória informal da equipe.',
      ),

      heading('Instalação e primeiro contato'),
      paragraph(
        'O caminho recomendado no README é instalar como plugin nativo no Claude Code. Também existe instalação via script shell, npx e npm global. Para avaliar sem acoplar tudo de uma vez, eu começaria em um ambiente descartável ou em um repositório pequeno, porque ferramentas de orquestração podem mexer em muitos aspectos do fluxo de desenvolvimento.',
      ),
      code(`# Plugin no Claude Code
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
/plugin install ruflo-autopilot@ruflo

# Alternativa via npx
npx ruflo@latest init --wizard`),
      paragraph(
        'Depois do init, a promessa do projeto é que o usuário não precise decorar dezenas de ferramentas: hooks e roteamento passam a ajudar na escolha de agentes e fluxos. Mesmo assim, para uso sério, vale estudar quais plugins foram instalados, quais comandos podem executar ações no repositório e quais permissões ficam ativas.',
      ),

      heading('Quando faz sentido usar'),
      paragraph(
        'Ruflo parece mais útil quando o trabalho com IA já passou da fase de curiosidade. Se a equipe só quer fazer perguntas pontuais sobre código, talvez um único assistente já resolva. A ferramenta começa a fazer mais sentido quando há tarefas recorrentes, múltiplas etapas, necessidade de memória, revisão, automação e algum grau de padronização entre pessoas ou máquinas.',
      ),
      paragraph(
        'Exemplos práticos: auditar um codebase antes de uma refatoração, gerar testes em paralelo, manter documentação viva, coordenar agentes com papéis diferentes, registrar decisões técnicas, pesquisar contexto externo e reaproveitar aprendizado entre sessões.',
      ),

      heading('Pontos de atenção'),
      paragraph(
        'O projeto é ambicioso e isso pede cautela. Orquestração multiagente aumenta poder, mas também aumenta superfície de erro: permissões, comandos automáticos, custo de tokens, ruído de agentes, conflitos entre mudanças e dificuldade de depurar por que uma decisão foi tomada.',
      ),
      paragraph(
        'Para times profissionais, eu trataria o Ruflo como infraestrutura experimental: primeiro validar em repositórios pequenos, medir ganho real, entender logs e permissões, e só depois levar para fluxos críticos. A promessa é forte, mas precisa ser acompanhada de governança.',
      ),

      heading('Leitura Bitflix'),
      paragraph(
        'O valor do Ruflo não está apenas em mais um CLI. O valor está na direção: agentes de IA estão saindo do modo "chat individual" e caminhando para sistemas coordenados, com memória, papéis, roteamento, ferramentas e políticas. Esse é exatamente o tipo de infraestrutura que pode tornar IA mais aplicável em software real.',
      ),
      paragraph(
        'Para o catálogo Bitflix, Ruflo é um projeto que vale acompanhar porque toca em temas centrais para os próximos ciclos de desenvolvimento com IA: orquestração, memória, automação segura, colaboração entre agentes e padronização de workflows.',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

const categories = ['IA e agentes', 'DevTools com IA']
const tags = ['Ruflo', 'Claude Code', 'Codex', 'MCP', 'Multi-agent', 'Swarm', 'RAG', 'Developer tools']

async function findOneId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'authors' | 'categories' | 'tags' | 'articles' | 'open-source-catalog-entries',
  slug: string,
) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0]?.id ?? null
}

async function ensureTerm(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'categories' | 'tags',
  name: string,
) {
  const slug = slugify(name)
  const existingId = await findOneId(payload, collection, slug)
  if (existingId) return existingId

  const created = await payload.create({
    collection,
    data: {
      name,
      slug,
      is_active: true,
    },
  })
  return created.id
}

async function ensureAuthor(payload: Awaited<ReturnType<typeof getPayload>>) {
  const slug = 'milton-bastos'
  const existingId = await findOneId(payload, 'authors', slug)
  if (existingId) return existingId

  const created = await payload.create({
    collection: 'authors',
    data: {
      name: 'Milton Bastos',
      slug,
      bio: 'Fundador da Bitflix. Escreve sobre software, IA aplicada e produtos digitais.',
    },
  })
  return created.id
}

const payload = await getPayload({ config })

const authorId = await ensureAuthor(payload)
const categoryIds = await Promise.all(categories.map((name) => ensureTerm(payload, 'categories', name)))
const tagIds = await Promise.all(tags.map((name) => ensureTerm(payload, 'tags', name)))

const articleSlug = 'ruflo-orquestracao-multiagente-para-claude-code'
const articleData = {
  title: 'Ruflo: orquestração multiagente para Claude Code',
  slug: articleSlug,
  excerpt:
    'Ruflo coordena agentes, plugins, memória e workflows ao redor do Claude Code para transformar tarefas longas de software em fluxos multiagente.',
  body_lexical: bodyLexical,
  source: {
    original_title: 'Ruflo',
    original_author: 'RuvNet',
    original_site: 'GitHub',
    original_url: 'https://github.com/ruvnet/ruflo',
    license_note:
      'Repositório open source sob licença MIT. Artigo baseado em README, docs e metadados públicos do GitHub consultados em 04/05/2026.',
  },
  language_origin: 'en',
  disclaimer_variant: 'ai-adapted-from-text',
  is_bitflix_take: true,
  author: authorId,
  categories: categoryIds,
  tags: tagIds,
  status: 'published',
  published_at: new Date('2026-05-04T18:46:00.000Z').toISOString(),
  is_active: true,
  created_via: 'manual',
}

const existingArticleId = await findOneId(payload, 'articles', articleSlug)
const article = existingArticleId
  ? ((await payload.update({
      collection: 'articles',
      id: existingArticleId,
      data: articleData as never,
    })) as Article)
  : ((await payload.create({
      collection: 'articles',
      data: articleData as never,
    })) as Article)

const entrySlug = 'ruflo'
const entryData = {
  title: 'Ruflo',
  slug: entrySlug,
  article: article.id,
  repository_url: 'https://github.com/ruvnet/ruflo',
  repository_owner: 'ruvnet',
  repository_name: 'ruflo',
  docs_url: 'https://github.com/ruvnet/ruflo/blob/main/docs/USERGUIDE.md',
  source_links: [
    { label: 'Repositório GitHub', url: 'https://github.com/ruvnet/ruflo' },
    { label: 'README', url: 'https://github.com/ruvnet/ruflo/blob/main/README.md' },
    { label: 'User Guide', url: 'https://github.com/ruvnet/ruflo/blob/main/docs/USERGUIDE.md' },
    { label: 'Security Policy', url: 'https://github.com/ruvnet/ruflo/blob/main/SECURITY.md' },
    { label: 'Latest release', url: 'https://github.com/ruvnet/ruflo/releases/tag/v3.6.27' },
  ],
  description_original:
    'The leading agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, coordinate autonomous workflows, and build conversational AI systems.',
  summary_pt_br:
    'Plataforma de orquestração multiagente para Claude Code/Codex, com swarms, plugins, memória vetorial, workflows, MCP e componentes de segurança para coordenar tarefas complexas de engenharia.',
  what_it_does:
    'Adiciona uma camada de coordenação para agentes de IA: roteamento, swarms, plugins, memória persistente, workers, RAG, knowledge graph, automação de browser, auditoria e suporte a múltiplos provedores de LLM.',
  when_to_use:
    'Use para experimentar engenharia de software agêntica em repositórios com tarefas longas, necessidade de memória entre sessões, coordenação de vários agentes, geração de testes, revisão, documentação e automações recorrentes.',
  when_not_to_use:
    'Evite como primeira ferramenta de IA para código ou em repositórios sensíveis sem sandbox. A superfície de plugins, hooks, comandos e memória exige avaliação cuidadosa antes de uso operacional.',
  target_users: [
    { label: 'Desenvolvedores que usam Claude Code ou Codex' },
    { label: 'Equipes pesquisando agentes de software' },
    { label: 'Arquitetos avaliando workflows multiagente' },
    { label: 'Times que precisam de memória e coordenação entre tarefas' },
  ],
  project_type: 'ai-agent',
  categories: categoryIds,
  tags: tagIds,
  github_topics: [
    { topic: 'agentic-ai' },
    { topic: 'claude-code' },
    { topic: 'codex' },
    { topic: 'mcp-server' },
    { topic: 'model-context-protocol' },
    { topic: 'multi-agent' },
    { topic: 'swarm-intelligence' },
    { topic: 'agentic-rag' },
  ],
  primary_language: 'TypeScript',
  license: 'MIT',
  stars: 39237,
  forks: 4451,
  open_issues: 497,
  last_checked_at: new Date('2026-05-04T18:46:00.000Z').toISOString(),
  readme_excerpt:
    'Ruflo se apresenta como plataforma de orquestração de agentes para Claude Code, com swarms, plugins, memória, MCP e automação de workflows.',
  discovery_source_url: 'https://github.com/ruvnet/ruflo',
  discovery_source_name: 'GitHub',
  catalog_status: 'published',
  is_featured: true,
  is_active: true,
}

const existingEntryId = await findOneId(payload, 'open-source-catalog-entries', entrySlug)
const entry = existingEntryId
  ? ((await payload.update({
      collection: 'open-source-catalog-entries',
      id: existingEntryId,
      data: entryData as never,
    })) as OpenSourceCatalogEntry)
  : ((await payload.create({
      collection: 'open-source-catalog-entries',
      data: entryData as never,
    })) as OpenSourceCatalogEntry)

console.log(
  JSON.stringify(
    {
      articleId: article.id,
      articleSlug: article.slug,
      catalogEntryId: entry.id,
      catalogEntrySlug: entry.slug,
      status: 'ok',
    },
    null,
    2,
  ),
)
