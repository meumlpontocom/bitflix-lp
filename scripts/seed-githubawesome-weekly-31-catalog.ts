/**
 * Seed idempotente do lote Github Awesome weekly #31.
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-githubawesome-weekly-31-catalog.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { slugify } from '../src/lib/slugify.ts'
import type { Article, OpenSourceCatalogEntry } from '../src/payload-types.ts'

type ProjectType =
  | 'ai-agent'
  | 'mcp'
  | 'llm-app'
  | 'developer-tool'
  | 'automation'
  | 'data-ai'
  | 'frontend'
  | 'backend'
  | 'infra'
  | 'security'
  | 'learning'
  | 'other'

interface CatalogSeed {
  rank: number
  name: string
  repo: string
  title: string
  pitch: string
  whenToUse: string
  whenNotToUse: string
  targetUsers: string[]
  projectType: ProjectType
  categories: string[]
  tags: string[]
}

interface GithubRepoMeta {
  description?: string | null
  homepage?: string | null
  language?: string | null
  license?: { spdx_id?: string | null; name?: string | null } | null
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number
  pushed_at?: string | null
  topics?: string[]
}

const DISCOVERY_SOURCE_URL = 'https://githubawesome.com/github-trending-weekly-31/'
const DISCOVERY_SOURCE_NAME = 'Github Awesome weekly #31'

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

function heading(value: string, tag: 'h2' | 'h3' = 'h2') {
  return {
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
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

function repoParts(repoUrl: string) {
  const url = new URL(repoUrl)
  const [owner, repo] = url.pathname.replace(/^\/|\/$/g, '').split('/')
  return { owner, repo }
}

function articleSlug(seed: CatalogSeed) {
  return slugify(seed.title)
}

function entrySlug(seed: CatalogSeed) {
  return slugify(seed.name)
}

function licenseLabel(meta: GithubRepoMeta | null) {
  const spdx = meta?.license?.spdx_id
  if (spdx && spdx !== 'NOASSERTION') return spdx
  return meta?.license?.name ?? ''
}

function firstSentence(value: string) {
  const match = value.match(/^(.+?[.!?])\s/)
  return (match?.[1] ?? value).slice(0, 260)
}

function bodyLexical(seed: CatalogSeed, owner: string, repoName: string, meta: GithubRepoMeta | null) {
  const primaryLanguage = meta?.language ? ` O repositório aparece principalmente em ${meta.language}.` : ''
  const license = licenseLabel(meta)
  const licenseText = license ? ` A licença registrada no GitHub é ${license}.` : ''

  return {
    root: {
      children: [
        paragraph(
          `${seed.name} entrou no radar da Bitflix na lista ${DISCOVERY_SOURCE_NAME} porque aponta para um problema real do ecossistema de software, IA ou automação. A descrição curta do projeto é direta: ${firstSentence(seed.pitch)}`,
        ),
        paragraph(
          `Este post transforma a descrição original em uma leitura editorial em PT-BR, com foco em utilidade prática, riscos e contexto para quem constrói produtos digitais. O repositório oficial é ${owner}/${repoName}.${primaryLanguage}${licenseText}`,
        ),

        heading(`O que é ${seed.name}`),
        paragraph(seed.pitch),
        paragraph(
          meta?.description
            ? `A descrição pública no GitHub resume o projeto assim: ${meta.description}`
            : 'Mesmo sem depender de metadados externos, o projeto se encaixa em uma tendência clara: ferramentas mais específicas, locais e conectáveis ao fluxo real de trabalho.',
        ),

        heading('Por que vale acompanhar'),
        paragraph(
          `${seed.name} é interessante porque reduz atrito em uma etapa que costuma ficar manual, dispersa ou frágil. Em vez de vender uma plataforma genérica, o projeto ataca um gargalo bem delimitado e tenta entregar uma interface utilizável para desenvolvedores, operadores ou usuários técnicos.`,
        ),
        paragraph(
          'Para a Bitflix, esse tipo de projeto importa porque mostra caminhos para entregar IA e automação como produto final: assistentes mais próximos do navegador, ferramentas locais, visualização de sistemas, verificação documental, ambientes de teste e componentes que tornam workflows complexos mais acessíveis.',
        ),

        heading('Quando faz sentido usar'),
        paragraph(seed.whenToUse),

        heading('Pontos de atenção'),
        paragraph(seed.whenNotToUse),
        paragraph(
          'Como regra prática, trate projetos novos do catálogo como candidatos a avaliação, não como recomendação cega de produção. Leia o README, confira licença, atividade do repositório, permissões exigidas e superfície de integração antes de colocar em um fluxo crítico.',
        ),

        heading('Primeiro contato técnico'),
        paragraph(
          'O ponto de partida deve ser o repositório oficial no GitHub. Para avaliar com segurança, clone em uma pasta descartável, leia o README e a licença, e só depois rode scripts de instalação.',
        ),
        code(`git clone ${seed.repo}
cd ${repoName}
# leia o README e a licença antes de rodar scripts do projeto`),

        heading('Leitura Bitflix'),
        paragraph(
          `A leitura Bitflix sobre ${seed.name}: vale acompanhar porque traduz uma tendência ampla em uma ferramenta concreta. Mesmo que ainda precise de validação técnica, o projeto ajuda a enxergar para onde o mercado está indo: agentes mais integrados ao ambiente real, ferramentas locais mais fortes e experiências de software com menos dependência de interfaces genéricas.`,
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

const seeds: CatalogSeed[] = [
  {
    rank: 1,
    name: 'chromex',
    repo: 'https://github.com/GENEXIS-AI/chromex',
    title: 'chromex: assistente Codex no side panel do Chrome',
    pitch:
      'chromex é um assistente de navegador em side panel, movido por Codex, que conecta o Chrome a uma ponte nativa local. Ele conversa com a página atual, resume abas abertas, lê screenshots e processa voz sem guardar credenciais em storage padrão de extensão.',
    whenToUse:
      'Use quando o fluxo principal acontece no navegador e você quer que o agente leia contexto da página, tabs e capturas sem alternar entre janelas.',
    whenNotToUse:
      'Evite instalar em perfis com dados sensíveis sem revisar permissões da extensão, ponte nativa, armazenamento de credenciais e escopo de leitura das páginas.',
    targetUsers: ['Usuários de Codex', 'Desenvolvedores web', 'Pesquisadores', 'Power users de navegador'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Browser tools'],
    tags: ['Chrome extension', 'Codex', 'Side panel', 'Native bridge', 'Voice input', 'Screenshots'],
  },
  {
    rank: 2,
    name: 'WhatCable',
    repo: 'https://github.com/darrylmorley/whatcable',
    title: 'WhatCable: descubra do que um cabo USB-C realmente é capaz',
    pitch:
      'WhatCable é um app macOS de menu bar que lê dados de hardware do cabo USB-C conectado e explica em linguagem simples potência de carregamento, velocidade de dados e suporte a vídeo.',
    whenToUse:
      'Use para auditar cabos USB-C em mesa de trabalho, estúdio, laboratório ou suporte técnico, separando cabos lentos de cabos adequados para carga, vídeo e dados rápidos.',
    whenNotToUse:
      'Evite tratar como certificação universal. Cabos, portas, hubs e carregadores interagem entre si; valide cenários críticos com o conjunto completo de hardware.',
    targetUsers: ['Usuários macOS', 'Suporte técnico', 'Desenvolvedores mobile', 'Power users'],
    projectType: 'developer-tool',
    categories: ['Desktop', 'Hardware'],
    tags: ['USB-C', 'macOS', 'Menu bar', 'Hardware', 'Thunderbolt', 'Developer tools'],
  },
  {
    rank: 3,
    name: 'link-cli',
    repo: 'https://github.com/stripe/link-cli',
    title: 'link-cli: credenciais de pagamento virtuais para agentes',
    pitch:
      'link-cli permite que agentes solicitem credenciais virtuais de uso único a partir da carteira Stripe Link. O agente pede pagamento, o usuário aprova no celular e recebe um cartão virtual com controle mais seguro.',
    whenToUse:
      'Use em protótipos de compra autônoma, provisionamento de infraestrutura ou aquisição de créditos quando precisa de aprovação humana e credencial descartável.',
    whenNotToUse:
      'Evite dar autonomia financeira ampla sem limites claros, logs e aprovação explícita. Pagamento por agente exige governança, tetos e revisão de cada fluxo.',
    targetUsers: ['Builders de agentes', 'Times de plataforma', 'Usuários Stripe', 'DevOps'],
    projectType: 'automation',
    categories: ['Automação', 'Pagamentos'],
    tags: ['Stripe', 'Link', 'Virtual card', 'Agents', 'CLI', 'Payments'],
  },
  {
    rank: 4,
    name: 'open-slide',
    repo: 'https://github.com/1weiho/open-slide',
    title: 'open-slide: apresentações em React feitas para agentes',
    pitch:
      'open-slide é um framework de slides criado para agentes de código. O usuário descreve o deck em linguagem natural, o agente escreve componentes React e o framework cuida de canvas 1920x1080, navegação, escala e hot reload.',
    whenToUse:
      'Use quando apresentações precisam ser geradas ou editadas como código React, com liberdade visual maior que DSLs rígidas de slides.',
    whenNotToUse:
      'Evite quando o time precisa apenas editar slides manualmente em PowerPoint ou Keynote. O ganho aparece quando o deck vira artefato de código.',
    targetUsers: ['Usuários de agentes de código', 'Design engineers', 'Criadores de decks técnicos', 'Desenvolvedores React'],
    projectType: 'frontend',
    categories: ['Frontend', 'Documentação técnica'],
    tags: ['React', 'Slides', 'Presentation', 'Canvas', 'Agents', 'Hot reload'],
  },
  {
    rank: 5,
    name: 'serve-sim',
    repo: 'https://github.com/EvanBacon/serve-sim',
    title: 'serve-sim: iOS Simulator visível no navegador para agentes',
    pitch:
      'serve-sim expõe a tela de um iOS Simulator bootado como stream MJPEG de alta taxa em uma UI React, permitindo que agentes vejam e interajam com apps mobile pelo navegador.',
    whenToUse:
      'Use para testes autônomos ou assistidos de apps iOS quando o agente precisa observar a interface real do simulador, não apenas logs e snapshots soltos.',
    whenNotToUse:
      'Evite depender dele como substituto completo de testes automatizados mobile. Observação visual ajuda, mas regressões precisam de testes determinísticos.',
    targetUsers: ['Desenvolvedores iOS', 'Usuários de Claude Code', 'Usuários Cursor', 'Times mobile'],
    projectType: 'developer-tool',
    categories: ['Mobile', 'DevTools com IA'],
    tags: ['iOS Simulator', 'MJPEG', 'React', 'Mobile testing', 'Agents', 'Swift'],
  },
  {
    rank: 6,
    name: 'md-preview.app',
    repo: 'https://github.com/pluk-inc/md-preview.app',
    title: 'md-preview.app: leitor Markdown nativo e rápido para macOS',
    pitch:
      'md-preview.app é um app macOS nativo para abrir arquivos Markdown com preview limpo, outline real, anchors e integração com Quick Look.',
    whenToUse:
      'Use quando você lê muitos READMEs, documentos gerados por IA, specs e notas técnicas e quer uma visualização rápida sem abrir editor pesado.',
    whenNotToUse:
      'Evite se você precisa editar Markdown, colaborar em tempo real ou publicar documentação. O foco é leitura rápida e preview local.',
    targetUsers: ['Desenvolvedores macOS', 'Leitores de documentação', 'Usuários de agentes', 'Tech writers'],
    projectType: 'developer-tool',
    categories: ['Desktop', 'Documentação técnica'],
    tags: ['Markdown', 'macOS', 'Quick Look', 'Native app', 'Documentation'],
  },
  {
    rank: 7,
    name: 'TagTinker',
    repo: 'https://github.com/i12bp8/TagTinker',
    title: 'TagTinker: experimentos autorizados com etiquetas e-ink via Flipper Zero',
    pitch:
      'TagTinker é um app para Flipper Zero voltado a etiquetas eletrônicas e-ink suportadas, com comunicação infravermelha e companion web para preparar BMPs com dithering.',
    whenToUse:
      'Use em laboratório próprio, pesquisa, makerspaces ou ambientes autorizados para estudar displays e-ink, protocolos ESL e pixel art em dispositivos compatíveis.',
    whenNotToUse:
      'Evite usar em equipamentos de terceiros ou ambientes comerciais sem autorização. Interagir com etiquetas de lojas ou infraestrutura alheia pode violar regras e leis.',
    targetUsers: ['Makers', 'Pesquisadores de hardware', 'Usuários Flipper Zero', 'Artistas pixel art'],
    projectType: 'developer-tool',
    categories: ['Hardware', 'Segurança'],
    tags: ['Flipper Zero', 'E-ink', 'Infrared', 'ESL', 'BMP', 'Hardware hacking'],
  },
  {
    rank: 8,
    name: 'mike',
    repo: 'https://github.com/willchen96/mike',
    title: 'mike: boilerplate open source para legal-tech com IA',
    pitch:
      'mike é uma plataforma legal open source em Next.js e Supabase para processar documentos, converter arquivos com LibreOffice e conversar com PDFs jurídicos usando o LLM escolhido.',
    whenToUse:
      'Use como referência para SaaS legal-tech, análise de contratos, protótipos documentais e produtos que precisam combinar upload, conversão e chat com documentos.',
    whenNotToUse:
      'Evite tratar respostas do LLM como aconselhamento jurídico. Fluxos legais exigem revisão profissional, rastreabilidade e controles fortes de privacidade.',
    targetUsers: ['Legal-tech builders', 'Advogados técnicos', 'Startups SaaS', 'Desenvolvedores Next.js'],
    projectType: 'llm-app',
    categories: ['IA aplicada', 'Documentos'],
    tags: ['Legal tech', 'Next.js', 'Supabase', 'PDF', 'LibreOffice', 'LLM'],
  },
  {
    rank: 9,
    name: 'GooseRelayVPN',
    repo: 'https://github.com/Kianmhz/GooseRelayVPN',
    title: 'GooseRelayVPN: túnel Socks5 via Google Apps Script com fortes ressalvas',
    pitch:
      'GooseRelayVPN é uma VPN Socks5 que encapsula tráfego TCP por Google Apps Script até um VPS de saída, usando criptografia AES-256-GCM e aparência de chamadas a APIs Google.',
    whenToUse:
      'Use apenas em pesquisa de redes, laboratório próprio ou avaliação defensiva de políticas de egress autorizada pela organização.',
    whenNotToUse:
      'Evite usar para contornar controles corporativos, inspeção de rede ou políticas de acesso. Esse tipo de ferramenta precisa de autorização explícita e revisão legal.',
    targetUsers: ['Pesquisadores de rede', 'Security engineers', 'Administradores', 'Laboratórios defensivos'],
    projectType: 'security',
    categories: ['Segurança', 'Infra'],
    tags: ['Socks5', 'VPN', 'Google Apps Script', 'AES-GCM', 'Network research', 'Security'],
  },
  {
    rank: 10,
    name: 'agents-cli',
    repo: 'https://github.com/google/agents-cli',
    title: 'agents-cli: CLI do Google para deploy de agentes na nuvem',
    pitch:
      'agents-cli é uma CLI e conjunto de skills do Google para ensinar assistentes de código a construir, escalar, avaliar e publicar agentes de IA no Google Cloud.',
    whenToUse:
      'Use quando o destino natural do agente é infraestrutura Google e você quer reduzir o número de comandos cloud que precisa memorizar.',
    whenNotToUse:
      'Evite se o projeto precisa ser cloud-agnostic ou se ainda não há decisão de arquitetura. Skills de deploy aceleram, mas também podem criar acoplamento.',
    targetUsers: ['Usuários Google Cloud', 'Builders de agentes', 'DevOps', 'Usuários Codex/Claude/Gemini CLI'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Cloud'],
    tags: ['Google Cloud', 'Agents', 'CLI', 'Deployment', 'Skills', 'Evals'],
  },
  {
    rank: 11,
    name: 'dictionary-of-ai-coding',
    repo: 'https://github.com/mattpocock/dictionary-of-ai-coding',
    title: 'dictionary-of-ai-coding: glossário claro para engenharia com IA',
    pitch:
      'dictionary-of-ai-coding é um glossário open source de Matt Pocock que explica termos como evals, non-determinism e agentic harness em inglês claro para reduzir confusão no trabalho com agentes.',
    whenToUse:
      'Use como contexto de referência para LLMs, onboarding de times e padronização de vocabulário em projetos de AI coding.',
    whenNotToUse:
      'Evite transformar glossário em verdade absoluta. O vocabulário muda rápido e termos precisam ser validados contra o uso real do time.',
    targetUsers: ['Engenheiros de IA', 'Tech leads', 'Usuários de agentes', 'Times em onboarding'],
    projectType: 'learning',
    categories: ['Aprendizado', 'DevTools com IA'],
    tags: ['AI coding', 'Glossary', 'Matt Pocock', 'Terminology', 'Agents', 'Evals'],
  },
  {
    rank: 12,
    name: 'pu',
    repo: 'https://github.com/NahimNasser/pu',
    title: 'pu.sh: agente de código minimalista em shell script',
    pitch:
      'pu.sh é um harness de agente autônomo escrito em cerca de 400 linhas de shell script padrão, usando Bash, curl e awk, com loop interativo, ferramentas de edição e suporte a Anthropic e OpenAI.',
    whenToUse:
      'Use para estudar a essência de um agente de código ou rodar automação em servidores mínimos sem Node.js, Python ou dependências pesadas.',
    whenNotToUse:
      'Evite em fluxos críticos sem sandbox, testes e revisão. Minimalismo facilita auditoria, mas não substitui governança de execução de comandos.',
    targetUsers: ['Unix power users', 'Pesquisadores de agentes', 'DevOps', 'Minimalistas'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Terminal'],
    tags: ['Shell', 'Bash', 'OpenAI', 'Anthropic', 'Coding agent', 'CLI'],
  },
  {
    rank: 13,
    name: 'baguette',
    repo: 'https://github.com/tddworks/baguette',
    title: 'baguette: gerenciador headless de iOS Simulator',
    pitch:
      'baguette é uma CLI Swift para iOS 26 que inicializa simuladores, transmite telas a 60 FPS e injeta taps, swipes e gestos multifinger sem abrir a GUI pesada do Xcode Simulator.',
    whenToUse:
      'Use em farms locais de simuladores, testes mobile assistidos por agente e automações que precisam controlar dispositivos virtuais pela web.',
    whenNotToUse:
      'Evite se você precisa de compatibilidade ampla com versões antigas de iOS/Xcode ou de uma suíte de testes mobile tradicional pronta.',
    targetUsers: ['Desenvolvedores iOS', 'Times QA mobile', 'Builders de agentes', 'Usuários Swift'],
    projectType: 'developer-tool',
    categories: ['Mobile', 'DevTools com IA'],
    tags: ['iOS Simulator', 'Swift', 'Headless', 'Gestures', '60 FPS', 'Testing'],
  },
  {
    rank: 14,
    name: 'syswatch',
    repo: 'https://github.com/matthart1983/syswatch',
    title: 'syswatch: diagnóstico de sistema em TUI com insights',
    pitch:
      'syswatch é uma TUI de diagnóstico para macOS e Linux com 12 abas de CPU, memória, energia e GPU, além de uma aba Insights que explica gargalos em linguagem clara.',
    whenToUse:
      'Use antes de abrir ferramentas mais pesadas quando precisa entender rapidamente por que uma máquina está lenta, aquecendo ou consumindo memória.',
    whenNotToUse:
      'Evite como solução de observabilidade distribuída. O foco é diagnóstico single-host, não monitoramento centralizado de frota.',
    targetUsers: ['DevOps', 'Desenvolvedores', 'Usuários Linux/macOS', 'SREs'],
    projectType: 'infra',
    categories: ['Infra', 'Terminal'],
    tags: ['TUI', 'System monitor', 'Linux', 'macOS', 'GPU', 'Diagnostics'],
  },
  {
    rank: 15,
    name: 'open-design',
    repo: 'https://github.com/nexu-io/open-design',
    title: 'open-design: alternativa local-first ao Claude Design',
    pitch:
      'open-design é uma alternativa open source e local-first para gerar interfaces com agentes como Claude Code, Codex ou modelos locais, renderizando a UI em preview sandboxed e exportando HTML, PDF ou PowerPoint.',
    whenToUse:
      'Use quando quer iterar UI com agente mantendo preview local, sem depender de uma experiência fechada de fornecedor.',
    whenNotToUse:
      'Evite tratar sistemas de design pré-carregados como substitutos de direção visual. O agente ainda precisa de revisão humana e contexto de marca.',
    targetUsers: ['Design engineers', 'Usuários Codex', 'Usuários Claude Code', 'Times frontend'],
    projectType: 'frontend',
    categories: ['Frontend', 'DevTools com IA'],
    tags: ['UI generation', 'Codex', 'Claude Code', 'Design systems', 'HTML export', 'Local first'],
  },
  {
    rank: 16,
    name: 'codex-plusplus',
    repo: 'https://github.com/b-nnett/codex-plusplus',
    title: 'codex-plusplus: sistema de tweaks para o app desktop do Codex',
    pitch:
      'codex-plusplus modifica o app desktop popular do Codex para permitir plugins customizados, incluindo painéis como um iOS Simulator espelhado dentro do ambiente de coding agent.',
    whenToUse:
      'Use como experimento de workspace hackável quando você quer integrar visualizações e ferramentas customizadas ao lado do agente.',
    whenNotToUse:
      'Evite em ambiente profissional sem entender impacto em updates, segurança e integridade do app original. Tweaks em aplicativo base podem quebrar com versões novas.',
    targetUsers: ['Power users Codex', 'Hackers de ferramentas', 'Desenvolvedores mobile', 'Builders de plugins'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'Desktop'],
    tags: ['Codex', 'Desktop app', 'Plugins', 'iOS Simulator', 'Workspace', 'Tweaks'],
  },
  {
    rank: 17,
    name: 'medkit-app',
    repo: 'https://github.com/bedriyan/medkit-app',
    title: 'medkit-app: simulador de paciente com IA para treinamento clínico',
    pitch:
      'medkit-app é um simulador voice-first de pacientes com IA para estudantes de medicina, permitindo conversar, coletar história, pedir exames, prescrever tratamentos e receber avaliação de um AI Attending Grader.',
    whenToUse:
      'Use em contexto educacional, simulações supervisionadas e prototipagem de treinamento clínico com feedback estruturado.',
    whenNotToUse:
      'Evite usar para diagnóstico, decisão clínica real ou treinamento sem supervisão. Ferramentas médicas exigem validação, revisão especializada e limites explícitos.',
    targetUsers: ['Estudantes de medicina', 'Educadores clínicos', 'Health-tech builders', 'Pesquisadores'],
    projectType: 'llm-app',
    categories: ['IA aplicada', 'Educação'],
    tags: ['Healthcare', 'Medical education', 'Voice AI', 'Simulation', 'Guidelines', 'Next.js'],
  },
  {
    rank: 18,
    name: 'medal-forge',
    repo: 'https://github.com/CatsJuice/medal-forge',
    title: 'medal-forge: transforme SVGs em medalhas e badges 3D',
    pitch:
      'medal-forge é um protótipo Next.js que extruda SVGs 2D em medalhas, badges e placas 3D, com ajuste de espessura, bevel, materiais como ouro escovado e exportação GLB ou snippet React Three Fiber.',
    whenToUse:
      'Use para transformar logos e ícones em assets 3D promocionais, protótipos de produto, badges digitais ou cenas React Three Fiber.',
    whenNotToUse:
      'Evite quando a necessidade é modelagem 3D complexa, malha otimizada para jogo ou pipeline profissional de CAD.',
    targetUsers: ['Frontends React', 'Designers técnicos', 'Times de marketing', 'Criadores 3D'],
    projectType: 'frontend',
    categories: ['Frontend', 'Design tools'],
    tags: ['SVG', '3D', 'GLB', 'React Three Fiber', 'Next.js', 'Badges'],
  },
  {
    rank: 19,
    name: 'Reversa',
    repo: 'https://github.com/sandeco/reversa',
    title: 'Reversa: engenharia reversa de especificações para legados',
    pitch:
      'Reversa é um framework de reverse engineering de especificações que coordena 14 subagentes para analisar projetos legados, extrair arquitetura, gerar specs rastreáveis, diagramas C4 e contratos de API.',
    whenToUse:
      'Use em discovery de sistemas legados, modernização, documentação inicial e auditoria de codebases grandes sem documentação confiável.',
    whenNotToUse:
      'Evite aceitar especificações geradas como verdade sem validação com código, testes e pessoas do domínio. Agentes ajudam a mapear, mas podem inferir errado.',
    targetUsers: ['Arquitetos', 'Consultores de legado', 'Tech leads', 'Usuários de agentes'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Documentação técnica'],
    tags: ['Reverse engineering', 'Legacy code', 'C4 diagrams', 'Specifications', 'Subagents', 'API contracts'],
  },
  {
    rank: 20,
    name: 'deepclaude',
    repo: 'https://github.com/aattaran/deepclaude',
    title: 'deepclaude: experiência Claude Code com modelo DeepSeek',
    pitch:
      'deepclaude redireciona o loop de ferramentas do Claude Code para usar um modelo DeepSeek mais barato, preservando comandos, edição de arquivos e subagentes com a mesma experiência operacional.',
    whenToUse:
      'Use como experimento de redução de custo quando o fluxo Claude Code é útil, mas o gasto por tokens impede execuções longas.',
    whenNotToUse:
      'Evite em projetos sensíveis sem revisar compatibilidade, privacidade, termos de uso e qualidade real das respostas do modelo alternativo.',
    targetUsers: ['Usuários Claude Code', 'Times com orçamento restrito', 'Pesquisadores de agents', 'DevTools hackers'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'DevTools com IA'],
    tags: ['Claude Code', 'DeepSeek', 'Cost reduction', 'Tool loop', 'Subagents', 'CLI'],
  },
  {
    rank: 21,
    name: 'OpenKB',
    repo: 'https://github.com/VectifyAI/OpenKB',
    title: 'OpenKB: wiki persistente para conhecimento que se acumula',
    pitch:
      'OpenKB implementa a ideia de LLM Wiki: compilar PDFs e Markdown em uma wiki interligada e persistente, usando indexação em árvore em vez de depender só de bancos vetoriais tradicionais.',
    whenToUse:
      'Use para bases de conhecimento que precisam melhorar com o tempo, produzir artigos interligados e evitar recuperar sempre os mesmos chunks crus.',
    whenNotToUse:
      'Evite quando a necessidade é busca factual simples ou compliance rígido sem revisão. Síntese automática de conhecimento precisa de validação.',
    targetUsers: ['Pesquisadores', 'Times de conhecimento', 'Builders RAG', 'Usuários de second brain'],
    projectType: 'data-ai',
    categories: ['Data/AI', 'Knowledge management'],
    tags: ['LLM Wiki', 'Knowledge base', 'Markdown', 'PDF', 'Tree indexing', 'RAG'],
  },
  {
    rank: 22,
    name: 'claude-code-from-source',
    repo: 'https://github.com/alejandrobalderas/claude-code-from-source',
    title: 'claude-code-from-source: estudo educacional da arquitetura do Claude Code',
    pitch:
      'claude-code-from-source é um mergulho educacional de cerca de 400 páginas que reverse-engineera padrões, roteamento de ferramentas e gestão de contexto do Claude Code a partir de source maps, sem publicar código proprietário.',
    whenToUse:
      'Use para estudar arquitetura de agentes, tool routing, compactação de contexto, loops de execução e decisões de produto em CLIs autônomas.',
    whenNotToUse:
      'Evite copiar padrões sem avaliar licenças, ética e adequação ao seu produto. O valor principal é aprendizado arquitetural.',
    targetUsers: ['Builders de agentes', 'Arquitetos de software', 'Estudantes avançados', 'Usuários Claude Code'],
    projectType: 'learning',
    categories: ['Aprendizado', 'IA e agentes'],
    tags: ['Claude Code', 'Architecture', 'Agents', 'Reverse engineering', 'Tool routing', 'Context management'],
  },
  {
    rank: 23,
    name: 'FlashQLA',
    repo: 'https://github.com/QwenLM/FlashQLA',
    title: 'FlashQLA: kernels de atenção linear de alta performance da Qwen',
    pitch:
      'FlashQLA é uma biblioteca de kernels de atenção linear baseada em TileLang, com fusão de operadores e reformulações para acelerar treinamento e inferência em GPUs NVIDIA Hopper.',
    whenToUse:
      'Use em pesquisa e engenharia de modelos quando performance de atenção linear em Hopper é gargalo e há capacidade de compilar, testar e comparar kernels.',
    whenNotToUse:
      'Evite se você não controla o ambiente CUDA/GPU ou precisa de abstração simples. Kernels especializados exigem benchmark rigoroso e compatibilidade de hardware.',
    targetUsers: ['Pesquisadores de ML', 'Engenheiros de performance', 'Times de infraestrutura LLM', 'Usuários NVIDIA Hopper'],
    projectType: 'data-ai',
    categories: ['Data/AI', 'Infra'],
    tags: ['Qwen', 'TileLang', 'Linear attention', 'CUDA', 'Hopper', 'Kernel optimization'],
  },
  {
    rank: 24,
    name: 'dbx',
    repo: 'https://github.com/t8y2/dbx',
    title: 'dbx: cliente de banco leve com servidor MCP embutido',
    pitch:
      'dbx é um cliente cross-platform de bancos para MySQL, Postgres, SQLite, Redis, DuckDB e MongoDB, com instalador pequeno e servidor MCP embutido para agentes consultarem bancos locais.',
    whenToUse:
      'Use quando precisa de cliente leve para múltiplos bancos e quer conectar agentes como Cursor ou Windsurf a queries naturais via MCP.',
    whenNotToUse:
      'Evite dar acesso irrestrito a bancos reais para agentes. Use usuários read-only, bancos de staging e políticas claras antes de conectar produção.',
    targetUsers: ['Desenvolvedores backend', 'DBAs', 'Usuários MCP', 'Data analysts'],
    projectType: 'mcp',
    categories: ['MCP', 'Banco de dados'],
    tags: ['Database client', 'MCP', 'Postgres', 'SQLite', 'Redis', 'DuckDB'],
  },
  {
    rank: 25,
    name: 'RunbookHermes',
    repo: 'https://github.com/Tommy-yw/RunbookHermes',
    title: 'RunbookHermes: agentes operacionais conectados a runbooks',
    pitch:
      'RunbookHermes conecta um modelo Hermes a runbooks operacionais para que, quando um alerta dispara, o agente leia documentação, conecte na infraestrutura e execute mitigação de forma assistida.',
    whenToUse:
      'Use como referência para automação de incidentes, chatops e execução guiada de runbooks em ambientes com procedimentos bem documentados.',
    whenNotToUse:
      'Evite autonomia total em produção sem aprovações, limites, logs e rollback. Incidentes reais pedem controle e responsabilidade clara.',
    targetUsers: ['DevOps', 'SREs', 'Operadores Hermes', 'Times de plataforma'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Operações'],
    tags: ['Runbooks', 'Hermes', 'Incident response', 'DevOps', 'Automation', 'SRE'],
  },
  {
    rank: 26,
    name: 'OpenClaude-Portable',
    repo: 'https://github.com/techjarves/OpenClaude-Portable',
    title: 'OpenClaude-Portable: agente de código portátil em uma pasta',
    pitch:
      'OpenClaude-Portable empacota um agente estilo Claude Code em uma pasta portátil para Windows, Mac e Linux, com histórico e configurações carregáveis por USB e sem instalação permanente no host.',
    whenToUse:
      'Use em máquinas temporárias, laboratórios, ambientes bloqueados ou demonstrações em que você precisa levar um ambiente de agente junto com suas configurações.',
    whenNotToUse:
      'Evite em computadores não confiáveis ou políticas corporativas restritas. Portabilidade não elimina riscos de credenciais, logs e execução local.',
    targetUsers: ['Consultores', 'Power users', 'Usuários multi-OS', 'Builders de agentes'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Desktop'],
    tags: ['Portable app', 'Claude Code', 'Windows', 'macOS', 'Linux', 'USB'],
  },
  {
    rank: 27,
    name: 'laravel-brain',
    repo: 'https://github.com/laramint/laravel-brain',
    title: 'laravel-brain: grafo interativo da arquitetura Laravel',
    pitch:
      'laravel-brain analisa estaticamente projetos Laravel e renderiza um grafo interativo de rotas, controllers, eventos e jobs para entender rapidamente o fluxo de uma aplicação.',
    whenToUse:
      'Use ao assumir projetos Laravel grandes, revisar arquitetura, mapear dependências e explicar fluxo de dados sem ler todos os arquivos manualmente.',
    whenNotToUse:
      'Evite se o sistema depende fortemente de metaprogramação, runtime dinâmico ou integrações externas invisíveis para análise estática.',
    targetUsers: ['Desenvolvedores Laravel', 'Tech leads', 'Consultores de legado', 'Arquitetos'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Backend'],
    tags: ['Laravel', 'Static analysis', 'Architecture graph', 'Routes', 'Controllers', 'PHP'],
  },
  {
    rank: 28,
    name: 'webpull',
    repo: 'https://github.com/Dhravya/webpull',
    title: 'webpull: transforme sites de documentação em Markdown limpo',
    pitch:
      'webpull é uma CLI rápida que crawleia documentação pública via sitemap ou links e salva tudo em Markdown limpo, usando Defuddle para extração inteligente de conteúdo.',
    whenToUse:
      'Use para preparar contexto local para agentes, criar snapshots de docs públicas e reduzir HTML inútil antes de alimentar LLMs.',
    whenNotToUse:
      'Evite crawlear sites sem respeitar termos, robots e limites. Para docs privadas ou pagas, use apenas com permissão explícita.',
    targetUsers: ['Usuários de agentes', 'Tech writers', 'Desenvolvedores', 'Pesquisadores'],
    projectType: 'developer-tool',
    categories: ['Documentação técnica', 'DevTools com IA'],
    tags: ['Markdown', 'Crawler', 'Documentation', 'Defuddle', 'CLI', 'LLM context'],
  },
  {
    rank: 29,
    name: 'devl.dev',
    repo: 'https://github.com/sean-brydon/devl.dev',
    title: 'devl.dev: scratchpad open source de componentes UI polidos',
    pitch:
      'devl.dev é um scratchpad e registry open source de componentes experimentais em Tailwind v4 e Base UI, com designs polidos para inspiração e prototipagem.',
    whenToUse:
      'Use como referência visual, fonte de padrões e laboratório para componentes quando estiver desenhando interfaces modernas sem montar monorepo pesado.',
    whenNotToUse:
      'Evite copiar componentes sem adaptar tokens, acessibilidade, responsividade e linguagem visual do produto.',
    targetUsers: ['Frontend engineers', 'Design engineers', 'Product designers', 'Prototypers'],
    projectType: 'frontend',
    categories: ['Frontend', 'Design tools'],
    tags: ['Tailwind v4', 'Base UI', 'Components', 'Registry', 'UI design', 'Scratchpad'],
  },
  {
    rank: 30,
    name: 'petdex',
    repo: 'https://github.com/crafter-station/petdex',
    title: 'petdex: galeria de pets animados para o app Codex',
    pitch:
      'petdex é uma galeria pública de pets animados compatíveis com o app desktop do Codex, com preview dos estados de animação e download de packs.',
    whenToUse:
      'Use quando você quer personalizar o ambiente Codex com assets animados e explorar packs aprovados antes de instalar.',
    whenNotToUse:
      'Evite em ambientes corporativos com política visual restrita ou quando animações viram distração. Personalização deve ajudar, não atrapalhar foco.',
    targetUsers: ['Usuários Codex desktop', 'Criadores de assets', 'Power users', 'Comunidade Codex'],
    projectType: 'frontend',
    categories: ['DevTools com IA', 'Design tools'],
    tags: ['Codex', 'Animated pets', 'Gallery', 'Desktop customization', 'Assets', 'UI'],
  },
  {
    rank: 31,
    name: 'l123',
    repo: 'https://github.com/duane1024/l123',
    title: 'l123: planilha terminal estilo Lotus 1-2-3 em Rust',
    pitch:
      'l123 é uma planilha de terminal em Rust inspirada no Lotus 1-2-3, com estética DOS, navegação por teclado e compatibilidade moderna para ler e escrever arquivos .xlsx.',
    whenToUse:
      'Use em servidores headless, SSH e fluxos keyboard-first quando você precisa editar tabelas ou dados financeiros sem abrir uma GUI pesada.',
    whenNotToUse:
      'Evite quando o fluxo depende de colaboração cloud, macros complexas ou recursos avançados específicos do Excel moderno.',
    targetUsers: ['Usuários terminal', 'Analistas técnicos', 'Desenvolvedores Rust', 'Power users SSH'],
    projectType: 'developer-tool',
    categories: ['Terminal', 'Produtividade'],
    tags: ['Rust', 'Spreadsheet', 'Terminal', 'XLSX', 'Lotus 1-2-3', 'TUI'],
  },
  {
    rank: 32,
    name: 'Git Commands Cheatsheet',
    repo: 'https://github.com/abdosorour7/git-commands-cheatsheet',
    title: 'Git Commands Cheatsheet: 92 comandos Git pesquisáveis',
    pitch:
      'Git Commands Cheatsheet reúne 92 comandos Git em 11 categorias dentro de uma UI pesquisável em JavaScript puro, com comandos destrutivos marcados por avisos e busca pela tecla slash.',
    whenToUse:
      'Use como referência rápida para comandos Git, onboarding de devs e recuperação de sintaxe sem abrir várias abas de Stack Overflow.',
    whenNotToUse:
      'Evite copiar comandos destrutivos sem entender estado do repositório. Rebase, reset e clean exigem cuidado com trabalho não commitado.',
    targetUsers: ['Desenvolvedores', 'Estudantes', 'Tech leads', 'Usuários Git'],
    projectType: 'learning',
    categories: ['Aprendizado', 'DevTools'],
    tags: ['Git', 'Cheatsheet', 'JavaScript', 'Search', 'Developer tools', 'Learning'],
  },
  {
    rank: 33,
    name: 'klattsch',
    repo: 'https://github.com/tgies/klattsch',
    title: 'klattsch: sintetizador de fala robótica old-school',
    pitch:
      'klattsch é um sintetizador formant primitivo para gerar fonemas de fala robótica estilo anos 80/90, rodando como pacote npm no Node.js, navegador ou CLI.',
    whenToUse:
      'Use em jogos, brinquedos de áudio, instalações web e protótipos que querem voz sintética retrô gerada dinamicamente.',
    whenNotToUse:
      'Evite se a exigência é voz natural, acessibilidade por speech de alta qualidade ou narração realista.',
    targetUsers: ['Desenvolvedores de jogos', 'Criadores web', 'Artistas sonoros', 'Usuários Node.js'],
    projectType: 'frontend',
    categories: ['Frontend', 'Áudio'],
    tags: ['Speech synthesis', 'Formant', 'Node.js', 'Browser', 'CLI', 'Retro audio'],
  },
  {
    rank: 34,
    name: 'friendmaker',
    repo: 'https://github.com/zhouxiyu1997/friendmaker',
    title: 'friendmaker: pixel art automatizado para Tomodachi Life',
    pitch:
      'friendmaker é um toolkit macOS e Windows para Tomodachi Life no Nintendo Switch que converte imagens em grids de pixels e gera scripts de controle físico via ESP32 emulando Pro Controller.',
    whenToUse:
      'Use como projeto maker para automatizar desenho de pixel art em ambiente próprio, combinando conversão de imagem e controle físico autorizado.',
    whenNotToUse:
      'Evite em jogos online, ambientes competitivos ou qualquer uso que viole termos de serviço. A proposta faz sentido como automação criativa local.',
    targetUsers: ['Makers', 'Fãs de Tomodachi Life', 'Usuários ESP32', 'Criadores de pixel art'],
    projectType: 'automation',
    categories: ['Automação', 'Hardware'],
    tags: ['Nintendo Switch', 'ESP32', 'Pixel art', 'Controller emulation', 'macOS', 'Windows'],
  },
  {
    rank: 35,
    name: 'club-3090',
    repo: 'https://github.com/noonghunna/club-3090',
    title: 'club-3090: receitas para servir LLMs grandes em RTX 3090',
    pitch:
      'club-3090 reúne receitas comunitárias otimizadas para rodar modelos grandes, como Qwen de dezenas de bilhões de parâmetros, em RTX 3090 usando configurações de vLLM e llama.cpp.',
    whenToUse:
      'Use quando você tem RTX 3090 e quer comparar configurações práticas para maximizar tokens por segundo em inferência local.',
    whenNotToUse:
      'Evite aplicar receitas sem medir consumo, temperatura, estabilidade e qualidade. Otimização local de LLM é sensível a hardware, driver e quantização.',
    targetUsers: ['Usuários de LLM local', 'Homelabbers', 'Engenheiros de inferência', 'Donos de RTX 3090'],
    projectType: 'infra',
    categories: ['Infra', 'Data/AI'],
    tags: ['RTX 3090', 'vLLM', 'llama.cpp', 'Qwen', 'Local LLM', 'Inference'],
  },
]

async function fetchGithubMeta(owner: string, repo: string): Promise<GithubRepoMeta | null> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'BitflixCatalogSeed/1.0 (+https://bitflix.com.br)',
    },
  })

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    console.warn(
      `GitHub metadata indisponivel para ${owner}/${repo}: HTTP ${response.status}; remaining=${remaining ?? 'n/a'}; reset=${reset ?? 'n/a'}`,
    )
    return null
  }

  return (await response.json()) as GithubRepoMeta
}

async function findOneBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'authors' | 'categories' | 'tags' | 'articles' | 'open-source-catalog-entries',
  slug: string,
) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

async function ensureTerm(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'categories' | 'tags',
  name: string,
) {
  const slug = slugify(name)
  const existing = await findOneBySlug(payload, collection, slug)
  if (existing?.id) return existing.id

  const created = await payload.create({
    collection,
    data: { name, slug, is_active: true },
  })
  return created.id
}

async function ensureAuthor(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await findOneBySlug(payload, 'authors', 'milton-bastos')
  if (existing?.id) return existing.id

  const created = await payload.create({
    collection: 'authors',
    data: {
      name: 'Milton Bastos',
      slug: 'milton-bastos',
      bio: 'Fundador da Bitflix. Escreve sobre software, IA aplicada e produtos digitais.',
      email: 'miltonbastos@gmail.com',
    },
  })
  return created.id
}

async function upsertArticle(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: CatalogSeed,
  authorId: number,
  categoryIds: number[],
  tagIds: number[],
  meta: GithubRepoMeta | null,
) {
  const { owner, repo } = repoParts(seed.repo)
  const slug = articleSlug(seed)
  const data = {
    title: seed.title,
    slug,
    excerpt: firstSentence(seed.pitch),
    body_lexical: bodyLexical(seed, owner, repo, meta),
    source: {
      original_title: seed.name,
      original_author: owner,
      original_site: 'GitHub',
      original_url: seed.repo,
      license_note: `Artigo baseado na descrição enviada pelo usuário e em metadados públicos do GitHub consultados em ${new Date().toLocaleDateString('pt-BR')}.`,
    },
    language_origin: 'en',
    disclaimer_variant: 'ai-adapted-from-text',
    is_bitflix_take: true,
    author: authorId,
    categories: categoryIds,
    tags: tagIds,
    status: 'published',
    published_at: new Date().toISOString(),
    is_active: true,
    created_via: 'manual',
  }

  const existing = await findOneBySlug(payload, 'articles', slug)
  if (existing?.id) {
    return (await payload.update({
      collection: 'articles',
      id: existing.id,
      data: data as never,
    })) as Article
  }

  return (await payload.create({
    collection: 'articles',
    data: data as never,
  })) as Article
}

async function upsertCatalogEntry(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: CatalogSeed,
  article: Article,
  categoryIds: number[],
  tagIds: number[],
  meta: GithubRepoMeta | null,
) {
  const { owner, repo } = repoParts(seed.repo)
  const existing = await findOneBySlug(payload, 'open-source-catalog-entries', entrySlug(seed))
  const data = {
    title: seed.name,
    slug: entrySlug(seed),
    article: article.id,
    repository_url: seed.repo,
    repository_owner: owner,
    repository_name: repo,
    source_links: [
      { label: 'Repositório GitHub', url: seed.repo },
      { label: 'README', url: `${seed.repo}/blob/main/README.md` },
    ],
    summary_pt_br: firstSentence(seed.pitch),
    what_it_does: seed.pitch,
    when_to_use: seed.whenToUse,
    when_not_to_use: seed.whenNotToUse,
    target_users: seed.targetUsers.map((label) => ({ label })),
    project_type: seed.projectType,
    categories: categoryIds,
    tags: tagIds,
    last_checked_at: new Date().toISOString(),
    readme_excerpt: seed.pitch.slice(0, 1200),
    discovery_source_url: DISCOVERY_SOURCE_URL,
    discovery_source_name: DISCOVERY_SOURCE_NAME,
    catalog_status: 'published',
    is_featured: seed.rank <= 5,
    is_active: true,
    ...(meta
      ? {
          homepage_url: meta.homepage || undefined,
          description_original: meta.description ?? '',
          github_topics: (meta.topics ?? []).slice(0, 12).map((topic) => ({ topic })),
          primary_language: meta.language ?? undefined,
          license: licenseLabel(meta) || undefined,
          stars: meta.stargazers_count ?? 0,
          forks: meta.forks_count ?? 0,
          open_issues: meta.open_issues_count ?? 0,
          last_pushed_at: meta.pushed_at ?? undefined,
        }
      : {}),
  }

  if (existing?.id) {
    return (await payload.update({
      collection: 'open-source-catalog-entries',
      id: existing.id,
      data: data as never,
    })) as OpenSourceCatalogEntry
  }

  return (await payload.create({
    collection: 'open-source-catalog-entries',
    data: data as never,
  })) as OpenSourceCatalogEntry
}

async function upsertImportRecord(payload: Awaited<ReturnType<typeof getPayload>>, importedCount = 0, done = false) {
  const existingImport = await payload.find({
    collection: 'open-source-catalog-imports',
    where: {
      and: [{ source_url: { equals: DISCOVERY_SOURCE_URL } }, { source_name: { equals: DISCOVERY_SOURCE_NAME } }],
    },
    limit: 1,
    sort: 'createdAt',
  })

  const data = {
    source_url: DISCOVERY_SOURCE_URL,
    source_name: DISCOVERY_SOURCE_NAME,
    requested_by: 'Milton Bastos via Codex',
    status: done ? 'done' : 'running',
    repos_found_count: seeds.length,
    repos_imported_count: importedCount,
    repos_skipped_count: 0,
    started_at: new Date().toISOString(),
    finished_at: done ? new Date().toISOString() : undefined,
    notes:
      'Lote criado a partir do conteúdo colado pelo usuário no chat. O script processa um repositório por vez: consulta metadados públicos no GitHub, publica o post e atualiza a entrada do catálogo antes de seguir para o próximo.',
  } as const

  if (existingImport.docs[0]?.id) {
    return payload.update({
      collection: 'open-source-catalog-imports',
      id: existingImport.docs[0].id,
      data: data as never,
    })
  }

  return payload.create({
    collection: 'open-source-catalog-imports',
    data,
  })
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const payload = await getPayload({ config })
  const authorId = await ensureAuthor(payload)
  let importRecord = await upsertImportRecord(payload)
  const indexedDocs: Array<Record<string, unknown>> = []

  for (const seed of seeds) {
    const { owner, repo } = repoParts(seed.repo)
    const meta = await fetchGithubMeta(owner, repo)
    const categoryIds = []
    const tagIds = []

    for (const name of seed.categories) categoryIds.push(await ensureTerm(payload, 'categories', name))
    for (const name of seed.tags) tagIds.push(await ensureTerm(payload, 'tags', name))

    const article = await upsertArticle(payload, seed, authorId, categoryIds, tagIds, meta)
    const entry = await upsertCatalogEntry(payload, seed, article, categoryIds, tagIds, meta)

    await payload.update({
      collection: 'open-source-catalog-entries',
      id: entry.id,
      data: { discovery_batch_id: importRecord.id } as never,
    })

    indexedDocs.push({
      rank: seed.rank,
      name: seed.name,
      repository: seed.repo,
      article: `/blog/${article.slug}`,
      catalogSlug: entry.slug,
      projectType: seed.projectType,
      primaryLanguage: meta?.language ?? null,
      license: licenseLabel(meta) || null,
      stars: meta?.stargazers_count ?? null,
      summary: firstSentence(seed.pitch),
      whatItDoes: seed.pitch,
      whenToUse: seed.whenToUse,
      whenNotToUse: seed.whenNotToUse,
      targetUsers: seed.targetUsers,
      tags: seed.tags,
      githubTopics: meta?.topics ?? [],
    })

    importRecord = await upsertImportRecord(payload, indexedDocs.length)
    console.log(`✓ ${seed.rank}. ${seed.name} -> /blog/${article.slug}`)
    await sleep(900)
  }

  importRecord = await upsertImportRecord(payload, indexedDocs.length, true)

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        total: indexedDocs.length,
        importId: importRecord.id,
        source: DISCOVERY_SOURCE_NAME,
        indexedDocs,
      },
      null,
      2,
    ),
  )
}

await main()
