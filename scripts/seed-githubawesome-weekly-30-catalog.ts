/**
 * Seed idempotente do lote Github Awesome weekly #30.
 *
 * Uso:
 *   pnpm exec payload run scripts/seed-githubawesome-weekly-30-catalog.ts
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
  summary: string
  whatItDoes: string
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

const fallbackGithubMeta: Record<string, GithubRepoMeta> = {
  'Neighbor-Z/SwiftMTP': {
    language: 'Swift',
    license: { spdx_id: 'GPL-2.0' },
    stargazers_count: 247,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['android', 'androidfilemanager', 'file-transfer', 'macos', 'mtp', 'swift', 'tools', 'utility'],
  },
  'kapishdima/remocn': {
    language: 'TypeScript',
    stargazers_count: 360,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
  'pithings/coderaft': {
    language: 'JavaScript',
    stargazers_count: 184,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
  'xicilion/boxsh': {
    language: 'JavaScript',
    license: { spdx_id: 'Other' },
    stargazers_count: 299,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
  'ProjectPhysX/hw-smi': {
    language: 'C++',
    license: { spdx_id: 'Other' },
    stargazers_count: 255,
    forks_count: 0,
    open_issues_count: 0,
    topics: [
      'amdgpu',
      'ascii',
      'command-line-tool',
      'cpu',
      'geforce',
      'gpu',
      'gpu-monitoring',
      'hardware-monitor',
      'hardware-monitoring',
      'htop',
      'intel',
      'intel-arc',
      'nvidia',
      'nvml',
      'pcie',
      'radeon',
      'telemetry',
      'temperature-monitoring',
      'terminal',
      'vram-monitoring',
    ],
  },
  'millionco/cli-to-js': {
    language: 'TypeScript',
    license: { spdx_id: 'MIT' },
    stargazers_count: 377,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['agent', 'api', 'cli', 'node'],
  },
  'ibelick/mesurer': {
    language: 'TypeScript',
    license: { spdx_id: 'Other' },
    stargazers_count: 260,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
  'zarazhangrui/personalized-podcast': {
    language: 'Python',
    stargazers_count: 338,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['ai', 'claude-code', 'podcast', 'rss', 'text-to-speech', 'tts'],
  },
  'dominikmartn/ProgressiveBlurHeader': {
    language: 'Swift',
    license: { spdx_id: 'MIT' },
    stargazers_count: 417,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['blur', 'ios', 'progressive-blur', 'sticky-header', 'swift', 'swift-package', 'swiftui', 'uikit'],
  },
  'momenbasel/PureMac': {
    language: 'Swift',
    license: { spdx_id: 'MIT' },
    stargazers_count: 3730,
    forks_count: 0,
    open_issues_count: 0,
    topics: [
      'cache-cleaner',
      'cleanmymac',
      'cleanup',
      'disk-cleaner',
      'disk-space',
      'homebrew',
      'mac-utility',
      'macos',
      'macos-app',
      'macos-cleaner',
      'macosx',
      'native',
      'oss',
      'osx',
      'privacy',
      'swift',
      'swiftui',
      'system-cleaner',
      'xcode-cleaner',
    ],
  },
  'MarchLiu/hypatia': {
    language: 'Rust',
    license: { spdx_id: 'MIT' },
    stargazers_count: 213,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
  'labarba/sciwrite': {
    license: { spdx_id: 'Other' },
    stargazers_count: 646,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
  },
}

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

function bodyLexical(seed: CatalogSeed, owner: string, repoName: string, meta: GithubRepoMeta | null) {
  const primaryLanguage = meta?.language ? ` O repositório aparece principalmente em ${meta.language}.` : ''
  const license = licenseLabel(meta)
  const licenseText = license ? ` A licença registrada no GitHub é ${license}.` : ''

  return {
    root: {
      children: [
        paragraph(
          `${seed.name} entrou no radar da Bitflix na lista Github Awesome weekly #30 porque resolve um problema muito concreto para quem trabalha com IA, desenvolvimento de software ou automação técnica. A ideia central é simples: ${seed.summary}`,
        ),
        paragraph(
          `Este post transforma a descrição original em uma leitura editorial em PT-BR, com foco em quando o projeto pode ser útil, onde ele pode criar risco e por que vale acompanhar o repositório ${owner}/${repoName}.${primaryLanguage}${licenseText}`,
        ),

        heading(`O que é ${seed.name}`),
        paragraph(seed.whatItDoes),
        paragraph(
          meta?.description
            ? `A descrição pública do GitHub reforça esse posicionamento: ${meta.description}`
            : `Mesmo sem depender de copy comercial, o projeto se encaixa em uma tendência clara: ferramentas menores, mais específicas e mais fáceis de encaixar em workflows reais de desenvolvimento com IA.`,
        ),

        heading('Por que vale acompanhar'),
        paragraph(
          `O ponto interessante não é apenas a feature isolada. ${seed.name} sinaliza uma mudança maior: agentes e ferramentas de desenvolvimento estão ficando mais especializados, mais locais e mais integráveis ao fluxo real de trabalho.`,
        ),
        paragraph(
          'Para a Bitflix, esse tipo de projeto importa porque mostra caminhos para entregar IA como produto final: interfaces melhores, automações verificáveis, memória estruturada, sandboxes, documentação visual, processamento local e tooling que reduz atrito para usuários técnicos.',
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
          `O ponto de partida é o repositório oficial no GitHub. Para investigar localmente, comece clonando o projeto em uma pasta descartável e lendo o README antes de executar qualquer comando de instalação.`,
        ),
        code(`git clone ${seed.repo}
cd ${repoName}
# leia o README e a licença antes de rodar scripts do projeto`),

        heading('Leitura Bitflix'),
        paragraph(
          `A leitura Bitflix sobre ${seed.name}: vale acompanhar porque combina uma tese específica com utilidade prática. O projeto pode não ser a escolha certa para todos os times, mas representa bem o momento atual do ecossistema: menos demos genéricas e mais ferramentas que resolvem gargalos pontuais de agentes, devtools, documentação, mídia, segurança ou operação local.`,
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
    name: '3dsvg',
    repo: 'https://github.com/renatoworks/3dsvg',
    title: '3dsvg: transforme SVGs 2D em componentes 3D interativos',
    summary:
      '3dsvg converte SVGs 2D em componentes 3D interativos no navegador, com materiais, animações e exportação para PNG 4K, MP4 ou JSX com react-three-fiber.',
    whatItDoes:
      'A ferramenta recebe um SVG, aplica presets visuais como vidro, cromado e holográfico, adiciona animações como flutuação ou rotação e exporta tanto mídia final quanto um snippet React pronto para projetos Next.js com Three.js.',
    whenToUse:
      'Use quando uma marca, ícone ou ilustração vetorial precisa virar ativo 3D sem abrir Blender ou montar pipeline manual de Three.js. É especialmente útil para landing pages, demos de produto, assets de marketing e protótipos rápidos.',
    whenNotToUse:
      'Evite quando o projeto exige modelagem 3D real, geometria complexa, animação física precisa ou controle fino de performance. SVG extrudado resolve identidade visual, não substitui pipeline 3D profissional.',
    targetUsers: ['Designers técnicos', 'Frontends React', 'Times de marketing', 'Criadores de landing pages'],
    projectType: 'frontend',
    categories: ['DevTools com IA', 'Frontend'],
    tags: ['SVG', 'Three.js', 'React', 'Next.js', '3D', 'Design tools'],
  },
  {
    rank: 2,
    name: 'Markdown Viewer Skills',
    repo: 'https://github.com/markdown-viewer/skills',
    title: 'Markdown Viewer Skills: documentação visual para agentes de IA',
    summary:
      'Markdown Viewer Skills reúne skills instaláveis para ensinar agentes a gerar diagramas, wireframes e visualizações usando Mermaid, PlantUML, Draw.io, Graphviz e outros motores.',
    whatItDoes:
      'O projeto empacota habilidades para que agentes criem documentação visual diretamente em Markdown, cobrindo arquiteturas cloud, árvores de dependência, wireframes, fluxos técnicos e até plantas baixas.',
    whenToUse:
      'Use quando o time já escreve documentação em Markdown e quer que o agente produza diagramas verificáveis junto com a explicação textual, sem depender de ferramentas soltas ou imagens coladas manualmente.',
    whenNotToUse:
      'Evite tratar os diagramas como arquitetura validada automaticamente. O agente pode desenhar com aparência correta e ainda representar dependências erradas se o contexto do sistema estiver incompleto.',
    targetUsers: ['Engenheiros de software', 'Arquitetos', 'Times de documentação', 'Usuários de agentes de código'],
    projectType: 'learning',
    categories: ['DevTools com IA', 'Documentação técnica'],
    tags: ['Markdown', 'Mermaid', 'PlantUML', 'Graphviz', 'AI skills', 'Documentação'],
  },
  {
    rank: 3,
    name: 'quien',
    repo: 'https://github.com/retlehs/quien',
    title: 'quien: investigação de domínios em uma TUI bonita e scriptável',
    summary:
      'quien junta WHOIS, DNS, mail servers, certificados SSL/TLS e detecção de stack HTTP em uma única TUI, com subcomandos e saída JSON estruturada.',
    whatItDoes:
      'A ferramenta prioriza RDAP, faz fallback para WHOIS e expõe consultas de domínio por interface terminal ou subcomandos como quien dns e quien stack, úteis para investigação manual ou automação por agentes.',
    whenToUse:
      'Use para checagens rápidas de domínio, auditoria leve de infraestrutura, diagnóstico de DNS, inspeção de certificados e enriquecimento programático em agentes que precisam entender um domínio sem parsear texto cru.',
    whenNotToUse:
      'Evite como substituto de um scanner de segurança completo. Informações públicas de DNS e headers ajudam triagem, mas não provam postura de segurança nem configuração interna.',
    targetUsers: ['DevOps', 'Security engineers', 'Agentes de investigação', 'Desenvolvedores backend'],
    projectType: 'security',
    categories: ['Segurança', 'Infra'],
    tags: ['WHOIS', 'DNS', 'RDAP', 'TLS', 'TUI', 'OSINT'],
  },
  {
    rank: 4,
    name: 'fireworks-tech-graph',
    repo: 'https://github.com/yizhiyanhua-ai/fireworks-tech-graph',
    title: 'fireworks-tech-graph: diagramas técnicos a partir de linguagem natural',
    summary:
      'fireworks-tech-graph é uma skill para Claude Code que gera diagramas de arquitetura técnica a partir de prompts em linguagem natural.',
    whatItDoes:
      'A skill transforma descrições como pipelines RAG, agentes com subagentes, memória Mem0, tool calling e busca agêntica em diagramas visuais profissionais gerados dentro do workspace.',
    whenToUse:
      'Use para criar rascunhos de arquitetura, explicar fluxos multiagente, documentar pipelines e gerar material visual para discussão técnica antes de consolidar a versão final.',
    whenNotToUse:
      'Evite publicar diagramas sem revisão humana. A ferramenta acelera visualização, mas não valida se a arquitetura descrita está correta, segura ou implementável.',
    targetUsers: ['Arquitetos de IA', 'Usuários de Claude Code', 'Times de produto técnico', 'Consultores'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'Documentação técnica'],
    tags: ['Claude Code', 'Diagrama', 'Arquitetura', 'RAG', 'Agents', 'Skill'],
  },
  {
    rank: 5,
    name: 'ios-marketing-capture',
    repo: 'https://github.com/ParthJadhav/ios-marketing-capture',
    title: 'ios-marketing-capture: screenshots de marketing automatizados para SwiftUI',
    summary:
      'ios-marketing-capture automatiza captura de screenshots e componentes SwiftUI com dados demo, múltiplos idiomas e transparência perfeita para materiais de App Store e marketing.',
    whatItDoes:
      'A skill injeta um sistema de captura no projeto SwiftUI sem impacto em produção, relança o app com ambientes de idioma diferentes e captura telas ou elementos isolados usando ImageRenderer.',
    whenToUse:
      'Use quando um app iOS precisa manter screenshots consistentes para várias localizações, widgets ou campanhas, reduzindo trabalho manual de simular estados e repetir capturas.',
    whenNotToUse:
      'Evite se o app ainda não tem estados demo confiáveis. A automação só gera bons materiais quando os dados de exemplo e fluxos visuais já estão preparados.',
    targetUsers: ['Desenvolvedores iOS', 'Times de App Store', 'Designers de produto', 'Marketing mobile'],
    projectType: 'automation',
    categories: ['Automação', 'Mobile'],
    tags: ['SwiftUI', 'iOS', 'Screenshots', 'App Store', 'Marketing', 'ImageRenderer'],
  },
  {
    rank: 6,
    name: 'gbrain',
    repo: 'https://github.com/garrytan/gbrain',
    title: 'gbrain: memória pessoal em Markdown para agentes de IA',
    summary:
      'gbrain é um sistema de memória de longo prazo para agentes, armazenando pessoas, empresas, reuniões e relações em arquivos Markdown versionados em Git.',
    whatItDoes:
      'O projeto propõe um cérebro digital baseado em Markdown: conversas, emails e transcrições são analisados para enriquecer entidades, criar referências cruzadas e manter um grafo de conhecimento pessoal.',
    whenToUse:
      'Use como referência se você quer um second brain auditável, portável e versionável, onde a memória do agente fica em arquivos legíveis em vez de apenas em banco vetorial opaco.',
    whenNotToUse:
      'Evite jogar dados sensíveis sem revisar políticas de privacidade, permissões de leitura e armazenamento. Um sistema que lê conversas e emails precisa de fronteiras claras.',
    targetUsers: ['Fundadores', 'Investidores', 'Executivos', 'Usuários avançados de agentes'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'Knowledge management'],
    tags: ['Memory', 'Markdown', 'Knowledge graph', 'Second brain', 'Git', 'Agents'],
  },
  {
    rank: 7,
    name: 'Bouncer',
    repo: 'https://github.com/imbue-ai/bouncer',
    title: 'Bouncer: filtro local e inteligente para feeds sociais',
    summary:
      'Bouncer é uma extensão de navegador que filtra feeds sociais por frases, tópicos ou emojis, com botão para treinar filtros locais a partir de posts indesejados.',
    whatItDoes:
      'A extensão remove posts combinando regras explícitas e sugestões de uma IA local. O botão Bounce This Post analisa um post irritante, sugere motivos e transforma a escolha em filtro permanente.',
    whenToUse:
      'Use quando o problema é reduzir ruído recorrente em redes sociais sem abandonar completamente o feed. É útil para foco, saúde mental digital e curadoria pessoal.',
    whenNotToUse:
      'Evite quando você precisa de moderação corporativa, compliance ou filtragem centralizada. A proposta é controle individual e local, não governança de comunidade.',
    targetUsers: ['Usuários de redes sociais', 'Profissionais que buscam foco', 'Criadores', 'Pesquisadores de UX'],
    projectType: 'llm-app',
    categories: ['IA aplicada', 'Privacidade'],
    tags: ['Browser extension', 'Social media', 'Local AI', 'Filtering', 'Privacy'],
  },
  {
    rank: 8,
    name: 'Debug-agent',
    repo: 'https://github.com/millionco/debug-agent',
    title: 'Debug-agent: depuração com evidência de runtime para agentes de código',
    summary:
      'Debug-agent instala um fluxo para Claude Code ou Cursor em que a IA injeta logs NDJSON, pede reprodução do bug, analisa evidência real e só então escreve a correção.',
    whatItDoes:
      'Em vez de adivinhar pela leitura estática do código, o agente cria instrumentação leve, coleta logs durante a reprodução, confirma ou rejeita hipóteses e verifica a correção automaticamente.',
    whenToUse:
      'Use para bugs reproduzíveis em que o agente costuma propor correções frágeis sem observar o comportamento real. É útil em frontends, APIs e fluxos com estado difícil de inferir.',
    whenNotToUse:
      'Evite em ambientes de produção ou dados sensíveis sem revisar exatamente quais logs serão inseridos. Instrumentação temporária precisa ser controlada e removida.',
    targetUsers: ['Desenvolvedores', 'Usuários de Cursor', 'Usuários de Claude Code', 'Times de QA'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'Qualidade de software'],
    tags: ['Debugging', 'Claude Code', 'Cursor', 'NDJSON', 'Runtime logs', 'Testing'],
  },
  {
    rank: 9,
    name: 'Hermes HUD',
    repo: 'https://github.com/joeynyc/hermes-hudui',
    title: 'Hermes HUD: painel de consciência operacional para agentes Hermes',
    summary:
      'Hermes HUD monitora no navegador memórias, sessões, skills e custos por modelo de um agente Hermes lendo diretamente o diretório local de dados.',
    whatItDoes:
      'O projeto oferece uma interface visual para observar o estado interno do agente: vaults de memória, sessões ativas, skills carregadas e custo estimado de tokens por modelo em tempo real.',
    whenToUse:
      'Use se você já opera Hermes e precisa entender o que o agente está carregando, gastando e lembrando durante execuções autônomas ou longas.',
    whenNotToUse:
      'Evite como ferramenta genérica de observabilidade para qualquer agente. O valor depende de compatibilidade com a estrutura local de dados do Hermes.',
    targetUsers: ['Operadores de agentes', 'Usuários Hermes', 'Engenheiros de automação', 'Times que monitoram custo de LLM'],
    projectType: 'developer-tool',
    categories: ['IA e agentes', 'Observabilidade'],
    tags: ['Hermes', 'HUD', 'Observability', 'Token cost', 'Skills', 'Memory'],
  },
  {
    rank: 10,
    name: 'ShichiZip',
    repo: 'https://github.com/idawnlight/ShichiZip',
    title: 'ShichiZip: alternativa nativa ao 7-Zip para macOS',
    summary:
      'ShichiZip é um derivado nativo de 7-Zip para macOS, escrito em Swift e Objective-C++, com suporte ao formato 7z e compressão moderna com Zstandard.',
    whatItDoes:
      'A ferramenta busca preencher o espaço deixado pelo 7-Zip no macOS sem Electron ou interface genérica multiplataforma, rodando de forma nativa em Apple Silicon.',
    whenToUse:
      'Use quando você precisa de uma ferramenta de compressão nativa no Mac, especialmente para arquivos 7z, fluxos offline e uso frequente em desktop.',
    whenNotToUse:
      'Evite se a prioridade é automação CLI universal ou compatibilidade corporativa já padronizada em outra solução. O foco aqui é experiência desktop macOS.',
    targetUsers: ['Usuários macOS', 'Desenvolvedores', 'Power users', 'Times que lidam com arquivos grandes'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Desktop'],
    tags: ['macOS', '7-Zip', 'Swift', 'Compression', 'Apple Silicon', 'Desktop'],
  },
  {
    rank: 11,
    name: 'Quip Node Manager',
    repo: 'https://github.com/QuipNetwork/quip-node-manager',
    title: 'Quip Node Manager: GUI local para configurar e monitorar nodes',
    summary:
      'Quip Node Manager é uma GUI desktop em Rust e Tauri v2 para configurar, rodar e monitorar nodes nativos ou Docker sem telemetria em nuvem.',
    whatItDoes:
      'O app gerencia arquivos TOML, secrets, binários e trust database em uma interface multiplataforma, oferecendo uma janela local para o estado real do node.',
    whenToUse:
      'Use quando operar nodes exige menos terminal e mais visibilidade para configuração, status, logs e segredos locais em macOS, Linux ou Windows.',
    whenNotToUse:
      'Evite se você precisa de orquestração multi-node em nuvem, observabilidade centralizada ou workflows empresariais com aprovação e auditoria remota.',
    targetUsers: ['Operadores de nodes', 'DevOps', 'Usuários Docker', 'Projetos descentralizados'],
    projectType: 'infra',
    categories: ['Infra', 'Desktop'],
    tags: ['Tauri', 'Rust', 'Node manager', 'Docker', 'TOML', 'Desktop'],
  },
  {
    rank: 12,
    name: 'LiteParse',
    repo: 'https://github.com/jerryjliu/liteparse_samples',
    title: 'LiteParse: fatos extraídos com evidência visual no documento',
    summary:
      'LiteParse gera relatórios HTML estruturados em que cada fato extraído de documentos aponta para o trecho exato da fonte com bounding box interativa.',
    whatItDoes:
      'A proposta é resolver a camada de verificação em fluxos documentais: o agente extrai fatos, mas também mostra onde cada afirmação aparece no PDF ou documento original.',
    whenToUse:
      'Use para workflows legais, financeiros, acadêmicos ou técnicos em que a extração precisa ser auditável e cada fato deve voltar para uma evidência visual.',
    whenNotToUse:
      'Evite quando a tarefa é apenas sumarização informal. O valor aparece quando precisão e rastreabilidade importam mais que velocidade.',
    targetUsers: ['Advogados', 'Analistas financeiros', 'Pesquisadores', 'Times de compliance'],
    projectType: 'data-ai',
    categories: ['Data/AI', 'Documentos'],
    tags: ['Document parsing', 'Evidence', 'PDF', 'Verification', 'Bounding boxes', 'Reports'],
  },
  {
    rank: 13,
    name: 'Rattles',
    repo: 'https://github.com/vyfor/rattles',
    title: 'Rattles: spinners Rust sem runtime e sem dependências',
    summary:
      'Rattles é uma biblioteca Rust de animações para terminal com dados de spinner gerados em tempo de compilação, sem dependências e compatível com no_std.',
    whatItDoes:
      'O projeto embute padrões Braille, emoji e ASCII diretamente no binário, para uso em loops de renderização como ratatui sem lifecycle complexo nem overhead de runtime.',
    whenToUse:
      'Use em TUIs Rust, ferramentas CLI e ambientes restritos onde dependências e runtime extra precisam ser mínimos.',
    whenNotToUse:
      'Evite se você precisa de um framework completo de progresso, barras, tarefas assíncronas e gerenciamento de estado. Rattles resolve a animação, não a UX inteira.',
    targetUsers: ['Desenvolvedores Rust', 'Autores de CLI', 'Usuários ratatui', 'Projetos no_std'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Rust'],
    tags: ['Rust', 'TUI', 'no_std', 'Spinner', 'Ratatui', 'CLI'],
  },
  {
    rank: 14,
    name: 'Helixent',
    repo: 'https://github.com/MagicCube/helixent',
    title: 'Helixent: loops ReAct mínimos em TypeScript e Bun',
    summary:
      'Helixent é uma biblioteca TypeScript leve, baseada em Bun, para construir agentes ReAct com raciocínio, planejamento, execução e ferramentas sem framework pesado.',
    whatItDoes:
      'O projeto oferece blocos mínimos para loops autônomos, execução de tools e skills CLI, focando velocidade e controle em vez de uma plataforma de orquestração completa.',
    whenToUse:
      'Use quando você quer montar um agente customizado em TypeScript, entender o loop cognitivo e manter pouca dependência de frameworks grandes.',
    whenNotToUse:
      'Evite se você precisa de memória, tracing, avaliação, multiagente, filas, autenticação e painel prontos. A proposta é base crua, não produto completo.',
    targetUsers: ['Desenvolvedores TypeScript', 'Builders de agentes', 'Usuários Bun', 'Pesquisadores de ReAct'],
    projectType: 'ai-agent',
    categories: ['IA e agentes', 'TypeScript'],
    tags: ['ReAct', 'Bun', 'TypeScript', 'Agents', 'Tool calling', 'CLI skills'],
  },
  {
    rank: 15,
    name: 'tsnapi',
    repo: 'https://github.com/antfu/tsnapi',
    title: 'tsnapi: snapshots para contratos públicos de APIs TypeScript',
    summary:
      'tsnapi gera snapshots legíveis de exports runtime e declarações TypeScript para detectar mudanças acidentais na API pública antes de publicar uma nova versão.',
    whatItDoes:
      'A ferramenta cria arquivos .snapshot.js e .snapshot.d.ts em cada build, permitindo revisar diferenças no contrato público de pacotes JavaScript/TypeScript.',
    whenToUse:
      'Use em bibliotecas, packages internos e SDKs onde uma refatoração aparentemente simples pode quebrar consumidores sem alterar testes funcionais.',
    whenNotToUse:
      'Evite como substituto de testes de comportamento. Snapshots de API detectam quebra de superfície pública, não garantem semântica correta.',
    targetUsers: ['Mantenedores de bibliotecas', 'Autores de SDK', 'Times TypeScript', 'Open source maintainers'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Qualidade de software'],
    tags: ['TypeScript', 'API contract', 'Snapshot testing', 'Libraries', 'Build tools'],
  },
  {
    rank: 16,
    name: 'Miniblue',
    repo: 'https://github.com/moabukar/miniblue',
    title: 'Miniblue: Azure local em um único comando Docker',
    summary:
      'Miniblue simula localmente 21 serviços Azure, incluindo Blob Storage, Key Vault, Cosmos DB e Azure Functions, em um único endpoint Docker.',
    whatItDoes:
      'A ferramenta substitui a necessidade de múltiplos emuladores locais, funcionando com SDKs Azure, Terraform e Pulumi sem conta Azure, rede externa ou cartão de crédito.',
    whenToUse:
      'Use em desenvolvimento local, testes de integração e onboarding de times que dependem de serviços Azure mas não querem configurar vários emuladores separados.',
    whenNotToUse:
      'Evite assumir paridade perfeita com a nuvem. Emuladores aceleram desenvolvimento, mas diferenças de comportamento precisam ser validadas no Azure real antes de produção.',
    targetUsers: ['Desenvolvedores Azure', 'DevOps', 'Times de plataforma', 'Usuários Terraform/Pulumi'],
    projectType: 'infra',
    categories: ['Infra', 'Cloud local'],
    tags: ['Azure', 'Docker', 'Emulator', 'Cosmos DB', 'Functions', 'Terraform'],
  },
  {
    rank: 17,
    name: 'Tmux Agent Sidebar',
    repo: 'https://github.com/hiroppy/tmux-agent-sidebar',
    title: 'Tmux Agent Sidebar: painel lateral para sessões Claude Code em tmux',
    summary:
      'Tmux-agent-sidebar acompanha status, prompts, drift Git e logs de atividade de agentes rodando em múltiplos panes tmux.',
    whatItDoes:
      'A ferramenta cria uma sidebar em tempo real para mostrar quais repositórios estão ativos, quais agentes aguardam input e permite saltar direto para o pane certo.',
    whenToUse:
      'Use se você opera vários agentes simultaneamente em tmux e perde tempo descobrindo qual sessão precisa de atenção.',
    whenNotToUse:
      'Evite se seu fluxo é uma única sessão de agente ou se você não usa tmux. O valor cresce com paralelismo e múltiplos repositórios.',
    targetUsers: ['Usuários de Claude Code', 'Power users tmux', 'Engenheiros com vários worktrees', 'Operadores de agentes'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'Terminal'],
    tags: ['tmux', 'Claude Code', 'Agents', 'Sidebar', 'Git drift', 'Terminal'],
  },
  {
    rank: 18,
    name: 'File Converter Pro',
    repo: 'https://github.com/Hyacinthe-primus/File_Converter_Pro',
    title: 'File Converter Pro: conversor offline de arquivos para Windows',
    summary:
      'File Converter Pro é um app Windows offline para converter documentos, imagens, áudio e vídeo com fallback entre Office, LibreOffice e FFmpeg.',
    whatItDoes:
      'O projeto reúne conversões locais em uma interface desktop, detecta engines instaladas para melhorar qualidade e adiciona dashboard, conquistas e efeitos visuais.',
    whenToUse:
      'Use quando a prioridade é converter arquivos sem enviar dados para serviços externos, especialmente em máquinas Windows com Office, LibreOffice ou FFmpeg disponíveis.',
    whenNotToUse:
      'Evite em pipelines server-side ou automações headless. O foco é aplicativo desktop e experiência de usuário, não infraestrutura de conversão em lote.',
    targetUsers: ['Usuários Windows', 'Times administrativos', 'Profissionais de mídia', 'Usuários offline'],
    projectType: 'developer-tool',
    categories: ['Desktop', 'Automação'],
    tags: ['Windows', 'File conversion', 'FFmpeg', 'LibreOffice', 'Offline', 'Desktop'],
  },
  {
    rank: 19,
    name: 'llmwiki',
    repo: 'https://github.com/lucasastorian/llmwiki',
    title: 'llmwiki: base de conhecimento Markdown mantida por LLM',
    summary:
      'llmwiki implementa a ideia de uma wiki persistente em Markdown, onde um LLM sintetiza artigos, detecta contradições e atualiza referências cruzadas.',
    whatItDoes:
      'Em vez de recuperar sempre chunks crus como no RAG clássico, o projeto faz o modelo escrever e manter uma base enciclopédica com páginas estruturadas a partir de PDFs e fontes conectadas via MCP.',
    whenToUse:
      'Use como referência quando o problema é transformar documentos em conhecimento persistente e legível, com artigos atualizados ao longo do tempo.',
    whenNotToUse:
      'Evite sem revisão humana em domínios de alto risco. Uma wiki mantida por LLM pode organizar bem, mas também precisa de governança contra erro e alucinação.',
    targetUsers: ['Pesquisadores', 'Usuários Obsidian/Markdown', 'Times de documentação', 'Builders de RAG'],
    projectType: 'llm-app',
    categories: ['Knowledge management', 'RAG'],
    tags: ['RAG', 'Markdown', 'Wiki', 'MCP', 'Knowledge base', 'Contradictions'],
  },
  {
    rank: 20,
    name: 'HiVG',
    repo: 'https://github.com/ximinng/HiVG',
    title: 'HiVG: compressão hierárquica para gerar SVG com modelos visuais',
    summary:
      'HiVG comprime comandos SVG em tokens hierárquicos para reduzir contexto e melhorar conversão de imagem ou texto para SVG editável.',
    whatItDoes:
      'O projeto transforma comandos brutos em tokens atômicos e segmentos aprendidos, reduzindo a sequência usada pelo modelo e competindo em tarefas de image-to-SVG e text-to-SVG.',
    whenToUse:
      'Use como referência de pesquisa para geração vetorial, compressão de representação SVG e pipelines que precisam converter imagens raster em vetores editáveis.',
    whenNotToUse:
      'Evite esperar uma ferramenta de design pronta para usuário final. A descrição aponta mais para modelo/pesquisa do que para app plug-and-play.',
    targetUsers: ['Pesquisadores de visão', 'ML engineers', 'Design tooling builders', 'Times de geração visual'],
    projectType: 'data-ai',
    categories: ['Pesquisa IA', 'Design tools'],
    tags: ['SVG', 'Image-to-SVG', 'Vision model', 'Vector graphics', 'Compression', 'ML'],
  },
  {
    rank: 21,
    name: 'claude-obsidian',
    repo: 'https://github.com/AgriciDaniel/claude-obsidian',
    title: 'claude-obsidian: Claude escrevendo e organizando notas no Obsidian',
    summary:
      'claude-obsidian usa Claude para ler fontes, extrair entidades, cruzar conceitos e arquivar notas automaticamente em um vault Obsidian.',
    whatItDoes:
      'O projeto vai além de chat com notas: ele cria conteúdo, decide conexões, referencia páginas existentes e inclui um linter de vault com categorias para encontrar órfãos e links mortos.',
    whenToUse:
      'Use se seu objetivo é transformar inputs variados em notas conectadas, reduzindo decisão manual de tags, pastas e backlinks.',
    whenNotToUse:
      'Evite entregar controle total do vault sem backups. Automação de notas pode criar muito ruído se a taxonomia e os critérios editoriais não estiverem claros.',
    targetUsers: ['Usuários Obsidian', 'Pesquisadores', 'Criadores de conteúdo', 'Profissionais com second brain'],
    projectType: 'llm-app',
    categories: ['Knowledge management', 'IA aplicada'],
    tags: ['Obsidian', 'Claude', 'Notes', 'Knowledge graph', 'Vault linter', 'Second brain'],
  },
  {
    rank: 22,
    name: 'StyleSeed',
    repo: 'https://github.com/bitjaru/styleseed',
    title: 'StyleSeed: regras, componentes e skills para UIs melhores com agentes',
    summary:
      'StyleSeed reúne regras visuais estritas, componentes e skills instaláveis para ajudar agentes de IA a gerar interfaces mais intencionais.',
    whatItDoes:
      'O projeto oferece um motor de design com regras como sombras discretas, proporções tipográficas, skins inspiradas em Stripe, Linear e Vercel, além de componentes reutilizáveis.',
    whenToUse:
      'Use quando agentes já constroem UIs funcionais, mas o resultado visual ainda parece genérico, desalinhado ou sem sistema de design.',
    whenNotToUse:
      'Evite usar como substituto de direção visual real de marca. StyleSeed melhora consistência e baseline, mas ainda precisa de curadoria para contexto específico.',
    targetUsers: ['Frontends', 'Design engineers', 'Usuários de agentes de código', 'Times SaaS'],
    projectType: 'frontend',
    categories: ['Frontend', 'Design tools'],
    tags: ['UI', 'Design system', 'AI skills', 'Components', 'Vercel', 'Linear'],
  },
  {
    rank: 23,
    name: 'SIP',
    repo: 'https://github.com/standardagents/sip',
    title: 'SIP: processamento de imagem eficiente para Cloudflare Workers',
    summary:
      'SIP é uma biblioteca de processamento de imagem com baixíssimo uso de memória, pensada para rodar em Cloudflare Workers e ambientes edge restritos.',
    whatItDoes:
      'A biblioteca permite redimensionar, processar e otimizar imagens sem enviar payloads para backends pesados, mantendo o processamento perto da requisição.',
    whenToUse:
      'Use em aplicações edge, pipelines de upload, otimização de imagens e preparação de inputs para agentes de visão quando memória é o gargalo principal.',
    whenNotToUse:
      'Evite se você precisa de um pacote completo de manipulação avançada como Sharp em ambiente sem restrições. SIP é interessante justamente pela restrição de memória.',
    targetUsers: ['Desenvolvedores edge', 'Usuários Cloudflare Workers', 'Builders de apps de imagem', 'Times de IA multimodal'],
    projectType: 'backend',
    categories: ['Infra', 'Imagem'],
    tags: ['Cloudflare Workers', 'Image processing', 'Edge', 'Memory efficient', 'Vision agents'],
  },
  {
    rank: 24,
    name: 'SwiftMTP',
    repo: 'https://github.com/Neighbor-Z/SwiftMTP',
    title: 'SwiftMTP: transferência Android no macOS com interface SwiftUI',
    summary:
      'SwiftMTP é um utilitário macOS nativo em SwiftUI para transferir arquivos Android via MTP com interface estilo Finder e suporte a arquivos grandes.',
    whatItDoes:
      'O app usa o backend kalam do OpenMTP, remove a camada web e oferece detecção automática do telefone, drag-and-drop e transferências acima de 4GB.',
    whenToUse:
      'Use quando você precisa mover arquivos entre Android e Mac com uma experiência nativa e mais leve que alternativas baseadas em web app.',
    whenNotToUse:
      'Evite se a necessidade é sincronização cloud, backup automático ou gerenciamento corporativo de dispositivos. O foco é transferência local direta.',
    targetUsers: ['Usuários macOS', 'Usuários Android', 'Criadores de mídia', 'Power users'],
    projectType: 'developer-tool',
    categories: ['Desktop', 'Mobile'],
    tags: ['macOS', 'SwiftUI', 'Android', 'MTP', 'File transfer', 'OpenMTP'],
  },
  {
    rank: 25,
    name: 'remocn',
    repo: 'https://github.com/kapishdima/remocn',
    title: 'remocn: componentes shadcn-style para vídeos em Remotion',
    summary:
      'remocn é um registry no estilo shadcn para Remotion, com reveals, wipes, terminal simulator, cenas de browser e composições de trailer prontas para editar.',
    whatItDoes:
      'O projeto preenche uma lacuna do Remotion: componentes reutilizáveis de motion design para quem cria vídeos com React, sem reescrever toda transição do zero.',
    whenToUse:
      'Use em vídeos de produto, demos, trailers, aulas e peças automatizadas onde React já é a ferramenta principal de composição.',
    whenNotToUse:
      'Evite se você precisa de edição visual tradicional com timeline manual. remocn é para pipeline React/Remotion, não para substituir DaVinci ou Premiere.',
    targetUsers: ['Usuários Remotion', 'Design engineers', 'Criadores de vídeo', 'Times de marketing técnico'],
    projectType: 'frontend',
    categories: ['Vídeo', 'Frontend'],
    tags: ['Remotion', 'React', 'Video', 'shadcn', 'Motion design', 'Components'],
  },
  {
    rank: 26,
    name: 'Coderaft',
    repo: 'https://github.com/pithings/coderaft',
    title: 'Coderaft: VS Code no navegador em um pacote npm pequeno',
    summary:
      'Coderaft empacota uma instância funcional do VS Code em um pacote npm de 25MB, sem dependências, para acesso via navegador ou embedding em apps.',
    whatItDoes:
      'A proposta é facilitar ambientes remotos de desenvolvimento e integração de um editor robusto em aplicações web sem carregar uma pilha pesada.',
    whenToUse:
      'Use quando você quer oferecer edição de código no navegador, sandboxes remotos ou ambientes dev embarcados com pouca sobrecarga de instalação.',
    whenNotToUse:
      'Evite se você precisa de toda a compatibilidade de extensões e configurações de um VS Code desktop tradicional. Embedding geralmente exige trade-offs.',
    targetUsers: ['Builders de IDE web', 'Plataformas de educação', 'DevTools SaaS', 'Times de sandbox'],
    projectType: 'developer-tool',
    categories: ['DevTools', 'Frontend'],
    tags: ['VS Code', 'Web IDE', 'npm', 'Remote development', 'Editor'],
  },
  {
    rank: 27,
    name: 'Boxsh',
    repo: 'https://github.com/xicilion/boxsh',
    title: 'Boxsh: shell POSIX sandboxed para agentes de IA',
    summary:
      'Boxsh é um shell POSIX baseado em Dash, com isolamento por Linux namespaces e protocolo JSON-line RPC concorrente para uso seguro por agentes.',
    whatItDoes:
      'A ferramenta cria uma camada onde agentes podem rodar builds, instalar pacotes e executar scripts dentro de um sandbox, reduzindo risco ao host.',
    whenToUse:
      'Use como referência ou componente quando agentes precisam executar comandos reais, mas o ambiente precisa limitar dano, escopo e concorrência.',
    whenNotToUse:
      'Evite tratar sandbox como segurança absoluta. Ainda é preciso controlar mounts, rede, permissões, limites de recursos e comandos destrutivos.',
    targetUsers: ['Builders de agentes', 'Security engineers', 'Plataformas de CI', 'DevTools'],
    projectType: 'security',
    categories: ['Segurança', 'IA e agentes'],
    tags: ['Sandbox', 'POSIX shell', 'Linux namespaces', 'AI agents', 'RPC', 'Security'],
  },
  {
    rank: 28,
    name: 'hw-smi',
    repo: 'https://github.com/ProjectPhysX/hw-smi',
    title: 'hw-smi: telemetria de GPU e hardware em ASCII no terminal',
    summary:
      'hw-smi monitora GPUs Nvidia, AMD e Intel em Windows e Linux, exibindo temperatura, energia, clocks, PCIe e VRAM em visualização ASCII.',
    whatItDoes:
      'O projeto lê APIs de baixo nível de fornecedores e apresenta métricas de hardware em um terminal retrô, sem ficar preso a um único vendor.',
    whenToUse:
      'Use para acompanhar máquinas de desenvolvimento, workstations de IA, rigs multi-GPU e ambientes onde nvidia-smi não cobre todo o hardware.',
    whenNotToUse:
      'Evite como substituto de observabilidade histórica, alertas e dashboards de produção. É uma ferramenta de leitura local e operacional.',
    targetUsers: ['ML engineers', 'Usuários GPU', 'Gamers técnicos', 'DevOps local'],
    projectType: 'infra',
    categories: ['Infra', 'Terminal'],
    tags: ['GPU', 'Hardware monitoring', 'Nvidia', 'AMD', 'Intel', 'Terminal'],
  },
  {
    rank: 29,
    name: 'cli-to-js',
    repo: 'https://github.com/millionco/cli-to-js',
    title: 'cli-to-js: transforme comandos CLI em APIs JavaScript tipadas',
    summary:
      'cli-to-js lê o help output de binários locais e gera uma API JavaScript tipada, convertendo subcomandos em funções e flags em propriedades.',
    whatItDoes:
      'A ideia é reduzir comandos shell frágeis em agentes: em vez de concatenar flags, o agente chama uma função JS estruturada gerada a partir da CLI real.',
    whenToUse:
      'Use quando agentes precisam operar ferramentas de terminal com muitos subcomandos e flags, especialmente se erros de sintaxe quebram automações.',
    whenNotToUse:
      'Evite se o help da CLI é inconsistente, incompleto ou muda com frequência. A API gerada depende da qualidade da introspecção.',
    targetUsers: ['Builders de agentes', 'Desenvolvedores Node.js', 'DevOps', 'Autores de automação'],
    projectType: 'developer-tool',
    categories: ['DevTools com IA', 'Automação'],
    tags: ['CLI', 'JavaScript', 'TypeScript', 'Agents', 'Automation', 'Shell'],
  },
  {
    rank: 30,
    name: 'Mesurer',
    repo: 'https://github.com/ibelick/mesurer',
    title: 'Mesurer: overlay de medidas e alinhamento para apps React',
    summary:
      'Mesurer adiciona um overlay para React que mede bounding boxes, cria guias, mostra distâncias em pixels e preserva estado entre refreshes.',
    whatItDoes:
      'A ferramenta permite alternar uma camada de inspeção visual por atalho, clicar elementos, medir distâncias com Alt e desfazer/refazer guias de alinhamento.',
    whenToUse:
      'Use durante polimento visual de interfaces React, revisão de espaçamento, handoff de design e ajustes finos de alinhamento.',
    whenNotToUse:
      'Evite deixar ativo em produção pública sem controle. É uma ferramenta de desenvolvimento e revisão visual, não componente de UX final.',
    targetUsers: ['Frontends React', 'Design engineers', 'Designers de produto', 'Times de QA visual'],
    projectType: 'frontend',
    categories: ['Frontend', 'Design tools'],
    tags: ['React', 'Measurement', 'Alignment', 'Design QA', 'Overlay', 'UI polish'],
  },
  {
    rank: 31,
    name: 'personalized-podcast',
    repo: 'https://github.com/zarazhangrui/personalized-podcast',
    title: 'personalized-podcast: podcasts personalizados com Claude, Fish Audio e ffmpeg',
    summary:
      'personalized-podcast transforma URLs, PDFs, transcrições e dados pessoais em roteiros de conversa com dois hosts, voz sintética e MP3 final.',
    whatItDoes:
      'O projeto usa Claude para escrever o roteiro, Fish Audio para gerar fala e ffmpeg para montar o áudio, permitindo podcasts customizados sobre documentos ou histórico pessoal.',
    whenToUse:
      'Use para prototipar formatos de áudio personalizados, resumos conversacionais, conteúdo educacional e experiências de IA com tom narrativo.',
    whenNotToUse:
      'Evite processar dados pessoais sensíveis sem consentimento e revisão. Um podcast sobre histórico, currículo ou navegação pode expor informação íntima.',
    targetUsers: ['Criadores de conteúdo', 'Educadores', 'Builders de IA multimodal', 'Usuários de automação pessoal'],
    projectType: 'llm-app',
    categories: ['Áudio e vídeo', 'IA aplicada'],
    tags: ['Podcast', 'Claude', 'Fish Audio', 'ffmpeg', 'Personalization', 'Audio'],
  },
  {
    rank: 32,
    name: 'ProgressiveBlurHeader',
    repo: 'https://github.com/dominikmartn/ProgressiveBlurHeader',
    title: 'ProgressiveBlurHeader: blur progressivo estilo Apple em SwiftUI',
    summary:
      'ProgressiveBlurHeader implementa headers SwiftUI com blur progressivo suave conforme o conteúdo rola por baixo, usando uma API privada da Apple.',
    whatItDoes:
      'O componente resolve cortes duros e máscaras ruins ao recriar o efeito visual de apps como Apple Music, Fotos e App Store em uma linha de código.',
    whenToUse:
      'Use em protótipos, apps pessoais ou interfaces SwiftUI onde o efeito visual é importante e você aceita o trade-off técnico da implementação.',
    whenNotToUse:
      'Evite em apps de produção para App Store sem avaliar risco: o uso de API privada pode criar problemas de revisão e compatibilidade futura.',
    targetUsers: ['Desenvolvedores iOS', 'Design engineers mobile', 'Usuários SwiftUI', 'Prototipadores'],
    projectType: 'frontend',
    categories: ['Mobile', 'Frontend'],
    tags: ['SwiftUI', 'iOS', 'Blur', 'Apple UI', 'Private API', 'Header'],
  },
  {
    rank: 33,
    name: 'PureMac',
    repo: 'https://github.com/momenbasel/PureMac',
    title: 'PureMac: alternativa open source e offline ao CleanMyMac',
    summary:
      'PureMac limpa caches, junk do sistema, derived data do Xcode, caches Homebrew e snapshots APFS com inspeção antes da remoção.',
    whatItDoes:
      'O app MIT roda offline, sem analytics, mostra o que será apagado antes da confirmação e inclui scheduler em background para automação.',
    whenToUse:
      'Use se você quer uma ferramenta transparente para manutenção local do macOS, especialmente em máquinas de desenvolvimento com Xcode e Homebrew.',
    whenNotToUse:
      'Evite apagar categorias sem revisar. Ferramentas de limpeza podem remover caches úteis ou estados que algum fluxo local esperava manter.',
    targetUsers: ['Usuários macOS', 'Desenvolvedores iOS', 'Power users', 'Usuários Homebrew'],
    projectType: 'developer-tool',
    categories: ['Desktop', 'macOS'],
    tags: ['macOS', 'Cleanup', 'Xcode', 'Homebrew', 'Offline', 'MIT'],
  },
  {
    rank: 34,
    name: 'hypatia',
    repo: 'https://github.com/MarchLiu/hypatia',
    title: 'hypatia: memória leve em Rust com SQLite FTS5 e DuckDB',
    summary:
      'hypatia é um sistema de memória em Rust que usa SQLite FTS5, DuckDB e uma linguagem JSON de consulta, sem depender de embeddings ou vector database.',
    whatItDoes:
      'O projeto explora uma alternativa leve a memórias baseadas em vetores, combinando busca textual, consulta estruturada e armazenamento local para agentes.',
    whenToUse:
      'Use como referência quando custo, simplicidade, portabilidade e auditabilidade importam mais que similaridade semântica neural.',
    whenNotToUse:
      'Evite se o problema exige busca semântica rica, relações inferidas por embeddings ou recuperação fuzzy multilíngue. A proposta é deliberadamente diferente de vector RAG.',
    targetUsers: ['Builders de agentes', 'Desenvolvedores Rust', 'Arquitetos de RAG', 'Times locais/offline'],
    projectType: 'data-ai',
    categories: ['RAG', 'Data/AI'],
    tags: ['Rust', 'Memory', 'SQLite FTS5', 'DuckDB', 'JSON query', 'Agents'],
  },
  {
    rank: 35,
    name: 'sciwrite',
    repo: 'https://github.com/labarba/sciwrite',
    title: 'sciwrite: skill de edição científica baseada em Writing in the Sciences',
    summary:
      'sciwrite transforma a metodologia do curso Writing in the Sciences, de Kristin Sainani em Stanford, em uma skill para edição científica por IA.',
    whatItDoes:
      'A skill orienta o agente a revisar texto acadêmico, apontar voz passiva, reduzir jargão, explicar frases truncadas e aplicar critérios claros de escrita científica.',
    whenToUse:
      'Use para melhorar clareza de papers, relatórios técnicos, propostas acadêmicas e textos científicos que precisam ficar mais diretos sem perder rigor.',
    whenNotToUse:
      'Evite delegar julgamento científico ao editor. A skill melhora escrita e argumentação, mas não valida método, dados ou conclusão.',
    targetUsers: ['Pesquisadores', 'Estudantes de pós-graduação', 'Editores científicos', 'Times técnicos'],
    projectType: 'learning',
    categories: ['Aprendizado', 'Escrita técnica'],
    tags: ['Scientific writing', 'AI skill', 'Stanford', 'Editing', 'Academic writing'],
  },
]

function repoParts(repoUrl: string) {
  const url = new URL(repoUrl)
  const [owner, repo] = url.pathname.split('/').filter(Boolean)
  if (!owner || !repo) throw new Error(`Repo invalido: ${repoUrl}`)
  return { owner, repo: repo.replace(/\.git$/, '') }
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

async function fetchGithubMeta(owner: string, repo: string): Promise<GithubRepoMeta | null> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'BitflixCatalogSeed/1.0 (+https://bitflix.com.br)',
    },
  })
  if (!response.ok) {
    console.warn(`GitHub metadata indisponivel para ${owner}/${repo}: HTTP ${response.status}`)
    return fallbackGithubMeta[`${owner}/${repo}`] ?? null
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
    excerpt: seed.summary.slice(0, 278),
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
    summary_pt_br: seed.summary.slice(0, 500),
    what_it_does: seed.whatItDoes,
    when_to_use: seed.whenToUse,
    when_not_to_use: seed.whenNotToUse,
    target_users: seed.targetUsers.map((label) => ({ label })),
    project_type: seed.projectType,
    categories: categoryIds,
    tags: tagIds,
    last_checked_at: new Date().toISOString(),
    readme_excerpt: seed.summary.slice(0, 1200),
    discovery_source_url: 'https://githubawesome.com/github-trending-weekly-30/',
    discovery_source_name: 'Github Awesome weekly #30',
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

  const existing = await findOneBySlug(payload, 'open-source-catalog-entries', entrySlug(seed))
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

async function main() {
  const payload = await getPayload({ config })
  const authorId = await ensureAuthor(payload)
  const indexedDocs: Array<Record<string, unknown>> = []

  const existingImport = await payload.find({
    collection: 'open-source-catalog-imports',
    where: {
      and: [
        { source_url: { equals: 'https://githubawesome.com/github-trending-weekly-30/' } },
        { source_name: { equals: 'Github Awesome weekly #30' } },
      ],
    },
    limit: 1,
    sort: 'createdAt',
  })

  const importData = {
    source_url: 'https://githubawesome.com/github-trending-weekly-30/',
    source_name: 'Github Awesome weekly #30',
    requested_by: 'Milton Bastos via Codex',
    status: 'done',
    repos_found_count: seeds.length,
    repos_imported_count: seeds.length,
    repos_skipped_count: 0,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    notes:
      'Lote criado a partir do conteúdo colado pelo usuário no chat. Artigos e entradas do catálogo foram publicados; textos editoriais são originais Bitflix baseados em descrição fornecida e metadados públicos do GitHub.',
  } as const

  const importRecord = existingImport.docs[0]?.id
    ? await payload.update({
        collection: 'open-source-catalog-imports',
        id: existingImport.docs[0].id,
        data: importData as never,
      })
    : await payload.create({
        collection: 'open-source-catalog-imports',
        data: importData,
      })

  for (const seed of seeds) {
    const { owner, repo } = repoParts(seed.repo)
    const meta = await fetchGithubMeta(owner, repo)
    const categoryIds = await Promise.all(seed.categories.map((name) => ensureTerm(payload, 'categories', name)))
    const tagIds = await Promise.all(seed.tags.map((name) => ensureTerm(payload, 'tags', name)))
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
      stars: meta?.stargazers_count ?? 0,
      summary: seed.summary,
      whatItDoes: seed.whatItDoes,
      whenToUse: seed.whenToUse,
      whenNotToUse: seed.whenNotToUse,
      targetUsers: seed.targetUsers,
      tags: seed.tags,
      githubTopics: meta?.topics ?? [],
    })

    console.log(`✓ ${seed.rank}. ${seed.name} -> /blog/${article.slug}`)
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        total: indexedDocs.length,
        importId: importRecord.id,
        docs: indexedDocs,
      },
      null,
      2,
    ),
  )
}

await main()
